import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { InitialAdminRegisterDto } from './dto/initial-admin-register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async registerInitialAdmin(registerDto: InitialAdminRegisterDto) {
    const supabase = this.supabaseService.getClient();

    try {
      const { count: userCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new BadRequestException(
          `Error checking existing users: ${countError.message}`,
        );
      }

      const isFirstUser = userCount === 0;

      if (!isFirstUser) {
        throw new BadRequestException(
          'Initial admin registration is only allowed for the first user. Admin already exists.',
        );
      }

      const signUpOptions: any = {
        email: registerDto.email,
        password: registerDto.password,
      };

      if (registerDto.captchaToken) {
        signUpOptions.options = {
          captchaToken: registerDto.captchaToken,
        };
      }

      const { data: authData, error: authError } =
        await supabase.auth.signUp(signUpOptions);

      if (authError) {
        throw new BadRequestException(
          `Authentication error: ${authError.message}`,
        );
      }

      if (!authData?.user) {
        throw new BadRequestException('User creation failed');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: registerDto.name,
          role: 'ADMIN',
          status: 'ACTIVE',
          email: registerDto.email,
          tipo_pessoa: registerDto.tipoPessoa,
          data_nascimento: registerDto.dataNascimento,
          cpf_cnpj: registerDto.cpfCnpj,
          cep: registerDto.cep,
          cidade: registerDto.cidade,
          estado: registerDto.estado,
          endereco: registerDto.endereco,
          numero: registerDto.numero,
          complemento: registerDto.complemento,
        })
        .select()
        .single();

      if (profileError) {
        console.error(
          'Profile creation failed for user:',
          authData.user.id,
          profileError,
        );

        throw new BadRequestException(
          `Error creating user profile: ${profileError.message}`,
        );
      }

      return {
        success: true,
        message:
          'Initial admin registration successful. Please check your email for verification.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          profile: profile,
        },
      };
    } catch (error) {
      if (error.name === 'ZodError') {
        throw new BadRequestException(`Validation error: ${error.message}`);
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error('Unexpected error during admin registration:', error);
      throw new BadRequestException(
        'Registration failed due to unexpected error',
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const supabase = this.supabaseService.getClient();

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, status')
        .eq('email', resetPasswordDto.email)
        .single();

      if (profileError || !profile) {
        return {
          success: true,
          message:
            'If this email exists in our system, a password reset email has been sent.',
        };
      }

      if (profile.status !== 'ACTIVE') {
        console.log(
          `Password reset requested for inactive user: ${resetPasswordDto.email}`,
        );
        return {
          success: true,
          message:
            'If this email exists in our system, a password reset email has been sent.',
        };
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        resetPasswordDto.email,
        {
          redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`,
        },
      );

      if (resetError) {
        console.error('Supabase password reset error:', resetError);
        throw new BadRequestException(
          'Unable to process password reset request',
        );
      }

      return {
        success: true,
        message:
          'If this email exists in our system, a password reset email has been sent.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error('Unexpected error during password reset:', error);
      throw new BadRequestException(
        'Password reset failed due to unexpected error',
      );
    }
  }

  async register(registerDto: RegisterDto) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.signUp({
      email: registerDto.email,
      password: registerDto.password,
      options: {
        captchaToken: registerDto.captchaToken,
      },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (
      data.user &&
      data.user.identities &&
      data.user.identities.length === 0
    ) {
      throw new BadRequestException('User already exists');
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: registerDto.name,
        email: registerDto.email,
        role: 'USER',
        status: 'ACTIVE',
      });

      if (profileError) {
        console.error(
          'Profile creation failed for user:',
          data.user.id,
          profileError,
        );
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new BadRequestException(
          `Error creating user profile: ${profileError.message}`,
        );
      }
    }

    return {
      message:
        'Registration successful, please check your email for verification.',
      user: data.user,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const supabase = this.supabaseService.getClient();

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        throw new UnauthorizedException(
          `Authentication failed: ${authError.message}`,
        );
      }

      if (!authData?.user || !authData?.session) {
        throw new UnauthorizedException('Authentication failed');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Failed to fetch user profile:', profileError);
        throw new UnauthorizedException('User profile not found');
      }

      if (profile.status !== 'ACTIVE') {
        throw new UnauthorizedException('User account is inactive');
      }

      return {
        success: true,
        message: 'Login successful',
        access_token: authData.session.access_token,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: profile.full_name,
          role: profile.role,
          status: profile.status,
        },
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Unexpected error during login:', error);
      throw new UnauthorizedException('Login failed due to unexpected error');
    }
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
    return user;
  }

  getSession(user: User) {
    return user;
  }
}
