import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

const DATE_PATTERN = /^\d{4}[/-]\d{2}[/-]\d{2}$/;

function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return value === true || value === 'true' || value === '1' || value === 1;
}

export class DailyReserveFilterDto {
  @ApiPropertyOptional({
    description: 'Target check-in date (YYYY-MM-DD or YYYY/MM/DD)',
    example: '2026/04/30',
  })
  @IsOptional()
  @IsString()
  @Matches(DATE_PATTERN, {
    message: 'date must be in YYYY/MM/DD or YYYY-MM-DD format',
  })
  readonly date?: string;

  @ApiPropertyOptional({
    description: 'Legacy query name for target check-in date (YYYY-MM-DD or YYYY/MM/DD)',
    example: '2026/04/30',
  })
  @IsOptional()
  @IsString()
  @Matches(DATE_PATTERN, {
    message: 'time must be in YYYY/MM/DD or YYYY-MM-DD format',
  })
  readonly time?: string;

  @ApiPropertyOptional({
    description: 'When true, return only reservations charged to the current staff',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  readonly dashboardFlag?: boolean;

  @ApiPropertyOptional({
    description: 'Legacy snake_case dashboard flag alias',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  readonly dashboard_flag?: boolean;
}
