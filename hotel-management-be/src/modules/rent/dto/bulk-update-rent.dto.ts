import {
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class RentItemInput {
  @ApiProperty({ description: 'Stay type ID' })
  @IsInt()
  readonly stayTypeId!: number;

  @ApiProperty({ description: 'Data status (1=active, 0=inactive)' })
  @IsInt()
  readonly dataStatus!: number;

  @ApiPropertyOptional({ description: 'Day rent amount' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999)
  readonly dayRent?: number | null;

  @ApiPropertyOptional({ description: 'Month rent amount' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999999)
  readonly monthRent?: number | null;

  @ApiPropertyOptional({ description: 'Day rent over 3 people' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999)
  readonly dayRentOver3?: number | null;

  @ApiPropertyOptional({ description: 'Month rent over 3 people' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999999)
  readonly monthRentOver3?: number | null;

  @ApiPropertyOptional({ description: 'Day cleaning fee' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999)
  readonly dayCleanFee?: number | null;

  @ApiPropertyOptional({ description: 'Month cleaning fee' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999999)
  readonly monthCleanFee?: number | null;

  @ApiPropertyOptional({ description: 'Day cleaning fee over 3 people' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999)
  readonly dayCleanFeeOver3?: number | null;

  @ApiPropertyOptional({ description: 'Month cleaning fee over 3 people' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999999)
  readonly monthCleanFeeOver3?: number | null;

  @ApiPropertyOptional({ description: 'Day maintenance fee' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999)
  readonly dayMainteFee?: number | null;

  @ApiPropertyOptional({ description: 'Day utility fee' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999)
  readonly dayUtilityFee?: number | null;

  @ApiPropertyOptional({ description: 'Deposit pay' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999999)
  readonly depositPay?: number | null;

  @ApiPropertyOptional({ description: 'Deposit pay over 3 people' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999999)
  readonly depositPayOver3?: number | null;
}

class RentGroupInput {
  @ApiProperty({ description: 'Room type ID' })
  @IsInt()
  readonly roomTypeId!: number;

  @ApiPropertyOptional({ description: 'Room class ID' })
  @IsOptional()
  @IsInt()
  readonly roomClassId?: number;

  @ApiPropertyOptional({ description: 'Month maintenance fee (shared per room type)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999999)
  readonly monthMainteFee?: number | null;

  @ApiPropertyOptional({ description: 'Month utility fee (shared per room type)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999999)
  readonly monthUtilityFee?: number | null;

  @ApiProperty({ description: 'Rent items per stay type', type: [RentItemInput] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RentItemInput)
  readonly rents!: RentItemInput[];
}

export class BulkUpdateRentDto {
  @ApiProperty({ description: 'Rent data grouped by room type', type: [RentGroupInput] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RentGroupInput)
  readonly data!: RentGroupInput[];
}
