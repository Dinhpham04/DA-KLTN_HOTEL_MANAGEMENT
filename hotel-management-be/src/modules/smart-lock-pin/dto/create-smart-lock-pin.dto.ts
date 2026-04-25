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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSmartLockPinDto {
  @ApiProperty({ description: 'Room ID' })
  @IsInt()
  readonly roomId!: number;

  @ApiPropertyOptional({ description: 'Reserve ID linked to this PIN credential' })
  @IsOptional()
  @IsInt()
  readonly reserveId?: number;

  @ApiProperty({ description: 'PIN code (4-12 digits)' })
  @IsString()
  @Matches(/^\d{4,12}$/)
  readonly pin!: string;

  @ApiProperty({ description: 'PIN validity start datetime (ISO 8601)' })
  @IsDateString()
  readonly validFrom!: string;

  @ApiProperty({ description: 'PIN validity end datetime (ISO 8601)' })
  @IsDateString()
  readonly validTo!: string;

  @ApiPropertyOptional({
    description: 'Credential status: 1=Active, 2=Revoked, 3=Expired',
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @IsIn([1, 2, 3])
  readonly status?: number;

  @ApiPropertyOptional({
    description: 'Data status: 0=Unavailable, 1=Available, 2=Hidden',
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1, 2])
  readonly dataStatus?: number;

  @ApiPropertyOptional({ description: 'Credential issued datetime (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  readonly issuedAt?: string;

  @ApiPropertyOptional({ description: 'Provider credential identifier', maxLength: 128 })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  readonly providerCredentialId?: string;

  @ApiPropertyOptional({ description: 'Provider raw payload object' })
  @IsOptional()
  @IsObject()
  readonly providerPayload?: Record<string, unknown>;
}
