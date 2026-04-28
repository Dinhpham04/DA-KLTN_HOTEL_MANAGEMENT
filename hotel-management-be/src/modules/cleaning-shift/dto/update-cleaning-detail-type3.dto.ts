import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCleaningDetailType3Dto {
  @ApiPropertyOptional({ description: 'Mark room as safety-checked after checkout' })
  @IsOptional()
  @IsBoolean()
  readonly checkSafetyFlag?: boolean;

  @ApiPropertyOptional({
    description: 'Manually link/relink to a RoomPinCredential record (skip auto lookup)',
  })
  @IsOptional()
  @IsInt()
  readonly roomPinCredentialId?: number | null;

  @ApiPropertyOptional({ description: 'Timestamp when staff confirmed the pin was revoked' })
  @IsOptional()
  @IsDateString()
  readonly pinRevokedConfirmedAt?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  readonly checkStaffId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  readonly checkStaffExternalFlag?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  readonly comment?: string;
}
