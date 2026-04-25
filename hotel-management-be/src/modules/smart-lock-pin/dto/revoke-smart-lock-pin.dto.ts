import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RevokeSmartLockPinDto {
  @ApiPropertyOptional({
    description: 'Revoke datetime (ISO 8601). Defaults to current time when omitted',
  })
  @IsOptional()
  @IsDateString()
  readonly revokedAt?: string;

  @ApiPropertyOptional({ description: 'Revoke reason', maxLength: 512 })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  readonly reason?: string;
}
