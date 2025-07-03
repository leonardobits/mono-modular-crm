import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

export interface ConversationWithDetails {
  id: string;
  inbox_id: string;
  contact_id: string;
  status: 'open' | 'resolved' | 'pending' | 'snoozed';
  assigned_agent_id?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  last_message_at: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  contact: {
    id: string;
    name?: string;
    phone?: string;
    email?: string;
    platform: string;
  };
  assigned_agent?: {
    id: string;
    full_name: string;
    email: string;
  };
  unread_count?: number;
  last_message?: {
    id: string;
    content: string;
    sender_type: string;
    message_type: string;
    created_at: string;
  };
}

export interface MessageWithSender {
  id: string;
  conversation_id: string;
  sender_id?: string;
  sender_type: 'agent' | 'contact' | 'system';
  content: string;
  message_type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'system';
  metadata: Record<string, any>;
  external_id?: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    name?: string;
    full_name?: string;
    email?: string;
  };
}

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findConversationsByInbox(
    inboxId: string,
    options: {
      status?: 'open' | 'resolved' | 'pending' | 'snoozed';
      assigned_agent_id?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<ConversationWithDetails[]> {
    const supabase = this.supabaseService.getAdminClient();
    const { status, assigned_agent_id, limit = 50, offset = 0 } = options;

    try {
      let query = supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts(*),
          assigned_agent:profiles(id, full_name, email)
        `)
        .eq('inbox_id', inboxId)
        .order('last_message_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      if (assigned_agent_id) {
        if (assigned_agent_id === 'unassigned') {
          query = query.is('assigned_agent_id', null);
        } else {
          query = query.eq('assigned_agent_id', assigned_agent_id);
        }
      }

      const { data: conversations, error } = await query;

      if (error) {
        this.logger.error('Error fetching conversations:', error);
        throw new InternalServerErrorException('Could not fetch conversations');
      }

      const conversationsWithLastMessage = await Promise.all(
        (conversations || []).map(async (conversation) => {
          const lastMessage = await this.getLastMessage(conversation.id);
          const unreadCount = await this.getUnreadMessageCount(conversation.id);

          return {
            ...conversation,
            last_message: lastMessage,
            unread_count: unreadCount,
          };
        }),
      );

      return conversationsWithLastMessage;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error in findConversationsByInbox:', error);
      throw new InternalServerErrorException('Failed to retrieve conversations');
    }
  }

  async findConversationById(conversationId: string): Promise<ConversationWithDetails> {
    const supabase = this.supabaseService.getAdminClient();

    try {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts(*),
          assigned_agent:profiles(id, full_name, email)
        `)
        .eq('id', conversationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
        }
        this.logger.error('Error fetching conversation:', error);
        throw new InternalServerErrorException('Could not fetch conversation');
      }

      const lastMessage = await this.getLastMessage(conversationId);
      const unreadCount = await this.getUnreadMessageCount(conversationId);

      return {
        ...conversation,
        last_message: lastMessage,
        unread_count: unreadCount,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Unexpected error in findConversationById:', error);
      throw new InternalServerErrorException('Failed to retrieve conversation');
    }
  }

  async getConversationMessages(
    conversationId: string,
    options: {
      limit?: number;
      offset?: number;
      include_private?: boolean;
    } = {},
  ): Promise<MessageWithSender[]> {
    const supabase = this.supabaseService.getAdminClient();
    const { limit = 50, offset = 0, include_private = false } = options;

    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(id, full_name, email)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (!include_private) {
        query = query.eq('is_private', false);
      }

      const { data: messages, error } = await query;

      if (error) {
        this.logger.error('Error fetching messages:', error);
        throw new InternalServerErrorException('Could not fetch messages');
      }

      return messages || [];
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error in getConversationMessages:', error);
      throw new InternalServerErrorException('Failed to retrieve messages');
    }
  }

  async updateConversationStatus(
    conversationId: string,
    status: 'open' | 'resolved' | 'pending' | 'snoozed',
    userId?: string,
  ): Promise<ConversationWithDetails> {
    const supabase = this.supabaseService.getAdminClient();

    try {
      const updateData: any = { status };

      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      } else if (status === 'open' && updateData.resolved_at) {
        updateData.resolved_at = null;
      }

      const { data: conversation, error } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversationId)
        .select(`
          *,
          contact:contacts(*),
          assigned_agent:profiles(id, full_name, email)
        `)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
        }
        this.logger.error('Error updating conversation status:', error);
        throw new InternalServerErrorException('Could not update conversation status');
      }

      if (userId) {
        await this.createSystemMessage(
          conversationId,
          `Conversa marcada como ${status}`,
          userId,
        );
      }

      // Nota: Notificações em tempo real serão enviadas via controller

      return conversation;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error in updateConversationStatus:', error);
      throw new InternalServerErrorException('Failed to update conversation status');
    }
  }

  async assignConversation(
    conversationId: string,
    agentId: string,
    assignedBy?: string,
  ): Promise<ConversationWithDetails> {
    const supabase = this.supabaseService.getAdminClient();

    try {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .update({ assigned_agent_id: agentId })
        .eq('id', conversationId)
        .select(`
          *,
          contact:contacts(*),
          assigned_agent:profiles(id, full_name, email)
        `)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
        }
        this.logger.error('Error assigning conversation:', error);
        throw new InternalServerErrorException('Could not assign conversation');
      }

      if (assignedBy) {
        await this.createSystemMessage(
          conversationId,
          `Conversa atribuída a ${conversation.assigned_agent?.full_name}`,
          assignedBy,
        );
      }

      // Nota: Notificações em tempo real serão enviadas via controller

      return conversation;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error in assignConversation:', error);
      throw new InternalServerErrorException('Failed to assign conversation');
    }
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' = 'text',
    metadata: Record<string, any> = {},
    isPrivate: boolean = false,
  ): Promise<MessageWithSender> {
    const supabase = this.supabaseService.getAdminClient();

    try {
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          sender_type: 'agent',
          content,
          message_type: messageType,
          metadata,
          is_private: isPrivate,
        })
        .select(`
          *,
          sender:profiles(id, full_name, email)
        `)
        .single();

      if (error) {
        this.logger.error('Error sending message:', error);
        throw new InternalServerErrorException('Could not send message');
      }

      return message;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error in sendMessage:', error);
      throw new InternalServerErrorException('Failed to send message');
    }
  }

  private async createSystemMessage(
    conversationId: string,
    content: string,
    userId?: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();

    try {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: userId,
        sender_type: 'system',
        content,
        message_type: 'system',
        metadata: {},
        is_private: false,
      });
    } catch (error) {
      this.logger.warn('Could not create system message:', error);
    }
  }

  private async getLastMessage(conversationId: string): Promise<any> {
    const supabase = this.supabaseService.getAdminClient();

    try {
      const { data: message } = await supabase
        .from('messages')
        .select('id, content, sender_type, message_type, created_at')
        .eq('conversation_id', conversationId)
        .eq('is_private', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return message;
    } catch (error) {
      return null;
    }
  }

  private async getUnreadMessageCount(conversationId: string): Promise<number> {
    return 0;
  }

  async getConversationStats(inboxId: string): Promise<{
    total: number;
    open: number;
    resolved: number;
    pending: number;
    snoozed: number;
    unassigned: number;
  }> {
    const supabase = this.supabaseService.getAdminClient();

    try {
      const { data: stats, error } = await supabase
        .from('conversations')
        .select('status, assigned_agent_id')
        .eq('inbox_id', inboxId);

      if (error) {
        this.logger.error('Error fetching conversation stats:', error);
        throw new InternalServerErrorException('Could not fetch conversation stats');
      }

      const total = stats?.length || 0;
      const open = stats?.filter(c => c.status === 'open').length || 0;
      const resolved = stats?.filter(c => c.status === 'resolved').length || 0;
      const pending = stats?.filter(c => c.status === 'pending').length || 0;
      const snoozed = stats?.filter(c => c.status === 'snoozed').length || 0;
      const unassigned = stats?.filter(c => !c.assigned_agent_id).length || 0;

      return {
        total,
        open,
        resolved,
        pending,
        snoozed,
        unassigned,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error in getConversationStats:', error);
      throw new InternalServerErrorException('Failed to retrieve conversation stats');
    }
  }
}