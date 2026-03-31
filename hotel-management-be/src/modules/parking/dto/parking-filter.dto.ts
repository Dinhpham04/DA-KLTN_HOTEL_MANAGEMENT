import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ParkingFilterDto {
  @ApiPropertyOptional({ description: 'Filter by facility ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  facilityId?: number;
}
