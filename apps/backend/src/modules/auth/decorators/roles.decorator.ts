import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../guards/roles.guard';

/**
 * Decorator @Roles para especificar as roles necessárias para acessar um endpoint
 *
 * Uso:
 * @Roles('ADMIN')
 * @Roles('ADMIN', 'MANAGER')
 * @Roles('MANAGER')
 *
 * Deve ser usado em conjunto com o RolesGuard:
 * @UseGuards(RolesGuard)
 * @Roles('ADMIN')
 * async adminOnlyMethod() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
