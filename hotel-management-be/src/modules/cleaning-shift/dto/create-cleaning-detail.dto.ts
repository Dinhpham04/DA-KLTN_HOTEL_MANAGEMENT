import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CleaningDataType } from '../enums';

export class CreateCleaningDetailDto {
  @ApiProperty({ description: 'Facility ID' })
  @IsInt()
  readonly facilityId!: number;

  @ApiProperty({ description: 'Data type (1=Room, 2=CommonArea, 3=KeySafety)', enum: CleaningDataType })
  @IsEnum(CleaningDataType)
  readonly dataType!: CleaningDataType;

  @ApiPropertyOptional({ description: 'Room ID (required for Type 1 & 3)' })
  @IsOptional()
  @IsInt()
  readonly roomId?: number;

  @ApiPropertyOptional({ description: 'Reservation ID' })
  @IsOptional()
  @IsInt()
  readonly reserveId?: number;

  @ApiPropertyOptional({ description: 'Common area name (used when roomId is null for Type 2)' })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly areaName?: string;

  @ApiPropertyOptional({ description: 'Main staff ID' })
  @IsOptional()
  @IsInt()
  readonly mainStaffId?: number;

  @ApiPropertyOptional({ description: 'Sub staff ID' })
  @IsOptional()
  @IsInt()
  readonly subStaffId?: number;

  @ApiPropertyOptional({ description: 'Check staff ID' })
  @IsOptional()
  @IsInt()
  readonly checkStaffId?: number;

  @ApiPropertyOptional({ description: 'Main staff is external contractor' })
  @IsOptional()
  @IsBoolean()
  readonly mainStaffExternalFlag?: boolean;

  @ApiPropertyOptional({ description: 'Sub staff is external contractor' })
  @IsOptional()
  @IsBoolean()
  readonly subStaffExternalFlag?: boolean;

  @ApiPropertyOptional({ description: 'Check staff is external contractor' })
  @IsOptional()
  @IsBoolean()
  readonly checkStaffExternalFlag?: boolean;

  @ApiPropertyOptional({ description: 'Scheduled date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  readonly scheduledDate?: string;

  @ApiPropertyOptional({ description: 'Comment', maxLength: 1024 })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  readonly comment?: string;

  @ApiPropertyOptional({ description: 'Order number' })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly orderNum?: number;
}
