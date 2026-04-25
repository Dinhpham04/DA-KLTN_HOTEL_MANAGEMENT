import {
  IsDateString,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSmartLockPinDto {
  @ApiPropertyOptional({ description: 'Room ID' })
  @IsOptional()
  @IsInt()
  readonly roomId?: number;

  @ApiPropertyOptional({ description: 'Reserve ID linked to this PIN credential' })
  @IsOptional()
  @IsInt()
  readonly reserveId?: number;

  @ApiPropertyOptional({ description: 'PIN code (4-12 digits)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4,12}$/)
  readonly pin?: string;

  @ApiPropertyOptional({ description: 'PIN validity start datetime (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  readonly validFrom?: string;

  @ApiPropertyOptional({ description: 'PIN validity end datetime (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  readonly validTo?: string;

  @ApiPropertyOptional({ description: 'Credential status: 1=Active, 2=Revoked, 3=Expired' })
  @IsOptional()
  @IsInt()
  @IsIn([1, 2, 3])
  readonly status?: number;

  @ApiPropertyOptional({ description: 'Data status: 0=Unavailable, 1=Available, 2=Hidden' })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1, 2])
  readonly dataStatus?: number;

  @ApiPropertyOptional({ description: 'Credential issued datetime (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  readonly issuedAt?: string;

  @ApiPropertyOptional({ description: 'Credential revoked datetime (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  readonly revokedAt?: string;

  @ApiPropertyOptional({ description: 'Credential expired datetime (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  readonly expiredAt?: string;

  @ApiPropertyOptional({ description: 'Last provider sync datetime (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  readonly lastSyncAt?: string;

  @ApiPropertyOptional({ description: 'Provider credential identifier', maxLength: 128 })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  readonly providerCredentialId?: string;

  @ApiPropertyOptional({ description: 'Provider raw payload object' })
  @IsOptional()
  @IsObject()
  readonly providerPayload?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Last sync error message', maxLength: 512 })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  readonly syncError?: string;
}
