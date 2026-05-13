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

export class CreateSaleDetailDto {
  @ApiProperty({ description: 'Reservation ID' })
  @IsInt()
  @Type(() => Number)
  readonly reserveId!: number;

  @ApiProperty({ description: 'Request type ID' })
  @IsInt()
  @Type(() => Number)
  readonly requestTypeId!: number;

  @ApiPropertyOptional({ description: 'Linked request detail ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly requestDetailId?: number;

  @ApiPropertyOptional({ description: 'Payment type ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paymentTypeId?: number;

  @ApiPropertyOptional({ description: 'Payment method ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paymentMethodId?: number;

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

  @ApiPropertyOptional({ description: 'Confirmation flag', default: true })
  @IsOptional()
  @IsBoolean()
  readonly isConfirmed?: boolean;

  @ApiPropertyOptional({ description: 'Confirmed date (ISO datetime)' })
  @IsOptional()
  @IsDateString()
  readonly confirmedDate?: string;

  @ApiPropertyOptional({ description: 'Request from (ISO date)' })
  @IsOptional()
  @IsDateString()
  readonly requestFrom?: string;

  @ApiPropertyOptional({ description: 'Request to (ISO date)' })
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

  @ApiPropertyOptional({ description: 'Total price (payment amount)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly totalPrice?: number;

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

  @ApiPropertyOptional({ description: 'Summary / note', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly summary?: string;

  @ApiPropertyOptional({ description: 'Sale date (ISO date)' })
  @IsOptional()
  @IsDateString()
  readonly saleDate?: string;

  @ApiPropertyOptional({ description: 'Receipt payment date (ISO date)' })
  @IsOptional()
  @IsDateString()
  readonly receiptPaymentDate?: string;
}
