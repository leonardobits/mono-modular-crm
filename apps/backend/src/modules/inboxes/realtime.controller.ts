import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { RealtimeService } from './realtime.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { InboxAccessGuard } from './guards/inbox-access.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Realtime')
@ApiBearerAuth()
@Controller('api/v1/realtime')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'MANAGER', 'AGENT')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Get('config')
  @ApiOperation({
    summary: 'Obter configuração de tempo real',
    description: 'Retorna a configuração necessária para conectar ao Supabase Realtime no frontend.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuração de tempo real retornada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'https://project.supabase.co' },
        apikey: { type: 'string', example: 'anon-key' },
        userId: { type: 'string', example: 'uuid-user-id' },
        channels: {
          type: 'object',
          properties: {
            conversations: {
              type: 'object',
              properties: {
                table: { type: 'string', example: 'conversations' },
                filter: { type: 'string', example: 'inbox_id=in.(uuid1,uuid2)' },
                events: { type: 'array', items: { type: 'string' } },
              },
            },
            messages: {
              type: 'object',
              properties: {
                table: { type: 'string', example: 'messages' },
                events: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
    },
  })
  async getRealtimeConfig(@Request() req: any) {
    const userId = req.user?.id;
    const inboxIds = await this.realtimeService.getUserAccessibleInboxes(userId);
    
    return this.realtimeService.getRealtimeConfig(userId, inboxIds);
  }

  @Get('inboxes')
  @ApiOperation({
    summary: 'Obter inboxes acessíveis para tempo real',
    description: 'Retorna a lista de IDs das inboxes que o usuário tem acesso para subscriptions.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de IDs de inboxes retornada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        inboxIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['uuid-inbox-1', 'uuid-inbox-2'],
        },
      },
    },
  })
  async getUserAccessibleInboxes(@Request() req: any) {
    const userId = req.user?.id;
    const inboxIds = await this.realtimeService.getUserAccessibleInboxes(userId);
    
    return { inboxIds };
  }

  @Post('subscribe/conversations/:inboxId')
  @UseGuards(InboxAccessGuard)
  @ApiOperation({
    summary: 'Criar subscription de conversas',
    description: 'Cria uma subscription para atualizações em tempo real de conversas de uma inbox.',
  })
  @ApiParam({
    name: 'inboxId',
    description: 'ID da caixa de entrada',
    example: 'uuid-inbox-id',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Subscription criada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        subscriptionId: { type: 'string', example: 'conversations_uuid_timestamp' },
        success: { type: 'boolean', example: true },
      },
    },
  })
  async subscribeToConversations(@Param('inboxId') inboxId: string, @Request() req: any) {
    const userId = req.user?.id;
    const subscriptionId = await this.realtimeService.subscribeToConversationUpdates(
      inboxId,
      userId,
    );
    
    return { subscriptionId, success: true };
  }

  @Post('subscribe/messages/:conversationId')
  @ApiOperation({
    summary: 'Criar subscription de mensagens',
    description: 'Cria uma subscription para atualizações em tempo real de mensagens de uma conversa.',
  })
  @ApiParam({
    name: 'conversationId',
    description: 'ID da conversa',
    example: 'uuid-conversation-id',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Subscription criada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        subscriptionId: { type: 'string', example: 'messages_uuid_timestamp' },
        success: { type: 'boolean', example: true },
      },
    },
  })
  async subscribeToMessages(@Param('conversationId') conversationId: string, @Request() req: any) {
    const userId = req.user?.id;
    const subscriptionId = await this.realtimeService.subscribeToMessageUpdates(
      conversationId,
      userId,
    );
    
    return { subscriptionId, success: true };
  }

  @Post('subscribe/inbox-agents')
  @ApiOperation({
    summary: 'Criar subscription de atribuições de inbox',
    description: 'Cria uma subscription para atualizações quando o usuário é atribuído/removido de inboxes.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Subscription criada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        subscriptionId: { type: 'string', example: 'inbox_agents_uuid_timestamp' },
        success: { type: 'boolean', example: true },
      },
    },
  })
  async subscribeToInboxAgents(@Request() req: any) {
    const userId = req.user?.id;
    const subscriptionId = await this.realtimeService.subscribeToInboxAgentUpdates(userId);
    
    return { subscriptionId, success: true };
  }

  @Delete('unsubscribe/:subscriptionId')
  @ApiOperation({
    summary: 'Cancelar subscription',
    description: 'Cancela uma subscription ativa de tempo real.',
  })
  @ApiParam({
    name: 'subscriptionId',
    description: 'ID da subscription a ser cancelada',
    example: 'conversations_uuid_timestamp',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription cancelada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Subscription cancelled successfully' },
      },
    },
  })
  async unsubscribe(@Param('subscriptionId') subscriptionId: string) {
    const success = await this.realtimeService.unsubscribe(subscriptionId);
    
    return {
      success,
      message: success 
        ? 'Subscription cancelled successfully' 
        : 'Subscription not found or already cancelled',
    };
  }

  @Get('subscriptions')
  @ApiOperation({
    summary: 'Listar subscriptions ativas',
    description: 'Retorna a lista de todas as subscriptions ativas do servidor.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de subscriptions retornada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        subscriptions: {
          type: 'array',
          items: { type: 'string' },
          example: ['conversations_uuid1_123', 'messages_uuid2_456'],
        },
        count: { type: 'number', example: 2 },
      },
    },
  })
  @Roles('ADMIN') // Apenas admins podem ver todas as subscriptions
  async getActiveSubscriptions() {
    const subscriptions = this.realtimeService.getActiveSubscriptions();
    
    return {
      subscriptions,
      count: subscriptions.length,
    };
  }

  @Post('broadcast/inbox/:inboxId')
  @UseGuards(InboxAccessGuard)
  @ApiOperation({
    summary: 'Enviar broadcast para inbox',
    description: 'Envia uma mensagem broadcast para todos os usuários conectados a uma inbox.',
  })
  @ApiParam({
    name: 'inboxId',
    description: 'ID da caixa de entrada',
    example: 'uuid-inbox-id',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        event: { type: 'string', example: 'notification' },
        payload: { type: 'object', example: { message: 'Nova mensagem recebida' } },
      },
      required: ['event', 'payload'],
    },
    examples: {
      notification: {
        summary: 'Enviar notificação',
        value: {
          event: 'notification',
          payload: {
            type: 'new_message',
            title: 'Nova mensagem',
            message: 'Você recebeu uma nova mensagem',
            data: { conversationId: 'uuid-conversation-id' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Broadcast enviado com sucesso.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Broadcast sent successfully' },
      },
    },
  })
  async broadcastToInbox(
    @Param('inboxId') inboxId: string,
    @Body() body: { event: string; payload: any },
  ) {
    const success = await this.realtimeService.broadcastToInbox(
      inboxId,
      body.event,
      body.payload,
    );
    
    return {
      success,
      message: success 
        ? 'Broadcast sent successfully' 
        : 'Failed to send broadcast',
    };
  }

  @Post('notify/agents/:inboxId')
  @UseGuards(InboxAccessGuard)
  @ApiOperation({
    summary: 'Notificar agentes da inbox',
    description: 'Envia uma notificação para todos os agentes de uma inbox.',
  })
  @ApiParam({
    name: 'inboxId',
    description: 'ID da caixa de entrada',
    example: 'uuid-inbox-id',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['new_message', 'conversation_assigned', 'conversation_resolved'],
          example: 'new_message',
        },
        title: { type: 'string', example: 'Nova mensagem' },
        message: { type: 'string', example: 'Você recebeu uma nova mensagem de João Silva' },
        data: { type: 'object', example: { conversationId: 'uuid-conversation-id' } },
      },
      required: ['type', 'title', 'message'],
    },
    examples: {
      newMessage: {
        summary: 'Nova mensagem',
        value: {
          type: 'new_message',
          title: 'Nova mensagem',
          message: 'João Silva enviou uma mensagem',
          data: { conversationId: 'uuid-conversation-id' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificação enviada com sucesso.',
  })
  async notifyAgents(
    @Param('inboxId') inboxId: string,
    @Body() notification: {
      type: 'new_message' | 'conversation_assigned' | 'conversation_resolved';
      title: string;
      message: string;
      data?: any;
    },
  ) {
    const success = await this.realtimeService.notifyAgents(inboxId, notification);
    
    return {
      success,
      message: success 
        ? 'Notification sent successfully' 
        : 'Failed to send notification',
    };
  }
}