import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  UsePipes,
  Put,
  Patch,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto } from './dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/v1/users')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@UsePipes(ZodValidationPipe)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar usuários',
    description:
      'Retorna uma lista de todos os usuários do sistema, com opção de filtro por status. Os usuários são ordenados por data de criação (mais recentes primeiro).',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar usuários por status',
    enum: ['active', 'inactive'],
    example: 'active',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de usuários retornada com sucesso.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-example' },
          full_name: { type: 'string', example: 'João Silva' },
          email: { type: 'string', example: 'joao@empresa.com' },
          role: {
            type: 'string',
            enum: ['ADMIN', 'MANAGER', 'AGENT'],
            example: 'AGENT',
          },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'INACTIVE'],
            example: 'ACTIVE',
          },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async findAll(@Query('status') status?: 'active' | 'inactive') {
    return await this.usersService.findAll(status);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar um novo usuário',
    description:
      'Cria um novo usuário no sistema com senha temporária. O usuário receberá as credenciais por email para primeiro acesso.',
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      agent: {
        summary: 'Criar Agente',
        value: {
          fullName: 'João Atendente',
          email: 'joao.atendente@empresa.com',
          role: 'AGENT',
        },
      },
      manager: {
        summary: 'Criar Gerente',
        value: {
          fullName: 'Maria Gerente',
          email: 'maria.gerente@empresa.com',
          role: 'MANAGER',
        },
      },
      admin: {
        summary: 'Criar Administrador',
        value: {
          fullName: 'Carlos Admin',
          email: 'carlos.admin@empresa.com',
          role: 'ADMIN',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuário criado com sucesso.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        full_name: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string' },
        status: { type: 'string' },
        temporaryPassword: {
          type: 'string',
          description: 'Senha temporária gerada (apenas no retorno da criação)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Usuário com este email já existe.',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar um usuário',
    description:
      'Atualiza os dados de um usuário existente pelo seu ID. Permite atualização completa ou parcial dos dados.',
  })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      fullUpdate: {
        summary: 'Atualização completa',
        value: {
          fullName: 'João Silva Santos',
          email: 'joao.santos@empresa.com',
          role: 'MANAGER',
          status: 'ACTIVE',
        },
      },
      roleChange: {
        summary: 'Mudança de cargo',
        value: { role: 'MANAGER' },
      },
      statusChange: {
        summary: 'Mudança de status',
        value: { status: 'INACTIVE' },
      },
      addressUpdate: {
        summary: 'Atualização de endereço',
        value: {
          zip_code: '12345-678',
          street: 'Rua das Flores',
          number: '123',
          city: 'São Paulo',
          state: 'SP',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário atualizado com sucesso.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        full_name: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string' },
        status: { type: 'string' },
        zip_code: { type: 'string' },
        street: { type: 'string' },
        number: { type: 'string' },
        complement: { type: 'string' },
        neighborhood: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos.',
  })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualizar a senha de um usuário',
    description:
      'Define uma nova senha para um usuário específico. Esta ação é imediata.',
  })
  @ApiBody({
    type: UpdatePasswordDto,
    examples: {
      default: {
        summary: 'Atualizar Senha',
        value: { password: 'NovaSenha@123' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Senha atualizada com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Senha não fornecida ou inválida.',
  })
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.usersService.updatePassword(id, updatePasswordDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Desativar um usuário',
    description:
      'Altera o status de um usuário para "INACTIVE" e bloqueia seu acesso ao sistema.',
    operationId: 'deactivateUser',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário desativado com sucesso.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        full_name: { type: 'string' },
        status: { type: 'string', example: 'INACTIVE' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado.',
  })
  async deactivate(@Param('id') id: string) {
    return await this.usersService.deactivate(id);
  }

  @Patch(':id/reactivate')
  @ApiOperation({
    summary: 'Reativar um usuário',
    description:
      'Altera o status de um usuário para "ACTIVE" e restaura seu acesso ao sistema.',
    operationId: 'reactivateUser',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário reativado com sucesso.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        full_name: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string' },
        status: { type: 'string', example: 'ACTIVE' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado.',
  })
  async reactivate(@Param('id') id: string) {
    return await this.usersService.reactivate(id);
  }
}
