import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';

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
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new ForbiddenException('Invalid token or user not found.');
    }

    const userRole = data.user.user_metadata?.role;
    if (userRole !== 'ADMINISTRADOR') {
      throw new ForbiddenException('You do not have administrative privileges.');
    }

    return true;
  }
} 