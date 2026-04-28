import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CleaningDataType } from '../enums';

export class CleaningShiftFilterDto {
  @ApiProperty({ description: 'Cleaning date (YYYY-MM-DD)', example: '2026-04-28' })
  @IsDateString()
  readonly cleaningDate!: string;

  @ApiProperty({ description: 'Facility ID', example: 1 })
  @IsInt()
  @Type(() => Number)
  readonly facilityId!: number;

  @ApiPropertyOptional({
    description: 'Filter by data type (1=Room, 2=CommonArea, 3=KeySafety)',
    enum: CleaningDataType,
  })
  @IsOptional()
  @IsEnum(CleaningDataType)
  @Type(() => Number)
  readonly dataType?: CleaningDataType;
}
