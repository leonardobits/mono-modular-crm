import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(registerDto: RegisterDto) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.signUp({
      email: registerDto.email,
      password: registerDto.password,
      options: {
        captchaToken: registerDto.captchaToken,
      }
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new BadRequestException('User already exists');
    }

    return { message: 'Registration successful, please check your email for verification.' , user: data.user};
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return data;
  }

  async logout() {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return { message: 'Logout bem-sucedido.' };
  }

  getProfile(user: User) {
    // O objeto 'user' já contém as informações do usuário logado.
    // Você pode customizar o que é retornado aqui se necessário.
    return user;
  }

  getSession(user: User) {
    // A informação da "sessão" no contexto de um token JWT é o seu payload.
    // O objeto 'user' representa esse payload.
    return user;
  }
} 