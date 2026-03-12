import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async login(dto: LoginDto): Promise<TokenResponseDto> {
    const staff = await this.prisma.staff.findUnique({
      where: { mail: dto.mail, deletedAt: null },
    });

    if (!staff || !staff.loginPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      staff.loginPassword,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (staff.dataStatus !== 1) {
      throw new UnauthorizedException('Account is inactive');
    }

    return this.generateTokens(staff);
  }

  async refreshTokens(refreshToken: string): Promise<TokenResponseDto> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get<string>('jwt.refreshSecret'),
        },
      );

      const staff = await this.prisma.staff.findUnique({
        where: { staffId: payload.sub, deletedAt: null },
      });

      if (!staff || staff.dataStatus !== 1) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(staff);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async generateTokens(staff: {
    staffId: number;
    staffName: string;
    mail: string;
    staffType: number;
  }): Promise<TokenResponseDto> {
    const payload: JwtPayload = {
      sub: staff.staffId,
      mail: staff.mail,
      staffType: staff.staffType,
    };

    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload as unknown as Record<string, unknown>),
      this.jwtService.signAsync(payload as unknown as Record<string, unknown>, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      } as Record<string, unknown>),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<string>('jwt.expiresIn') ?? '1d',
      staff: {
        staffId: staff.staffId,
        staffName: staff.staffName,
        mail: staff.mail,
        staffType: staff.staffType,
      },
    };
  }
}
