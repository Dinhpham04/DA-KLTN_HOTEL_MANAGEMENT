import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WhiteboardReserveItemDto {
  @ApiProperty()
  reserveId!: number;

  @ApiPropertyOptional({ nullable: true })
  clientId!: number | null;

  @ApiPropertyOptional({ nullable: true })
  clientName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  occupierName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  periodFrom!: string | null;

  @ApiPropertyOptional({ nullable: true })
  periodTo!: string | null;

  @ApiProperty()
  reserveStatus!: number;

  @ApiProperty()
  confirmFlag!: boolean;

  @ApiProperty()
  checkinFlag!: boolean;

  @ApiProperty()
  draftFlag!: boolean;

  @ApiProperty()
  rakutenFlag!: boolean;

  @ApiProperty()
  directcheckinFlag!: boolean;

  @ApiProperty()
  campaignPriceFlag!: boolean;

  @ApiProperty()
  disableReservation!: boolean;

  @ApiProperty()
  petFlag!: boolean;

  @ApiProperty()
  futonFlag!: boolean;

  @ApiProperty()
  deliveryboxFlag!: boolean;

  @ApiPropertyOptional({ nullable: true })
  clientDataType!: number | null;

  @ApiPropertyOptional({ nullable: true })
  clientAdvertisingType!: number | null;

  @ApiPropertyOptional({ nullable: true })
  advertisingType!: number | null;

  @ApiPropertyOptional({ nullable: true })
  earlyExitDatetime!: string | null;

  @ApiPropertyOptional({ nullable: true })
  noreserveCountBefore!: number | null;

  @ApiPropertyOptional({ nullable: true })
  noreserveCountAfter!: number | null;

  @ApiPropertyOptional({ nullable: true })
  extensionTime!: number | null;

  @ApiProperty()
  parkingReserveCount!: number;

  @ApiProperty()
  bicycleParkingReserveCount!: number;

  @ApiPropertyOptional({ nullable: true })
  memo!: string | null;
}

export class WhiteboardStayTypeRentDto {
  @ApiProperty()
  stayTypeId!: number;

  @ApiPropertyOptional({ nullable: true })
  stayTypeNameShort!: string | null;

  @ApiPropertyOptional({ nullable: true })
  price!: number | null;
}

export class WhiteboardRoomDto {
  @ApiProperty()
  roomId!: number;

  @ApiProperty()
  facilityId!: number;

  @ApiProperty()
  roomNumber!: string;

  @ApiProperty()
  roomTypeId!: number;

  @ApiPropertyOptional({ nullable: true })
  roomTypeName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  roomTypeNameShort!: string | null;

  @ApiPropertyOptional({ nullable: true })
  roomClassId!: number | null;

  @ApiPropertyOptional({ nullable: true })
  roomClassName!: string | null;

  @ApiProperty()
  roomStatus!: number;

  @ApiProperty()
  petFlag!: boolean;

  @ApiProperty()
  deliveryboxFlag!: boolean;

  @ApiPropertyOptional({ nullable: true })
  acreage!: string | null;

  @ApiProperty({ type: [WhiteboardStayTypeRentDto] })
  stayTypeRents!: WhiteboardStayTypeRentDto[];

  @ApiProperty({ type: [WhiteboardReserveItemDto] })
  usageStatus!: WhiteboardReserveItemDto[];

  @ApiProperty({ type: [Object], description: 'Reserved for future use (constructions)' })
  constructions!: unknown[];

  @ApiProperty({ type: [Object], description: 'Reserved for future use (memos)' })
  memos!: unknown[];
}

export class WhiteboardFacilityDto {
  @ApiProperty()
  facilityId!: number;

  @ApiProperty()
  facilityNo!: string;

  @ApiProperty()
  facilityName!: string;

  @ApiPropertyOptional({ nullable: true })
  colorOption!: string | null;

  @ApiProperty()
  parkingFlag!: boolean;

  @ApiProperty()
  bicycleParkingFlag!: boolean;

  @ApiProperty()
  deliveryboxFlag!: boolean;

  @ApiProperty()
  parkingCount!: number;

  @ApiProperty()
  parkingHasReserveCount!: number;

  @ApiProperty({ type: [WhiteboardRoomDto] })
  rooms!: WhiteboardRoomDto[];
}

export class WhiteboardPaginationDto {
  @ApiProperty()
  currentPage!: number;

  @ApiProperty()
  lastPage!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  perPage!: number;
}

export class WhiteboardResponseDto {
  @ApiProperty()
  pagination!: WhiteboardPaginationDto;

  @ApiProperty({ type: [WhiteboardFacilityDto] })
  usageStatuses!: WhiteboardFacilityDto[];
}
