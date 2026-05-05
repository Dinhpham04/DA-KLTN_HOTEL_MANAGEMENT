import { ApiProperty } from '@nestjs/swagger';

export class RoomClassCountsDto {
  @ApiProperty()
  roomClassId!: number;

  @ApiProperty()
  roomClassName!: string;

  @ApiProperty()
  orderNum!: number;

  @ApiProperty()
  countRoomClassEmptyBefore!: number;

  @ApiProperty()
  countRoomClassEmptyToday!: number;

  @ApiProperty()
  selectedCheckinDate!: number;

  @ApiProperty()
  selectedCheckoutDate!: number;

  @ApiProperty()
  countTypeRoom!: number;
}

export class TargetResidualRoomDto {
  @ApiProperty({ nullable: true, type: String })
  id!: string | null;

  @ApiProperty()
  number!: number;
}

export class DailyBusinessRoomCountsDto {
  @ApiProperty({ type: [RoomClassCountsDto] })
  roomClasses!: RoomClassCountsDto[];

  @ApiProperty()
  totalReserves!: number;

  @ApiProperty()
  arrivingRooms!: number;

  @ApiProperty()
  departingRooms!: number;

  @ApiProperty()
  totalRoomEmptyToday!: number;

  @ApiProperty()
  totalRoom!: number;

  @ApiProperty({
    description:
      'Sum of empty rooms from start of week (preceding Monday) up to the day before the target date',
  })
  emptyRoom!: number;

  @ApiProperty()
  formattedCurrentTime!: string;
}

export class DailyBusinessDto {
  @ApiProperty({ type: DailyBusinessRoomCountsDto })
  roomCounts!: DailyBusinessRoomCountsDto;

  @ApiProperty({ type: TargetResidualRoomDto })
  targetResidualRoom!: TargetResidualRoomDto;
}

export class DailyBusinessResponseDto {
  @ApiProperty({ type: DailyBusinessDto })
  businesses!: DailyBusinessDto;
}

export class AnnouncementItemDto {
  @ApiProperty()
  announcementId!: number;

  @ApiProperty({ nullable: true, type: String })
  detail!: string | null;

  @ApiProperty()
  orderNum!: number;

  @ApiProperty({ nullable: true, type: Number })
  dataStatus!: number | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class PaginationDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  perPage!: number;

  @ApiProperty()
  currentPage!: number;

  @ApiProperty()
  lastPage!: number;
}

export class AnnouncementListResponseDto {
  @ApiProperty({ type: [AnnouncementItemDto] })
  announcements!: AnnouncementItemDto[];

  @ApiProperty({ type: PaginationDto })
  pagination!: PaginationDto;
}

export class SaleSettingDto {
  @ApiProperty()
  settingId!: number;

  @ApiProperty({ description: 'YYYY/MM/DD' })
  defaultSaleDate!: string;
}

export class SaleSettingResponseDto {
  @ApiProperty({ type: SaleSettingDto })
  setting!: SaleSettingDto;
}
