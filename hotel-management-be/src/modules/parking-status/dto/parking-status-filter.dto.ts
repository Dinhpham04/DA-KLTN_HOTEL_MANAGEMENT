import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ParkingStatusFilterDto {
  @ApiPropertyOptional({ description: 'Filter by facility ID' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  facilityId?: number;

  @ApiPropertyOptional({
    description: 'Type filter: 1=Both, 2=Car parking only, 3=Bicycle parking only',
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  type?: number = 1;
}
