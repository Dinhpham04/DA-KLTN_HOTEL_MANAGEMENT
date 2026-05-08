import { IsInt, IsString, IsOptional, MaxLength, IsDateString, Min, IsArray, ValidateNested } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateReserveOccupierItemDto {
  @ApiProperty({ description: 'Occupier full name', maxLength: 256 })
  @IsString()
  @MaxLength(256)
  readonly occupierName!: string

  @ApiPropertyOptional({ description: 'Sex (0=Female, 1=Male, 9=Unknown)', default: 9 })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly sex?: number

  @ApiPropertyOptional({ description: 'Birthday (ISO date string YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  readonly birthday?: string | null

  @ApiPropertyOptional({ description: 'Address', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly address1?: string

  @ApiPropertyOptional({ description: 'Phone number', maxLength: 18 })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  readonly tel?: string

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly orderNum?: number
}

export class CreateReserveOccupierDto extends CreateReserveOccupierItemDto {
  @ApiProperty({ description: 'Reservation ID' })
  @IsInt()
  @Type(() => Number)
  readonly reserveId!: number
}

export class CreateReserveOccupierBatchDto {
  @ApiProperty({ description: 'Reservation ID' })
  @IsInt()
  @Type(() => Number)
  readonly reserveId!: number

  @ApiProperty({ description: 'List of occupiers', type: [CreateReserveOccupierItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReserveOccupierItemDto)
  readonly occupiers!: CreateReserveOccupierItemDto[]
}
