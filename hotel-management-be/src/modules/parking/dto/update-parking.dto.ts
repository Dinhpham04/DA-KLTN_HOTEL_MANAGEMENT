import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class ParkingRentInput {
  @ApiPropertyOptional({ description: 'Stay type ID' })
  @IsInt()
  readonly stayTypeId!: number;

  @ApiPropertyOptional({ description: 'Rent amount' })
  @IsInt()
  @Min(0)
  @Max(999999)
  readonly rent!: number;
}

export class UpdateParkingDto {
  @ApiPropertyOptional({ description: 'Parent facility ID' })
  @IsOptional()
  @IsInt()
  readonly parentFacilityId?: number;

  @ApiPropertyOptional({ description: 'Parking number/code', maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  readonly number?: string | null;

  @ApiPropertyOptional({ description: 'Height limit in meters' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  readonly heightLimit?: number;

  @ApiPropertyOptional({ description: 'Notice/special notes', maxLength: 512 })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  readonly notice?: string;

  @ApiPropertyOptional({ description: 'Order number' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999999)
  readonly orderNum?: number;

  @ApiPropertyOptional({ description: 'Data status (0=unavailable, 1=available)' })
  @IsOptional()
  @IsInt()
  readonly dataStatus?: number;

  @ApiPropertyOptional({ description: 'Parking rents per stay type', type: [ParkingRentInput] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParkingRentInput)
  readonly parkingRents?: ParkingRentInput[];
}
