import {
  IsInt,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReservationDto {
  @ApiPropertyOptional({ description: 'Client ID' })
  @IsOptional()
  @IsInt()
  readonly clientId?: number;

  @ApiPropertyOptional({ description: 'Facility ID' })
  @IsOptional()
  @IsInt()
  readonly facilityId?: number;

  @ApiPropertyOptional({ description: 'Room ID' })
  @IsOptional()
  @IsInt()
  readonly roomId?: number;

  @ApiPropertyOptional({ description: 'Stay type ID' })
  @IsOptional()
  @IsInt()
  readonly stayTypeId?: number;

  @ApiPropertyOptional({ description: 'Period from (ISO 8601 datetime)' })
  @IsOptional()
  @IsDateString()
  readonly periodFrom?: string;

  @ApiPropertyOptional({ description: 'Period to (ISO 8601 datetime)' })
  @IsOptional()
  @IsDateString()
  readonly periodTo?: string;

  @ApiPropertyOptional({ description: 'Reserve type (1=Normal, 2=Draft)' })
  @IsOptional()
  @IsInt()
  readonly reserveType?: number;

  @ApiPropertyOptional({ description: 'Booking unit price' })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly bookingUnitPrice?: number;

  @ApiPropertyOptional({ description: 'Adjustment unit price' })
  @IsOptional()
  @IsInt()
  readonly adjustmentUnitPrice?: number;

  @ApiPropertyOptional({ description: 'Deposit amount' })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly deposit?: number;

  @ApiPropertyOptional({ description: 'Note', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly note?: string;

  @ApiPropertyOptional({ description: 'Memo' })
  @IsOptional()
  @IsString()
  readonly memo?: string;

  @ApiPropertyOptional({ description: 'Advertising type' })
  @IsOptional()
  @IsInt()
  readonly advertisingType?: number;

  @ApiPropertyOptional({ description: 'Pet flag' })
  @IsOptional()
  @IsBoolean()
  readonly petFlag?: boolean;

  @ApiPropertyOptional({ description: 'Charge staff ID' })
  @IsOptional()
  @IsInt()
  readonly chargeStaffId?: number;

  @ApiPropertyOptional({ description: 'Data status' })
  @IsOptional()
  @IsInt()
  readonly dataStatus?: number;
}
