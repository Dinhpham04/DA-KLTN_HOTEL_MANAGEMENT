import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const toIntArray = ({ value }: { value: unknown }): number[] | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const raw = Array.isArray(value) ? value : String(value).split(',');
  return raw
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n) && n > 0);
};

export class WhiteboardFilterDto {
  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Facilities per page',
    default: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  perPage: number = 1;

  @ApiPropertyOptional({
    description: 'Filter by facility IDs',
    type: [Number],
  })
  @IsOptional()
  @Transform(toIntArray)
  @IsArray()
  @IsInt({ each: true })
  facilityIds?: number[];

  @ApiPropertyOptional({
    description: 'Filter by room class IDs',
    type: [Number],
  })
  @IsOptional()
  @Transform(toIntArray)
  @IsArray()
  @IsInt({ each: true })
  roomClassIds?: number[];

  @ApiPropertyOptional({
    description: 'Service types: 1=parking, 2=bicycle, 4=pet, 5=delivery box',
    type: [Number],
  })
  @IsOptional()
  @Transform(toIntArray)
  @IsArray()
  @IsInt({ each: true })
  serviceTypes?: number[];

  @ApiPropertyOptional({
    description: 'Clean/usage status filter (4=in use)',
    type: [Number],
  })
  @IsOptional()
  @Transform(toIntArray)
  @IsArray()
  @IsInt({ each: true })
  cleanTypes?: number[];

  @ApiPropertyOptional({ description: 'Filter by room number (partial match)' })
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by facility number (exact match)' })
  @IsOptional()
  @IsString()
  facilityNo?: string;

  @ApiPropertyOptional({ description: 'Period from (ISO date string)' })
  @IsOptional()
  @IsDateString()
  periodFrom?: string;

  @ApiPropertyOptional({ description: 'Period to (ISO date string)' })
  @IsOptional()
  @IsDateString()
  periodTo?: string;
}
