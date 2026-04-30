import { IsDateString, IsEnum, IsIn, IsInt, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CleaningDataType } from '../enums';

function toNumberArray(value: unknown): number[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const raw = Array.isArray(value) ? value : [value];
  const parsed = raw
    .flatMap((item) => String(item).split(','))
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
  return parsed.length > 0 ? parsed : undefined;
}

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

  @ApiPropertyOptional({
    description: 'Filter by room type IDs',
    type: [Number],
    example: [1, 2],
  })
  @IsOptional()
  @Transform(({ value }) => toNumberArray(value))
  readonly roomTypeIds?: number[];

  @ApiPropertyOptional({
    description: '1 = only rows that have reservation, 0/undefined = all',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly newReserveFlag?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'roomNumber',
  })
  @IsOptional()
  readonly sort?: string;

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  readonly direction?: 'asc' | 'desc';
}
