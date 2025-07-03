import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';

@Injectable()
export class InboxAccessGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Bearer token is missing.');
    }

    // Verificar autenticação
    const supabase = this.supabaseService.getClient();
    const { data: userData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !userData.user) {
      throw new UnauthorizedException('Invalid token or user not found.');
    }

    // Obter o ID da inbox da URL (params) ou do body
    const inboxId = request.params?.id || request.params?.inboxId || request.body?.inbox_id;

    if (!inboxId) {
      throw new ForbiddenException('Inbox ID is required for access validation.');
    }

    try {
      // Verificar se a inbox existe e se o usuário tem acesso
      const adminSupabase = this.supabaseService.getAdminClient();
      
      // Primeiro verificar se a inbox existe
      const { data: inbox, error: inboxError } = await adminSupabase
        .from('inboxes')
        .select('id, name, is_active')
        .eq('id', inboxId)
        .maybeSingle();

      if (inboxError) {
        console.error('InboxAccessGuard - Inbox query error:', inboxError);
        throw new ForbiddenException('Error checking inbox access.');
      }

      if (!inbox) {
        throw new NotFoundException('Inbox not found.');
      }

      // Verificar se o usuário é admin
      const { data: userProfile, error: profileError } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('InboxAccessGuard - Profile query error:', profileError);
        throw new ForbiddenException('Error checking user profile.');
      }

      // Se o usuário é admin, dar acesso total
      if (userProfile?.role === 'ADMIN') {
        // Adicionar informações úteis ao request para uso posterior
        request['user'] = userData.user;
        request['inbox'] = inbox;
        request['inboxAccess'] = { inbox_id: inboxId, user_id: userData.user.id, role: 'ADMIN' };
        return true;
      }

      // Verificar se o usuário tem acesso através da tabela inbox_agents
      const { data: agentAccess, error: accessError } = await adminSupabase
        .from('inbox_agents')
        .select('inbox_id, user_id, role')
        .eq('inbox_id', inboxId)
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (accessError) {
        console.error('InboxAccessGuard - Agent access query error:', accessError);
        throw new ForbiddenException('Error checking inbox access.');
      }

      if (!agentAccess) {
        throw new ForbiddenException('Access denied. You are not authorized to access this inbox.');
      }

      // Adicionar informações úteis ao request para uso posterior
      request['user'] = userData.user;
      request['inbox'] = inbox;
      request['inboxAccess'] = agentAccess;

      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('InboxAccessGuard - Unexpected error:', error);
      throw new ForbiddenException('Access validation failed due to unexpected error.');
    }
  }
} 