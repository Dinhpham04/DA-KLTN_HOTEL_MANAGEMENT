import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCleaningDetailType1Dto {
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
}
