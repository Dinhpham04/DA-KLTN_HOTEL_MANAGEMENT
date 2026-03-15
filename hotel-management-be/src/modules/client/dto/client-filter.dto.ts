import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@common/dto/pagination.dto';

export class ClientFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by name, email, or phone' })
  @IsOptional()
  @IsString()
  search?: string;

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
