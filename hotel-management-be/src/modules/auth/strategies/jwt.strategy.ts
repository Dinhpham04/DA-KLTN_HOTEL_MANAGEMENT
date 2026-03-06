import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@database/prisma.service';

export interface JwtPayload {
  sub: number;
  mail: string;
  staffType: number | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = configService.get<string>('jwt.secret');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const staff = await this.prisma.staff.findUnique({
      where: { staffId: payload.sub, deletedAt: null },
      select: {
        staffId: true,
        mail: true,
        staffType: true,
        staffName: true,
        dataStatus: true,
      },
    });

    if (!staff || staff.dataStatus !== 1) {
      throw new UnauthorizedException('Invalid or inactive account');
    }

    return {
      staffId: staff.staffId,
      mail: staff.mail,
      staffType: staff.staffType,
      staffName: staff.staffName,
    };
  }
}
