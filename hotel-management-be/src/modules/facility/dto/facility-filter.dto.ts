import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@common/dto/pagination.dto';

export class FacilityFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by facility name or number' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by facility type (1=Hotel, 2=TrunkRoom)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  facilityType?: number;

  @ApiPropertyOptional({ description: 'Filter by data status' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dataStatus?: number;
}
