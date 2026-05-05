import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { CLEANING_REASON_VALUES, CleaningReason } from '../enums';

function toStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];
  const values = rawValues
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return values.length > 0 ? values : undefined;
}

export class GenerateCleaningShiftsDto {
  @IsDateString()
  cleaningDate!: string;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  facilityIds?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(256, { each: true })
  commonAreaNames?: string[];

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsIn(CLEANING_REASON_VALUES, { each: true })
  cleaningReasons?: CleaningReason[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  mainStaffId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  automationStaffId?: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  force?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  source?: string;
}
