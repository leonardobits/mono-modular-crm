import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new ForbiddenException('Authorization header is missing.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ForbiddenException('Bearer token is missing.');
    }

    const supabase = this.supabaseService.getClient();

    try {
      const { data: userData, error: authError } =
        await supabase.auth.getUser(token);

      if (authError || !userData.user) {
        throw new ForbiddenException('Invalid token or user not found.');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', userData.user.id)
        .single();

      if (profileError || !profile) {
        throw new ForbiddenException('User profile not found.');
      }

      if (profile.status !== 'ACTIVE') {
        throw new ForbiddenException('User account is inactive.');
      }

      if (profile.role !== 'ADMIN') {
        throw new ForbiddenException(
          'You do not have administrative privileges.',
        );
      }

      request['user'] = userData.user;
      request['profile'] = profile;

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      console.error('Unexpected error in AdminGuard:', error);
      throw new ForbiddenException(
        'Authentication failed due to unexpected error.',
      );
    }
  }
}
