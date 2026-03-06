import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface CurrentStaff {
  staffId: number;
  mail: string;
  staffType: number | null;
  staffName: string;
}

/**
 * Extract the current authenticated staff from the request.
 * Usage: @CurrentUser() user: CurrentStaff
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentStaff | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as CurrentStaff | undefined;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
