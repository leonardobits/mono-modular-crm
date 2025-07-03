import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { RealtimeService } from './realtime.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { InboxAccessGuard } from './guards/inbox-access.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Conversations')
@ApiBearerAuth()
@Controller('api/v1/inboxes/:inboxId/conversations')
@UseGuards(RolesGuard, InboxAccessGuard)
@Roles('ADMIN', 'MANAGER', 'AGENT')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly realtimeService: RealtimeService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar conversas de uma caixa de entrada',
    description: 'Retorna uma lista de conversas de uma caixa de entrada específica com filtros opcionais.',
  })
  @ApiParam({
    name: 'inboxId',
    description: 'ID da caixa de entrada',
    example: 'uuid-inbox-id',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por status da conversa',
    enum: ['open', 'resolved', 'pending', 'snoozed'],
    example: 'open',
  })
  @ApiQuery({
    name: 'assigned_agent_id',
    required: false,
    description: 'Filtrar por agente atribuído ("unassigned" para não atribuídas)',
    example: 'uuid-agent-id',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número máximo de conversas a retornar',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Número de conversas a pular (paginação)',
    example: 0,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de conversas retornada com sucesso.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          inbox_id: { type: 'string' },
          contact_id: { type: 'string' },
          status: { type: 'string', enum: ['open', 'resolved', 'pending', 'snoozed'] },
          assigned_agent_id: { type: 'string', nullable: true },
          priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
          last_message_at: { type: 'string', format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' },
          contact: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              phone: { type: 'string' },
              platform: { type: 'string' },
            },
          },
          assigned_agent: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string' },
              full_name: { type: 'string' },
              email: { type: 'string' },
            },
          },
          unread_count: { type: 'number' },
          last_message: {
            type: 'object',
            nullable: true,
            properties: {
              content: { type: 'string' },
              sender_type: { type: 'string' },
              created_at: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async findConversationsByInbox(
    @Param('inboxId') inboxId: string,
    @Query('status') status?: 'open' | 'resolved' | 'pending' | 'snoozed',
    @Query('assigned_agent_id') assigned_agent_id?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return await this.conversationsService.findConversationsByInbox(inboxId, {
      status,
      assigned_agent_id,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Obter estatísticas das conversas',
    description: 'Retorna estatísticas das conversas de uma caixa de entrada.',
  })
  @ApiParam({
    name: 'inboxId',
    description: 'ID da caixa de entrada',
    example: 'uuid-inbox-id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estatísticas das conversas retornadas com sucesso.',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 50 },
        open: { type: 'number', example: 20 },
        resolved: { type: 'number', example: 25 },
        pending: { type: 'number', example: 3 },
        snoozed: { type: 'number', example: 2 },
        unassigned: { type: 'number', example: 5 },
      },
    },
  })
  async getConversationStats(@Param('inboxId') inboxId: string) {
    return await this.conversationsService.getConversationStats(inboxId);
  }

  @Get(':conversationId')
  @ApiOperation({
    summary: 'Obter detalhes de uma conversa',
    description: 'Retorna os detalhes de uma conversa específica.',
  })
  @ApiParam({
    name: 'inboxId',
    description: 'ID da caixa de entrada',
    example: 'uuid-inbox-id',
  })
  @ApiParam({
    name: 'conversationId',
    description: 'ID da conversa',
    example: 'uuid-conversation-id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalhes da conversa retornados com sucesso.',
  })
  async findConversationById(@Param('conversationId') conversationId: string) {
    return await this.conversationsService.findConversationById(conversationId);
  }

  @Get(':conversationId/messages')
  @ApiOperation({
    summary: 'Listar mensagens de uma conversa',
    description: 'Retorna as mensagens de uma conversa específica.',
  })
  @ApiParam({
    name: 'inboxId',
    description: 'ID da caixa de entrada',
    example: 'uuid-inbox-id',
  })
  @ApiParam({
    name: 'conversationId',
    description: 'ID da conversa',
    example: 'uuid-conversation-id',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número máximo de mensagens a retornar',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Número de mensagens a pular (paginação)',
    example: 0,
  })
  @ApiQuery({
    name: 'include_private',
    required: false,
    description: 'Incluir mensagens privadas (notas internas)',
    example: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de mensagens retornada com sucesso.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          conversation_id: { type: 'string' },
          sender_type: { type: 'string', enum: ['agent', 'contact', 'system'] },
          content: { type: 'string' },
          message_type: { type: 'string', enum: ['text', 'image', 'file', 'audio', 'video', 'location', 'system'] },
          metadata: { type: 'object' },
          is_private: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          sender: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string' },
              full_name: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getConversationMessages(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('include_private') include_private?: boolean,
  ) {
    return await this.conversationsService.getConversationMessages(conversationId, {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      include_private: include_private === true,
    });
  }

  @Patch(':conversationId/status')
  @ApiOperation({
    summary: 'Atualizar status de uma conversa',
    description: 'Atualiza o status de uma conversa (aberta, resolvida, pendente, etc.).',
  })
  @ApiParam({
    name: 'inboxId',
    description: 'ID da caixa de entrada',
    example: 'uuid-inbox-id',
  })
  @ApiParam({
    name: 'conversationId',
    description: 'ID da conversa',
    example: 'uuid-conversation-id',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['open', 'resolved', 'pending', 'snoozed'],
          example: 'resolved',
        },
      },
      required: ['status'],
    },
    examples: {
      resolve: {
        summary: 'Resolver conversa',
        value: { status: 'resolved' },
      },
      reopen: {
        summary: 'Reabrir conversa',
        value: { status: 'open' },
      },
      snooze: {
        summary: 'Adiar conversa',
        value: { status: 'snoozed' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status da conversa atualizado com sucesso.',
  })
  async updateConversationStatus(
    @Param('inboxId') inboxId: string,
    @Param('conversationId') conversationId: string,
    @Body() body: { status: 'open' | 'resolved' | 'pending' | 'snoozed' },
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    const result = await this.conversationsService.updateConversationStatus(
      conversationId,
      body.status,
      userId,
    );

    // Enviar notificação em tempo real
    if (body.status === 'resolved') {
      await this.realtimeService.notifyAgents(inboxId, {
        type: 'conversation_resolved',
        title: 'Conversa resolvida',
        message: `Conversa foi marcada como resolvida`,
        data: {
          conversationId: result.id,
          contactId: result.contact_id,
        },
      });
    }

    return result;
  }

  @Patch(':conversationId/assign')
  @ApiOperation({
    summary: 'Atribuir conversa a um agente',
    description: 'Atribui uma conversa a um agente específico.',
  })
  @ApiParam({
    name: 'inboxId',
    description: 'ID da caixa de entrada',
    example: 'uuid-inbox-id',
  })
  @ApiParam({
    name: 'conversationId',
    description: 'ID da conversa',
    example: 'uuid-conversation-id',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        agent_id: {
          type: 'string',
          example: 'uuid-agent-id',
          description: 'ID do agente para atribuir a conversa',
        },
      },
      required: ['agent_id'],
    },
    examples: {
      assign: {
        summary: 'Atribuir a um agente',
        value: { agent_id: 'uuid-agent-id' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conversa atribuída com sucesso.',
  })
  async assignConversation(
    @Param('inboxId') inboxId: string,
    @Param('conversationId') conversationId: string,
    @Body() body: { agent_id: string },
    @Request() req: any,
  ) {
    const assignedBy = req.user?.id;
    const result = await this.conversationsService.assignConversation(
      conversationId,
      body.agent_id,
      assignedBy,
    );

    // Enviar notificação em tempo real
    await this.realtimeService.notifyAgents(inboxId, {
      type: 'conversation_assigned',
      title: 'Conversa atribuída',
      message: `Conversa foi atribuída a ${result.assigned_agent?.full_name}`,
      data: {
        conversationId: result.id,
        contactId: result.contact_id,
        assignedAgentId: body.agent_id,
      },
    });

    return result;
  }

  @Post(':conversationId/messages')
  @ApiOperation({
    summary: 'Enviar mensagem em uma conversa',
    description: 'Envia uma nova mensagem em uma conversa específica.',
  })
  @ApiParam({
    name: 'inboxId',
    description: 'ID da caixa de entrada',
    example: 'uuid-inbox-id',
  })
  @ApiParam({
    name: 'conversationId',
    description: 'ID da conversa',
    example: 'uuid-conversation-id',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          example: 'Olá! Como posso ajudar você hoje?',
          description: 'Conteúdo da mensagem',
        },
        message_type: {
          type: 'string',
          enum: ['text', 'image', 'file', 'audio', 'video', 'location'],
          example: 'text',
          default: 'text',
        },
        metadata: {
          type: 'object',
          example: {},
          description: 'Metadados adicionais da mensagem',
        },
        is_private: {
          type: 'boolean',
          example: false,
          default: false,
          description: 'Se é uma nota privada (visível apenas para agentes)',
        },
      },
      required: ['content'],
    },
    examples: {
      textMessage: {
        summary: 'Mensagem de texto',
        value: {
          content: 'Obrigado por entrar em contato! Como posso ajudar?',
          message_type: 'text',
        },
      },
      privateNote: {
        summary: 'Nota privada',
        value: {
          content: 'Cliente parece frustrado, tratar com cuidado extra',
          message_type: 'text',
          is_private: true,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Mensagem enviada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        conversation_id: { type: 'string' },
        content: { type: 'string' },
        sender_type: { type: 'string', example: 'agent' },
        message_type: { type: 'string' },
        is_private: { type: 'boolean' },
        created_at: { type: 'string', format: 'date-time' },
        sender: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            full_name: { type: 'string' },
            email: { type: 'string' },
          },
        },
      },
    },
  })
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() body: {
      content: string;
      message_type?: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location';
      metadata?: Record<string, any>;
      is_private?: boolean;
    },
    @Request() req: any,
  ) {
    const senderId = req.user?.id;
    return await this.conversationsService.sendMessage(
      conversationId,
      senderId,
      body.content,
      body.message_type || 'text',
      body.metadata || {},
      body.is_private || false,
    );
  }
}