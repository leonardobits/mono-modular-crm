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
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminGuard } from './guards/admin.guard';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/v1/users')
@UseGuards(AdminGuard)
@UsePipes(ZodValidationPipe)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar usuários',
    description: 'Retorna uma lista de todos os usuários, com opção de filtro por status.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de usuários retornada com sucesso.' })
  async findAll(@Query('status') status?: 'active' | 'inactive') {
    return await this.usersService.findAll(status);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar um novo usuário',
    description: 'Cria um novo usuário com nome, e-mail e cargo.',
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      a: {
        summary: 'Exemplo de Atendente',
        value: { name: 'João Atendente', email: 'joao.atendente@example.com', cargo: 'ATENDENTE' },
      },
      b: {
        summary: 'Exemplo de Gerente',
        value: { name: 'Maria Gerente', email: 'maria.gerente@example.com', cargo: 'GERENTE' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados de entrada inválidos.' })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar um usuário',
    description: 'Atualiza os dados de um usuário existente pelo seu ID.',
  })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      a: {
        summary: 'Atualizar nome e cargo',
        value: { name: 'João Silva', cargo: 'GERENTE' },
      },
      b: {
        summary: 'Atualizar status',
        value: { status: 'INATIVO' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuário não encontrado.' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Desativar um usuário',
    description: 'Altera o status de um usuário para "INATIVO".',
    operationId: 'deactivateUser',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuário desativado com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuário não encontrado.' })
  async deactivate(@Param('id') id: string) {
    return await this.usersService.deactivate(id);
  }

  @Patch(':id/reactivate')
  @ApiOperation({
    summary: 'Reativar um usuário',
    description: 'Altera o status de um usuário para "ATIVO".',
    operationId: 'reactivateUser',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuário reativado com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuário não encontrado.' })
  async reactivate(@Param('id') id: string) {
    return await this.usersService.reactivate(id);
  }
} 