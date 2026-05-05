import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalAutomationGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expectedToken = this.configService.get<string>('INTERNAL_AUTOMATION_TOKEN');
    if (!expectedToken) {
      throw new UnauthorizedException('INTERNAL_AUTOMATION_TOKEN is not configured');
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();
    const authorization = this.readHeader(request.headers['authorization']);
    const internalToken = this.readHeader(request.headers['x-internal-token']);
    const providedToken = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length).trim()
      : internalToken?.trim();

    if (providedToken !== expectedToken) {
      throw new UnauthorizedException('Invalid internal automation token');
    }

    return true;
  }

  private readHeader(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
  }
}
