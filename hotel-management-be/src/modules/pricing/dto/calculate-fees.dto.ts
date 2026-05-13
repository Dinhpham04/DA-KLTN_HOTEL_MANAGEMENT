import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Unit of `count` field for service/parking fees.
 * 1 = Month, 2 = Day, 3 = Time(once)
 */
export enum CountUnit {
  MONTH = 1,
  DAY = 2,
  TIME = 3,
}

export class CalculateFeesDto {
  @ApiProperty({ description: 'Room type id', example: 1 })
  @IsInt()
  roomTypeId!: number;

  @ApiProperty({ description: 'Stay type id', example: 1 })
  @IsInt()
  stayTypeId!: number;

  @ApiProperty({ description: 'Period start (ISO date)', example: '2026-05-01' })
  @IsDateString()
  periodFrom!: string;

  @ApiProperty({ description: 'Period end (ISO date)', example: '2026-05-31' })
  @IsDateString()
  periodTo!: string;

  @ApiPropertyOptional({
    description: 'Number of guests (1 = 1-2 ppl, 2 = 3+ ppl)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2)
  peopleCount?: number = 1;

  @ApiProperty({
    description: 'Count unit (1=Month, 2=Day, 3=Time)',
    enum: CountUnit,
    example: CountUnit.DAY,
  })
  @IsInt()
  @Min(1)
  @Max(3)
  countUnit!: CountUnit;

  @ApiPropertyOptional({
    description: 'Service request type ids (utilities, cleaning, mainte fee...)',
    example: [6, 7, 9],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  serviceTypeIds?: number[];

  @ApiPropertyOptional({ description: 'Parking id (if applicable)', example: 1 })
  @IsOptional()
  @IsInt()
  parkingId?: number;

  @ApiPropertyOptional({ description: 'Facility id (filters facility-specific service price)' })
  @IsOptional()
  @IsInt()
  facilityId?: number;
}
