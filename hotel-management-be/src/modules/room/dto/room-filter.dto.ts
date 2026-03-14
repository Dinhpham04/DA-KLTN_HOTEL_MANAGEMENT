import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@common/dto/pagination.dto';

export class RoomFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by room number' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by facility ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  facilityId?: number;

  @ApiPropertyOptional({ description: 'Filter by room type ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roomTypeId?: number;

  @ApiPropertyOptional({ description: 'Filter by room class ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roomClassId?: number;

  @ApiPropertyOptional({ description: 'Filter by room status' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roomStatus?: number;

  @ApiPropertyOptional({ description: 'Filter by data status (0=Unavailable, 1=Available, 2=Hidden)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dataStatus?: number;
}
