import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCleaningDetailType2Dto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly areaName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  readonly mainStaffId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  readonly checkStaffId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  readonly mainStaffExternalFlag?: boolean;

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
