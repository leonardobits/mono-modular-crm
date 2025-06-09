import { Controller, Post, Body, ValidationPipe, HttpStatus, UseGuards, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { User } from '@supabase/supabase-js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar um novo usuário',
    description: 'Cria uma nova conta de usuário com e-mail e senha.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Usuário registrado com sucesso.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos.' })
  async register(@Body(new ValidationPipe()) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login de usuário',
    description: 'Autentica um usuário e retorna um token de acesso.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login bem-sucedido, retorna token de acesso.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Credenciais inválidas.' })
  async login(@Body(new ValidationPipe()) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout de usuário',
    description: 'Invalida o token de acesso do usuário.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logout bem-sucedido.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token inválido.' })
  async logout() {
    return this.authService.logout();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter perfil do usuário atual',
    description: 'Retorna as informações do usuário autenticado.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Perfil do usuário retornado com sucesso.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token inválido.' })
  getProfile(@Req() req: { user: User }) {
    return this.authService.getProfile(req.user);
  }

  @Get('session')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter informações da sessão atual',
    description: 'Retorna as informações da sessão do usuário autenticado.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sessão do usuário retornada com sucesso.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token inválido.' })
  getSession(@Req() req: { user: User }) {
    return this.authService.getSession(req.user);
  }
} 