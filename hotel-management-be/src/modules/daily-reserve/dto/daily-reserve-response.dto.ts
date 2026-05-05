import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DailyReserveSmartLockDto {
  @ApiPropertyOptional() readonly roomPinCredentialId!: number | null;
  @ApiPropertyOptional() readonly maskedPin!: string | null;
  @ApiPropertyOptional() readonly cardCount!: number | null;
  @ApiPropertyOptional() readonly validFrom!: Date | null;
  @ApiPropertyOptional() readonly validTo!: Date | null;
  @ApiPropertyOptional() readonly status!: number | null;
}

export class DailyReserveServiceFlagsDto {
  @ApiProperty() readonly deliverybox!: boolean;
  @ApiProperty() readonly parking!: boolean;
  @ApiProperty() readonly bicycleParking!: boolean;
  @ApiProperty() readonly pet!: boolean;
  @ApiProperty() readonly futon!: boolean;
}

export class DailyReserveParkingDto {
  @ApiProperty() readonly id!: number;
  @ApiProperty() readonly type!: 'car' | 'bicycle';
  @ApiPropertyOptional() readonly number!: string | null;
  @ApiPropertyOptional() readonly facilityName!: string | null;
  @ApiPropertyOptional() readonly periodFrom!: Date | null;
  @ApiPropertyOptional() readonly periodTo!: Date | null;
  @ApiProperty() readonly checkinFlag!: boolean;
  @ApiProperty() readonly checkoutFlag!: boolean;
}

export class DailyReserveItemDto {
  @ApiProperty() readonly reserveId!: number;
  @ApiPropertyOptional() readonly clientId!: number | null;
  @ApiPropertyOptional() readonly clientName!: string | null;
  @ApiPropertyOptional() readonly contactName!: string | null;
  @ApiPropertyOptional() readonly clientDataType!: number | null;
  @ApiPropertyOptional() readonly facilityId!: number | null;
  @ApiPropertyOptional() readonly facilityNo!: string | null;
  @ApiPropertyOptional() readonly facilityName!: string | null;
  @ApiPropertyOptional() readonly roomId!: number | null;
  @ApiPropertyOptional() readonly roomNumber!: string | null;
  @ApiPropertyOptional() readonly occupierName!: string | null;
  @ApiPropertyOptional() readonly periodFrom!: Date | null;
  @ApiPropertyOptional() readonly periodTo!: Date | null;
  @ApiPropertyOptional() readonly lastStayDate!: Date | null;
  @ApiPropertyOptional() readonly newReserveDate!: Date | null;
  @ApiProperty() readonly rentalTime!: number;
  @ApiProperty() readonly result!: string;
  @ApiProperty() readonly flagOrderFirst!: boolean;
  @ApiProperty() readonly confirmFlag!: boolean;
  @ApiProperty() readonly checkinFlag!: boolean;
  @ApiProperty() readonly canCheckIn!: boolean;
  @ApiProperty() readonly directcheckinFlag!: boolean;
  @ApiPropertyOptional() readonly directcheckinType!: number | null;
  @ApiPropertyOptional() readonly directcheckinNote!: string | null;
  @ApiPropertyOptional() readonly note!: string | null;
  @ApiPropertyOptional() readonly advertisingType!: number | null;
  @ApiPropertyOptional() readonly chargeStaffId!: number | null;
  @ApiPropertyOptional() readonly chargeStaffName!: string | null;
  @ApiPropertyOptional() readonly chargeStaffNameShort!: string | null;
  @ApiPropertyOptional() readonly diContactStaffId!: number | null;
  @ApiPropertyOptional() readonly diContactStaffName!: string | null;
  @ApiPropertyOptional() readonly checkinReceptionistId!: number | null;
  @ApiPropertyOptional() readonly checkinReceptionistName!: string | null;
  @ApiPropertyOptional() readonly deliveryboxCardNumber!: string | null;
  @ApiProperty() readonly parkingReservesCount!: number;
  @ApiProperty() readonly bicycleParkingReservesCount!: number;
  @ApiProperty() readonly serviceFlags!: DailyReserveServiceFlagsDto;
  @ApiProperty() readonly smartLock!: DailyReserveSmartLockDto;
  @ApiProperty({ type: [DailyReserveParkingDto] }) readonly parkingReserves!: DailyReserveParkingDto[];
}

export class DailyReserveResponseDto {
  @ApiProperty({ type: [DailyReserveItemDto] })
  readonly reserves!: DailyReserveItemDto[];

  @ApiProperty()
  readonly statusCode!: number;
}

export class UpdateDailyReserveResponseDto {
  @ApiProperty()
  readonly statusCode!: number;
}

export class UpdateAllDailyReserveResponseDto {
  @ApiProperty()
  readonly statusCode!: number;

  @ApiProperty({ type: [Object] })
  readonly errors!: Array<{ index: number; reserveId?: number; error: string }>;
}
