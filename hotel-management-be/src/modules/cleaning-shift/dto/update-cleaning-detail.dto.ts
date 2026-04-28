import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCleaningDetailDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  readonly mainStaffId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  readonly subStaffId?: number | null;

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
  readonly subStaffExternalFlag?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  readonly checkStaffExternalFlag?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  readonly scheduledDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  readonly startDatetime?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  readonly endDatetime?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  readonly finishDatetime?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  readonly comment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly areaName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  readonly reportImg1?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  readonly reportImg2?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  readonly reportImg3?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  readonly reportImg4?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  readonly orderNum?: number;
}
