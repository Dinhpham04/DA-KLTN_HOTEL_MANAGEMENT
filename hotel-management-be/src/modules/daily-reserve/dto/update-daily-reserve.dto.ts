import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpdateDailyReserveDto {
  @ApiPropertyOptional({ description: 'Charge staff ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly chargeStaffId?: number | null;

  @ApiPropertyOptional({ description: 'Direct check-in contact staff ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly diContactStaffId?: number | null;

  @ApiPropertyOptional({
    description: 'Direct check-in type. Legacy values: 1=front desk, 2=smart lock building, 4=meeting point, 5=room delivery',
  })
  @IsOptional()
  @IsInt()
  @IsIn([1, 2, 3, 4, 5])
  @Type(() => Number)
  readonly directcheckinType?: number | null;

  @ApiPropertyOptional({ description: 'Reservation note', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly note?: string | null;

  @ApiPropertyOptional({ description: 'New smart lock PIN (4-12 digits)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4,12}$/)
  readonly smartLockPin?: string | null;

  @ApiPropertyOptional({ description: 'Number of issued room cards', minimum: 0, maximum: 20 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  @Type(() => Number)
  readonly smartLockCardCount?: number | null;

  @ApiPropertyOptional({
    description: 'Force check-in flag update. If omitted, issuing a PIN/card count checks in the reservation.',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  readonly checkinFlag?: boolean;
}

export class DailyReserveBulkUpdateItemDto extends UpdateDailyReserveDto {
  @ApiProperty({ description: 'Reserve ID' })
  @IsInt()
  @Type(() => Number)
  readonly reserveId!: number;
}

export class UpdateAllDailyReserveDto {
  @ApiProperty({ description: 'Daily reserve rows to update', type: [DailyReserveBulkUpdateItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DailyReserveBulkUpdateItemDto)
  readonly reserves!: DailyReserveBulkUpdateItemDto[];
}
