import { CanActivate, ExecutionContext, Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from '../../../supabase/supabase.service';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabaseService: SupabaseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return await this.verifyAuthentication(context);
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Bearer token is missing.');
    }

    const supabase = this.supabaseService.getClient();
    
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser(token);

      if (authError || !userData.user) {
        throw new UnauthorizedException('Invalid token or user not found.');
      }

      const adminSupabase = this.supabaseService.getAdminClient();
      const { data: profile, error: profileError } = await adminSupabase
        .from('profiles')
        .select('role, status')
        .eq('id', userData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('RolesGuard - Profile query error:', profileError);
        throw new ForbiddenException('Error fetching user profile.');
      }

      if (!profile) {
        throw new ForbiddenException('User profile not found.');
      }

      if (profile.status !== 'ACTIVE') {
        throw new ForbiddenException('User account is inactive.');
      }

      if (!requiredRoles.includes(profile.role)) {
        throw new ForbiddenException(`Access denied. Required roles: ${requiredRoles.join(', ')}. User role: ${profile.role}`);
      }

      request['user'] = userData.user;
      request['profile'] = profile;

      return true;

    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      
      console.error('RolesGuard - Unexpected error:', error);
      throw new ForbiddenException('Authentication failed due to unexpected error.');
    }
  }

  private async verifyAuthentication(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Bearer token is missing.');
    }

    const supabase = this.supabaseService.getClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid token or user not found.');
    }

    request['user'] = user;
    return true;
  }
} 