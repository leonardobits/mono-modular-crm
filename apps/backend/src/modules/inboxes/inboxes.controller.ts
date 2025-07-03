import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  UsePipes,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { InboxesService } from './inboxes.service';
import { CreateInboxDto, UpdateInboxDto, AssignAgentDto } from './dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { InboxAccessGuard } from './guards/inbox-access.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from 'nestjs-zod';

@ApiTags('Inboxes')
@ApiBearerAuth()
@Controller('api/v1/inboxes')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'MANAGER')
@UsePipes(ZodValidationPipe)
export class InboxesController {
  constructor(private readonly inboxesService: InboxesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar caixas de entrada',
    description: 'Retorna uma lista de todas as caixas de entrada ativas do sistema.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de caixas de entrada retornada com sucesso.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-example' },
          name: { type: 'string', example: 'Atendimento Website' },
          channel_id: { type: 'string', example: 'uuid-channel-id' },
          settings: { type: 'object', example: { webhook_url: 'https://api.example.com/webhook' } },
          is_active: { type: 'boolean', example: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          channel: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string', example: 'Website' },
              type: { type: 'string', example: 'website' },
              description: { type: 'string', example: 'Website chat widget integration' },
            },
          },
        },
      },
    },
  })
  async findAll(@Request() req: any) {
    const userId = req.user?.id;
    return await this.inboxesService.findAll(userId);
  }

  @Get('channels')
  @ApiOperation({
    summary: 'Listar canais disponíveis',
    description: 'Retorna uma lista de todos os canais de comunicação disponíveis.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de canais retornada com sucesso.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-example' },
          name: { type: 'string', example: 'Website' },
          type: { type: 'string', example: 'website' },
          description: { type: 'string', example: 'Website chat widget integration' },
          is_active: { type: 'boolean', example: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async findChannels() {
    return await this.inboxesService.findChannels();
  }

  @Get(':id')
  @UseGuards(InboxAccessGuard)
  @ApiOperation({
    summary: 'Obter detalhes de uma caixa de entrada',
    description: 'Retorna os detalhes de uma caixa de entrada específica pelo ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da caixa de entrada',
    example: 'uuid-example',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalhes da caixa de entrada retornados com sucesso.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-example' },
        name: { type: 'string', example: 'Atendimento Website' },
        channel_id: { type: 'string', example: 'uuid-channel-id' },
        settings: { type: 'object', example: { webhook_url: 'https://api.example.com/webhook' } },
        is_active: { type: 'boolean', example: true },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        channel: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Website' },
            type: { type: 'string', example: 'website' },
            description: { type: 'string', example: 'Website chat widget integration' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Caixa de entrada não encontrada.',
  })
  async findOne(@Param('id') id: string) {
    return await this.inboxesService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar uma nova caixa de entrada',
    description: 'Cria uma nova caixa de entrada vinculada a um canal de comunicação.',
  })
  @ApiBody({
    type: CreateInboxDto,
    examples: {
      website: {
        summary: 'Caixa de entrada Website',
        value: {
          name: 'Atendimento Website',
          channel_id: 'uuid-website-channel-id',
          settings: {
            widget_color: '#007bff',
            welcome_message: 'Olá! Como podemos ajudar?',
          },
        },
      },
      whatsapp: {
        summary: 'Caixa de entrada WhatsApp',
        value: {
          name: 'WhatsApp Vendas',
          channel_id: 'uuid-whatsapp-channel-id',
          settings: {
            phone_number: '+5511999999999',
            webhook_url: 'https://api.example.com/webhook/whatsapp',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Caixa de entrada criada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        channel_id: { type: 'string' },
        settings: { type: 'object' },
        is_active: { type: 'boolean' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        channel: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos ou ID do canal inválido.',
  })
  async create(@Body() createInboxDto: CreateInboxDto) {
    return await this.inboxesService.create(createInboxDto);
  }

  @Patch(':id')
  @UseGuards(InboxAccessGuard)
  @ApiOperation({
    summary: 'Atualizar uma caixa de entrada',
    description: 'Atualiza os dados de uma caixa de entrada existente pelo ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da caixa de entrada',
    example: 'uuid-example',
  })
  @ApiBody({
    type: UpdateInboxDto,
    examples: {
      nameUpdate: {
        summary: 'Atualizar nome',
        value: { name: 'Novo Nome da Caixa de Entrada' },
      },
      settingsUpdate: {
        summary: 'Atualizar configurações',
        value: {
          settings: {
            widget_color: '#28a745',
            welcome_message: 'Bem-vindo! Como podemos ajudar hoje?',
          },
        },
      },
      deactivate: {
        summary: 'Desativar caixa de entrada',
        value: { is_active: false },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Caixa de entrada atualizada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        channel_id: { type: 'string' },
        settings: { type: 'object' },
        is_active: { type: 'boolean' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        channel: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Caixa de entrada não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos.',
  })
  async update(@Param('id') id: string, @Body() updateInboxDto: UpdateInboxDto) {
    return await this.inboxesService.update(id, updateInboxDto);
  }

  @Patch(':id/deactivate')
  @UseGuards(InboxAccessGuard)
  @ApiOperation({
    summary: 'Desativar uma caixa de entrada',
    description: 'Altera o status de uma caixa de entrada para inativo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da caixa de entrada',
    example: 'uuid-example',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Caixa de entrada desativada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        is_active: { type: 'boolean', example: false },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Caixa de entrada não encontrada.',
  })
  async deactivate(@Param('id') id: string) {
    return await this.inboxesService.deactivate(id);
  }

  @Patch(':id/reactivate')
  @UseGuards(InboxAccessGuard)
  @ApiOperation({
    summary: 'Reativar uma caixa de entrada',
    description: 'Altera o status de uma caixa de entrada para ativo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da caixa de entrada',
    example: 'uuid-example',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Caixa de entrada reativada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        is_active: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Caixa de entrada não encontrada.',
  })
  async reactivate(@Param('id') id: string) {
    return await this.inboxesService.reactivate(id);
  }

  @Post(':id/agents')
  @UseGuards(InboxAccessGuard)
  @ApiOperation({
    summary: 'Atribuir agente à caixa de entrada',
    description: 'Adiciona um agente a uma caixa de entrada específica.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da caixa de entrada',
    example: 'uuid-example',
  })
  @ApiBody({
    type: AssignAgentDto,
    examples: {
      agent: {
        summary: 'Atribuir agente',
        value: {
          user_id: 'uuid-user-id',
          role: 'AGENT',
        },
      },
      manager: {
        summary: 'Atribuir gerente',
        value: {
          user_id: 'uuid-user-id',
          role: 'MANAGER',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Agente atribuído com sucesso.',
    schema: {
      type: 'object',
      properties: {
        inbox_id: { type: 'string' },
        user_id: { type: 'string' },
        role: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Agente já está atribuído a esta caixa de entrada.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID da caixa de entrada ou usuário inválido.',
  })
  async assignAgent(@Param('id') id: string, @Body() assignAgentDto: AssignAgentDto) {
    return await this.inboxesService.assignAgent(id, assignAgentDto.user_id, assignAgentDto.role);
  }

  @Delete(':id/agents/:userId')
  @UseGuards(InboxAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover agente da caixa de entrada',
    description: 'Remove um agente de uma caixa de entrada específica.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da caixa de entrada',
    example: 'uuid-example',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário/agente',
    example: 'uuid-user-id',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Agente removido com sucesso.',
  })
  async unassignAgent(@Param('id') id: string, @Param('userId') userId: string) {
    return await this.inboxesService.unassignAgent(id, userId);
  }

  @Get(':id/agents')
  @UseGuards(InboxAccessGuard)
  @ApiOperation({
    summary: 'Listar agentes da caixa de entrada',
    description: 'Retorna uma lista de todos os agentes atribuídos a uma caixa de entrada.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da caixa de entrada',
    example: 'uuid-example',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de agentes retornada com sucesso.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          inbox_id: { type: 'string' },
          user_id: { type: 'string' },
          role: { type: 'string', example: 'AGENT' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getInboxAgents(@Param('id') id: string) {
    return await this.inboxesService.getInboxAgents(id);
  }
}