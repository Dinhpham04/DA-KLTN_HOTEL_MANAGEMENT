import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';

const DATE_PATTERN = /^\d{4}[/-]\d{2}[/-]\d{2}$/;

export class DailyBusinessFilterDto {
  @ApiPropertyOptional({
    description: 'Target date (YYYY-MM-DD or YYYY/MM/DD)',
    example: '2026/04/30',
  })
  @IsOptional()
  @IsString()
  @Matches(DATE_PATTERN, {
    message: 'date must be in YYYY/MM/DD or YYYY-MM-DD format',
  })
  date?: string;
}

export class AnnouncementFilterDto {
  @ApiPropertyOptional({
    description: 'Created date (YYYY-MM-DD or YYYY/MM/DD)',
    example: '2026/04/30',
  })
  @IsOptional()
  @IsString()
  @Matches(DATE_PATTERN, {
    message: 'date must be in YYYY/MM/DD or YYYY-MM-DD format',
  })
  date?: string;

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  perPage: number = 20;
}
