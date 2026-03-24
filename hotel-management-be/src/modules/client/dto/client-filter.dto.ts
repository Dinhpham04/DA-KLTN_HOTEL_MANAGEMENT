import { IsInt, IsOptional, IsString, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@common/dto/pagination.dto';

export class ClientFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Generic search by name, email, or phone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by client name' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ description: 'Filter by contact name' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ description: 'Filter by email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Filter by home phone (tel)' })
  @IsOptional()
  @IsString()
  tel?: string;

  @ApiPropertyOptional({ description: 'Filter by mobile phone (telPhone)' })
  @IsOptional()
  @IsString()
  telPhone?: string;

  @ApiPropertyOptional({ description: 'Filter by emergency phone (telEmergency)' })
  @IsOptional()
  @IsString()
  telEmergency?: string;

  @ApiPropertyOptional({
    description: 'Filter by client types (1=Individual, 2=Corporation, 3=Special Corporation)',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number);
    if (typeof value === 'string') return [Number(value)];
    return value !== undefined ? [Number(value)] : undefined;
  })
  dataTypes?: number[];

  @ApiPropertyOptional({ description: 'Filter by client type (0=Not specified, 1=Individual, 2=Corporation, 3=Special Corporation)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dataType?: number;

  @ApiPropertyOptional({ description: 'Filter by data status (0=Unavailable, 1=Available, 2=Hidden)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dataStatus?: number;

  @ApiPropertyOptional({ description: 'Filter by country ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  countryId?: number;
}
