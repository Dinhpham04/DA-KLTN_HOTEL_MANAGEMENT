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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ParkingRentInput {
  @ApiProperty({ description: 'Stay type ID' })
  @IsInt()
  readonly stayTypeId!: number;

  @ApiProperty({ description: 'Rent amount' })
  @IsInt()
  @Min(0)
  @Max(999999)
  readonly rent!: number;
}

export class CreateParkingDto {
  @ApiProperty({ description: 'Parent facility ID' })
  @IsInt()
  readonly parentFacilityId!: number;

  @ApiProperty({ description: 'Parking number/code', maxLength: 32 })
  @IsString()
  @MaxLength(32)
  readonly number!: string;

  @ApiProperty({ description: 'Height limit in meters' })
  @IsNumber()
  @Min(1)
  readonly heightLimit!: number;

  @ApiPropertyOptional({ description: 'Notice/special notes', maxLength: 512 })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  readonly notice?: string;

  @ApiPropertyOptional({ description: 'Order number', default: 99 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999999)
  readonly orderNum?: number;

  @ApiPropertyOptional({ description: 'Parking rents per stay type', type: [ParkingRentInput] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParkingRentInput)
  readonly parkingRents?: ParkingRentInput[];
}
