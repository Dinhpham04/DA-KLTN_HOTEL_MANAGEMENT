import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@common/dto/pagination.dto';

export class RoomTypeFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by room type name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by room class ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roomClassId?: number;

  @ApiPropertyOptional({ description: 'Filter by facility ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  facilityId?: number;

  @ApiPropertyOptional({ description: 'Filter by data status' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dataStatus?: number;
}
