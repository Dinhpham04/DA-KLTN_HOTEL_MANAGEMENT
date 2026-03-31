import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RentFilterDto {
  @ApiPropertyOptional({ description: 'Filter by deposit flag (0=not deposited, 1=deposited)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  readonly depositFlag?: number;
}
