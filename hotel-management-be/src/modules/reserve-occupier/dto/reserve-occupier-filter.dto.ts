import { IsInt, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class ReserveOccupierFilterDto {
  @ApiPropertyOptional({ description: 'Filter by reservation ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly reserveId?: number
}
