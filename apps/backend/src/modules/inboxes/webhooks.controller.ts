import {
  Controller,
  Post,
  Body,
  Param,
  Headers,
  HttpStatus,
  HttpCode,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { InboxesService } from './inboxes.service';
import { EvolutionWebhookDto } from './dto';

@ApiTags('Webhooks')
@Controller('api/v1/webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly inboxesService: InboxesService,
  ) {}

  @Post('evolution-api/:inboxId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Receber webhook do Evolution API',
    description: 'Endpoint para processar webhooks de mensagens recebidas do Evolution API (WhatsApp).',
  })
  @ApiParam({
    name: 'inboxId',
    description: 'ID da caixa de entrada que receberá a mensagem',
    example: 'uuid-inbox-id',
  })
  @ApiHeader({
    name: 'x-webhook-token',
    description: 'Token de autenticação do webhook',
    required: false,
  })
  @ApiBody({
    type: EvolutionWebhookDto,
    examples: {
      textMessage: {
        summary: 'Mensagem de texto',
        value: {
          event: 'messages.upsert',
          instance: 'instance1',
          data: {
            key: {
              remoteJid: '5511999999999@s.whatsapp.net',
              fromMe: false,
              id: 'message-id-123',
            },
            message: {
              conversation: 'Olá, preciso de ajuda com meu pedido',
            },
            pushName: 'João Silva',
            messageTimestamp: 1640995200,
          },
        },
      },
      imageMessage: {
        summary: 'Mensagem com imagem',
        value: {
          event: 'messages.upsert',
          instance: 'instance1',
          data: {
            key: {
              remoteJid: '5511999999999@s.whatsapp.net',
              fromMe: false,
              id: 'message-id-456',
            },
            message: {
              imageMessage: {
                caption: 'Aqui está a foto do problema',
                url: 'https://example.com/image.jpg',
              },
            },
            pushName: 'Maria Santos',
            messageTimestamp: 1640995300,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook processado com sucesso.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Webhook processed successfully' },
        data: {
          type: 'object',
          properties: {
            contact: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                phone: { type: 'string' },
                platform: { type: 'string', example: 'whatsapp' },
              },
            },
            conversation: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                inbox_id: { type: 'string' },
                contact_id: { type: 'string' },
                status: { type: 'string', example: 'open' },
              },
            },
            message: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                conversation_id: { type: 'string' },
                content: { type: 'string' },
                sender_type: { type: 'string', example: 'contact' },
                message_type: { type: 'string', example: 'text' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados do webhook inválidos.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Caixa de entrada não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido.',
  })
  async receiveEvolutionWebhook(
    @Param('inboxId') inboxId: string,
    @Body() webhookData: EvolutionWebhookDto,
    @Headers('x-webhook-token') webhookToken?: string,
  ) {
    try {
      this.logger.log(`Received Evolution webhook for inbox ${inboxId}`);

      const inbox = await this.inboxesService.findOne(inboxId);
      if (!inbox) {
        throw new NotFoundException(`Inbox with ID ${inboxId} not found`);
      }

      const isTokenValid = await this.webhooksService.validateWebhookToken(
        inboxId,
        webhookToken,
      );

      if (inbox.settings?.webhook_token && !isTokenValid) {
        this.logger.warn(`Invalid webhook token for inbox ${inboxId}`);
        throw new UnauthorizedException('Invalid webhook token');
      }

      const result = await this.webhooksService.processEvolutionWebhook(
        webhookData,
        inboxId,
      );

      if (!result) {
        return {
          success: true,
          message: 'Webhook received but not processed (ignored event type)',
        };
      }

      this.logger.log(
        `Successfully processed webhook for inbox ${inboxId}, conversation ${result.conversation.id}`,
      );

      return {
        success: true,
        message: 'Webhook processed successfully',
        data: {
          contact: {
            id: result.contact.id,
            name: result.contact.name,
            phone: result.contact.phone,
            platform: result.contact.platform,
          },
          conversation: {
            id: result.conversation.id,
            inbox_id: result.conversation.inbox_id,
            contact_id: result.conversation.contact_id,
            status: result.conversation.status,
          },
          message: result.message ? {
            id: result.message.id,
            conversation_id: result.message.conversation_id,
            content: result.message.content,
            sender_type: result.message.sender_type,
            message_type: result.message.message_type,
          } : null,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      this.logger.error(
        `Error processing Evolution webhook for inbox ${inboxId}:`,
        error,
      );

      return {
        success: false,
        message: 'Failed to process webhook',
        error: error.message,
      };
    }
  }

  @Post('test/:inboxId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Testar webhook',
    description: 'Endpoint para testar o processamento de webhooks com dados simulados.',
  })
  @ApiParam({
    name: 'inboxId',
    description: 'ID da caixa de entrada para teste',
    example: 'uuid-inbox-id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Teste de webhook executado com sucesso.',
  })
  async testWebhook(@Param('inboxId') inboxId: string) {
    const testData = {
      event: 'messages.upsert',
      instance: 'test-instance',
      data: {
        key: {
          remoteJid: '5511999999999@s.whatsapp.net',
          fromMe: false,
          id: `test-message-${Date.now()}`,
        },
        message: {
          conversation: 'Esta é uma mensagem de teste do webhook',
        },
        pushName: 'Usuário Teste',
        messageTimestamp: Math.floor(Date.now() / 1000),
      },
    };

    return this.receiveEvolutionWebhook(inboxId, testData as EvolutionWebhookDto);
  }
}