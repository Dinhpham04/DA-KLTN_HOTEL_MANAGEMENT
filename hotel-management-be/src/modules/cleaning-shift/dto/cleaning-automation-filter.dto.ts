import { Transform, Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsInt, IsOptional } from 'class-validator';

import { CLEANING_REASON_VALUES, CleaningReason } from '../enums';

function toNumberArray(value: unknown): number[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : typeof value === 'number'
        ? [value]
        : [];
  const values = rawValues
    .map((item) => (typeof item === 'string' ? Number(item.trim()) : Number(item)))
    .filter((item) => Number.isInteger(item));
  return values.length > 0 ? values : undefined;
}

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

export class CleaningAutomationFilterDto {
  @IsDateString()
  cleaningDate!: string;

  @IsOptional()
  @Transform(({ value }) => toNumberArray(value))
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  facilityIds?: number[];

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsIn(CLEANING_REASON_VALUES, { each: true })
  cleaningReasons?: CleaningReason[];
}
