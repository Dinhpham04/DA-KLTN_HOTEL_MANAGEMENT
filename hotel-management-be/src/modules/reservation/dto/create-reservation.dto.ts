import {
  IsInt,
  IsIn,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({ description: 'Client ID' })
  @IsInt()
  readonly clientId!: number;

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

  @ApiProperty({ description: 'Period from (ISO 8601 datetime)' })
  @IsDateString()
  readonly periodFrom!: string;

  @ApiProperty({ description: 'Period to (ISO 8601 datetime)' })
  @IsDateString()
  readonly periodTo!: string;

  @ApiPropertyOptional({ description: 'Buffer days before reservation' })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly noreserveCountBefore?: number;

  @ApiPropertyOptional({ description: 'Buffer days after reservation' })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly noreserveCountAfter?: number;

  @ApiPropertyOptional({ description: 'Reserve type: 1=Normal, 2=English' })
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

  @ApiPropertyOptional({
    description:
      'Advertising type: 0=Unknown, 1=Repeat/Referral, 2=Walk-in, 3=Official Website, 4=OTA, 5=Social Media, 9=Other',
  })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1, 2, 3, 4, 5, 9])
  readonly advertisingType?: number;

  @ApiPropertyOptional({ description: 'Draft flag', default: false })
  @IsOptional()
  @IsBoolean()
  readonly draftFlag?: boolean;

  @ApiPropertyOptional({ description: 'Memo flag', default: false })
  @IsOptional()
  @IsBoolean()
  readonly memoFlag?: boolean;

  @ApiPropertyOptional({ description: 'Confirm flag', default: false })
  @IsOptional()
  @IsBoolean()
  readonly confirmFlag?: boolean;

  // Direct check-in
  @ApiPropertyOptional({ description: 'Direct check-in flag', default: false })
  @IsOptional()
  @IsBoolean()
  readonly directcheckinFlag?: boolean;

  @ApiPropertyOptional({
    description:
      'Direct check-in type: 1=Front Desk, 2=Self Check-in (PIN), 3=Meet & Greet',
  })
  @IsOptional()
  @IsInt()
  @IsIn([1, 2, 3])
  readonly directcheckinType?: number;

  @ApiPropertyOptional({ description: 'Direct check-in note', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly directcheckinNote?: string;

  @ApiPropertyOptional({ description: 'Contacted flag' })
  @IsOptional()
  @IsBoolean()
  readonly contactedFlag?: boolean;

  @ApiPropertyOptional({ description: 'Check-in date (ISO 8601 datetime)' })
  @IsOptional()
  @IsDateString()
  readonly checkinDate?: string | null;

  // Pet
  @ApiPropertyOptional({ description: 'Pet flag', default: false })
  @IsOptional()
  @IsBoolean()
  readonly petFlag?: boolean;

  @ApiPropertyOptional({ description: 'Dog count' })
  @IsOptional()
  @IsInt()
  readonly dogCount?: number;

  @ApiPropertyOptional({ description: 'Cat count' })
  @IsOptional()
  @IsInt()
  readonly catCount?: number;

  @ApiPropertyOptional({ description: 'Other pet count' })
  @IsOptional()
  @IsInt()
  readonly otherCount?: number;

  @ApiPropertyOptional({ description: 'Pet note', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly petNote?: string;

  // Notes
  @ApiPropertyOptional({ description: 'Note', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly note?: string;

  @ApiPropertyOptional({ description: 'Memo' })
  @IsOptional()
  @IsString()
  readonly memo?: string;

  @ApiPropertyOptional({ description: 'Amendment', maxLength: 128 })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  readonly amendment?: string;

  @ApiPropertyOptional({ description: 'Announcement', maxLength: 1024 })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  readonly announcement?: string;

  @ApiPropertyOptional({ description: 'Request announcement', maxLength: 1024 })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  readonly requestAnnouncement?: string;

  @ApiPropertyOptional({ description: 'Sale announcement', maxLength: 1024 })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  readonly saleAnnouncement?: string;

  // Flags
  @ApiPropertyOptional({ description: 'Futon flag', default: false })
  @IsOptional()
  @IsBoolean()
  readonly futonFlag?: boolean;

  @ApiPropertyOptional({ description: 'Deliverybox flag', default: false })
  @IsOptional()
  @IsBoolean()
  readonly deliveryboxFlag?: boolean;

  @ApiPropertyOptional({ description: 'Deliverybox card number', maxLength: 16 })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  readonly deliveryboxCardNumber?: string;

  @ApiPropertyOptional({ description: 'Campaign price flag', default: false })
  @IsOptional()
  @IsBoolean()
  readonly campaignPriceFlag?: boolean;

  @ApiPropertyOptional({ description: 'Auto extend flag', default: false })
  @IsOptional()
  @IsBoolean()
  readonly autoExtendFlag?: boolean;

  // Staff references
  @ApiPropertyOptional({ description: 'Charge staff ID' })
  @IsOptional()
  @IsInt()
  readonly chargeStaffId?: number;

  @ApiPropertyOptional({ description: 'Charge staff ID 2' })
  @IsOptional()
  @IsInt()
  readonly chargeStaffId2?: number;

  @ApiPropertyOptional({ description: 'DI contact staff ID' })
  @IsOptional()
  @IsInt()
  readonly diContactStaffId?: number;
}
