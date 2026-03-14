import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@common/dto/pagination.dto';

export class RoomClassFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by room class name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by data status' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dataStatus?: number;
}
