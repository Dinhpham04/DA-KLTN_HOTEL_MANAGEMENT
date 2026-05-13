import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { Observable } from 'rxjs';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { StaffType } from '@common/enums/index';

type RequestWithUser = Request & { user?: CurrentStaff };

@Injectable()
export class JwtOrInternalAutomationGuard extends AuthGuard('jwt') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const expectedToken = this.configService.get<string>('INTERNAL_AUTOMATION_TOKEN');
    const internalHeader = this.readHeader(request.headers['x-internal-token']);
    const authorization = this.readHeader(request.headers.authorization);
    const bearerToken = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length).trim()
      : undefined;
    const providedInternalToken = internalHeader?.trim() || bearerToken;

    if (
      internalHeader !== undefined ||
      (expectedToken !== undefined && bearerToken === expectedToken)
    ) {
      if (!expectedToken) {
        throw new UnauthorizedException('INTERNAL_AUTOMATION_TOKEN is not configured');
      }

      if (providedInternalToken !== expectedToken) {
        throw new UnauthorizedException('Invalid internal automation token');
      }

      request.user = {
        staffId: this.configService.get<number>('CLEANING_AUTOMATION_STAFF_ID') ?? 1,
        mail: 'internal-automation@system.local',
        staffType: StaffType.STAFF,
        staffName: 'Internal Automation',
      };

      return true;
    }

    return super.canActivate(context);
  }

  private readHeader(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
  }
}
