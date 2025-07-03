import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

export interface Channel {
  id: string;
  name: string;
  type: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inbox {
  id: string;
  name: string;
  channel_id: string;
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  channel?: Channel;
}

export interface CreateInboxData {
  name: string;
  channel_id: string;
  settings?: Record<string, any>;
}

export interface UpdateInboxData {
  name?: string;
  channel_id?: string;
  settings?: Record<string, any>;
  is_active?: boolean;
}

export interface InboxAgent {
  inbox_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

@Injectable()
export class InboxesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(userId?: string): Promise<Inbox[]> {
    const adminSupabase = this.supabaseService.getAdminClient();
    
    try {
      let inboxIds: string[] = [];

      // Se userId for fornecido, buscar primeiro os IDs das inboxes que o usuário tem acesso
      if (userId) {
        const { data: profile, error: profileError } = await adminSupabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          throw new InternalServerErrorException('Could not fetch user profile.');
        }

        // Se o usuário é admin, retornar todas as inboxes ativas
        if (profile?.role === 'ADMIN') {
          const { data, error } = await adminSupabase
            .from('inboxes')
            .select(`
              *,
              channel:channels(*)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching all inboxes for admin:', error);
            throw new InternalServerErrorException('Could not fetch inboxes.');
          }

          return data || [];
        }

        // Para não-admins, buscar apenas inboxes que têm acesso
        const { data: agentData, error: agentError } = await adminSupabase
          .from('inbox_agents')
          .select('inbox_id')
          .eq('user_id', userId);

        if (agentError) {
          console.error('Error fetching user inbox access:', agentError);
          throw new InternalServerErrorException('Could not fetch inbox access.');
        }

        inboxIds = agentData?.map(agent => agent.inbox_id) || [];
        
        // Se o usuário não tem acesso a nenhuma inbox, retornar array vazio
        if (inboxIds.length === 0) {
          return [];
        }

        // Buscar inboxes específicas do usuário
        const { data, error } = await adminSupabase
          .from('inboxes')
          .select(`
            *,
            channel:channels(*)
          `)
          .eq('is_active', true)
          .in('id', inboxIds)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user inboxes:', error);
          throw new InternalServerErrorException('Could not fetch inboxes.');
        }

        return data || [];
      }

      // Se não foi fornecido userId, retornar todas as inboxes ativas (comportamento para casos especiais)
      const { data, error } = await adminSupabase
        .from('inboxes')
        .select(`
          *,
          channel:channels(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching inboxes:', error);
        throw new InternalServerErrorException('Could not fetch inboxes.');
      }

      return data || [];
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      console.error('Unexpected error in findAll inboxes:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve inboxes due to an unexpected error.',
      );
    }
  }

  async findOne(id: string): Promise<Inbox> {
    const adminSupabase = this.supabaseService.getAdminClient();
    
    try {
      const { data, error } = await adminSupabase
        .from('inboxes')
        .select(`
          *,
          channel:channels(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException(`Inbox with ID ${id} not found.`);
        }
        console.error(`Error fetching inbox ${id}:`, error);
        throw new InternalServerErrorException('Could not fetch inbox.');
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Unexpected error in findOne inbox ${id}:`, error);
      throw new InternalServerErrorException(`Failed to retrieve inbox ${id}.`);
    }
  }

  async create(createInboxData: CreateInboxData): Promise<Inbox> {
    const adminSupabase = this.supabaseService.getAdminClient();
    
    try {
      const { data, error } = await adminSupabase
        .from('inboxes')
        .insert({
          name: createInboxData.name,
          channel_id: createInboxData.channel_id,
          settings: createInboxData.settings || {},
          is_active: true,
        })
        .select(`
          *,
          channel:channels(*)
        `)
        .single();

      if (error) {
        console.error('Error creating inbox:', error);
        if (error.code === '23503') {
          throw new BadRequestException('Invalid channel ID provided.');
        }
        throw new InternalServerErrorException('Could not create inbox.');
      }

      return data;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      console.error('Unexpected error in create inbox:', error);
      throw new InternalServerErrorException(
        'Inbox creation failed due to unexpected error.',
      );
    }
  }

  async update(id: string, updateInboxData: UpdateInboxData): Promise<Inbox> {
    const adminSupabase = this.supabaseService.getAdminClient();
    
    try {
      const { data, error } = await adminSupabase
        .from('inboxes')
        .update({
          ...(updateInboxData.name && { name: updateInboxData.name }),
          ...(updateInboxData.channel_id && { channel_id: updateInboxData.channel_id }),
          ...(updateInboxData.settings && { settings: updateInboxData.settings }),
          ...(updateInboxData.is_active !== undefined && { is_active: updateInboxData.is_active }),
        })
        .eq('id', id)
        .select(`
          *,
          channel:channels(*)
        `)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException(`Inbox with ID ${id} not found.`);
        }
        if (error.code === '23503') {
          throw new BadRequestException('Invalid channel ID provided.');
        }
        console.error(`Error updating inbox ${id}:`, error);
        throw new InternalServerErrorException('Could not update inbox.');
      }

      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      console.error(`Unexpected error in update inbox ${id}:`, error);
      throw new InternalServerErrorException(
        'Inbox update failed due to unexpected error.',
      );
    }
  }

  async deactivate(id: string): Promise<Inbox> {
    return this.update(id, { is_active: false });
  }

  async reactivate(id: string): Promise<Inbox> {
    return this.update(id, { is_active: true });
  }

  async findChannels(): Promise<Channel[]> {
    const adminSupabase = this.supabaseService.getAdminClient();
    
    try {
      const { data, error } = await adminSupabase
        .from('channels')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching channels:', error);
        throw new InternalServerErrorException('Could not fetch channels.');
      }

      return data || [];
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      console.error('Unexpected error in findChannels:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve channels due to an unexpected error.',
      );
    }
  }

  async assignAgent(inboxId: string, userId: string, role: string = 'AGENT'): Promise<InboxAgent> {
    const adminSupabase = this.supabaseService.getAdminClient();
    
    try {
      const { data, error } = await adminSupabase
        .from('inbox_agents')
        .insert({
          inbox_id: inboxId,
          user_id: userId,
          role: role,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new ConflictException('Agent is already assigned to this inbox.');
        }
        if (error.code === '23503') {
          throw new BadRequestException('Invalid inbox ID or user ID provided.');
        }
        console.error(`Error assigning agent to inbox ${inboxId}:`, error);
        throw new InternalServerErrorException('Could not assign agent to inbox.');
      }

      return data;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      console.error(`Unexpected error in assignAgent for inbox ${inboxId}:`, error);
      throw new InternalServerErrorException(
        'Agent assignment failed due to unexpected error.',
      );
    }
  }

  async unassignAgent(inboxId: string, userId: string): Promise<void> {
    const adminSupabase = this.supabaseService.getAdminClient();
    
    try {
      const { error } = await adminSupabase
        .from('inbox_agents')
        .delete()
        .eq('inbox_id', inboxId)
        .eq('user_id', userId);

      if (error) {
        console.error(`Error unassigning agent from inbox ${inboxId}:`, error);
        throw new InternalServerErrorException('Could not unassign agent from inbox.');
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      console.error(`Unexpected error in unassignAgent for inbox ${inboxId}:`, error);
      throw new InternalServerErrorException(
        'Agent unassignment failed due to unexpected error.',
      );
    }
  }

  async getInboxAgents(inboxId: string): Promise<InboxAgent[]> {
    const adminSupabase = this.supabaseService.getAdminClient();
    
    try {
      const { data, error } = await adminSupabase
        .from('inbox_agents')
        .select('*')
        .eq('inbox_id', inboxId);

      if (error) {
        console.error(`Error fetching agents for inbox ${inboxId}:`, error);
        throw new InternalServerErrorException('Could not fetch inbox agents.');
      }

      return data || [];
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      console.error(`Unexpected error in getInboxAgents for inbox ${inboxId}:`, error);
      throw new InternalServerErrorException(
        'Failed to retrieve inbox agents due to an unexpected error.',
      );
    }
  }
}