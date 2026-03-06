import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to mark a route as requiring specific staff types.
 * Usage: @Roles(StaffType.MANAGER, StaffType.ADMIN)
 */
export const Roles = (...roles: number[]) => SetMetadata(ROLES_KEY, roles);
