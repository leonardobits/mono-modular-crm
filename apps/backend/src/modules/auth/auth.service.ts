import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signUp({
        email,
        password,
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
} 