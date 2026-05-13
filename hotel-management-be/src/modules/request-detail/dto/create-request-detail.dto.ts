import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRequestDetailDto {
  @ApiProperty({ description: 'Reservation ID' })
  @IsInt()
  @Type(() => Number)
  readonly reserveId!: number;

  @ApiProperty({ description: 'Request type ID (fee category)' })
  @IsInt()
  @Type(() => Number)
  readonly requestTypeId!: number;

  @ApiPropertyOptional({ description: 'Stay type ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly stayTypeId?: number;

  @ApiPropertyOptional({ description: 'Occupier name', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly occupierName?: string;

  @ApiPropertyOptional({ description: 'Title prefix', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly titlePrefix?: string;

  @ApiPropertyOptional({ description: 'Title suffix', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly titleSuffix?: string;

  @ApiPropertyOptional({ description: 'Tax-free flag', default: false })
  @IsOptional()
  @IsBoolean()
  readonly taxFreeFlag?: boolean;

  @ApiPropertyOptional({ description: 'Request period from (ISO date)' })
  @IsOptional()
  @IsDateString()
  readonly requestFrom?: string;

  @ApiPropertyOptional({ description: 'Request period to (ISO date)' })
  @IsOptional()
  @IsDateString()
  readonly requestTo?: string;

  @ApiPropertyOptional({ description: 'Day count' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  readonly requestDayCount?: number;

  @ApiPropertyOptional({ description: 'Unit price' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly unitPrice?: number;

  @ApiPropertyOptional({ description: 'Total price' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly totalPrice?: number;

  @ApiPropertyOptional({ description: 'Adjusted total price' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly totalPriceChange?: number;

  @ApiPropertyOptional({ description: 'People count', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly peopleCount?: number;

  @ApiPropertyOptional({ description: 'Quantity', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  readonly count?: number;

  @ApiProperty({ description: 'Count unit (1=Day, 2=Month, 3=Time)' })
  @IsInt()
  @Type(() => Number)
  readonly countUnit!: number;

  @ApiPropertyOptional({ description: 'Charge staff ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly chargeStaffId?: number;
}
