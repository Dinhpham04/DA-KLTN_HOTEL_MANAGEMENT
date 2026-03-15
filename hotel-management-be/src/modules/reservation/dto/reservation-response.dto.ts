import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Reserve, Client, Facility, Room, StayType, RoomType, RoomClass } from '@prisma/client';

type ReserveWithRelations = Reserve & {
  client?: (Client & { country?: { countryNameEn: string } | null }) | null;
  facility?: Facility | null;
  room?: (Room & { roomType?: (RoomType & { roomClass?: RoomClass | null }) | null }) | null;
  stayType?: StayType | null;
};

export class ReservationResponseDto {
  @ApiProperty() readonly reserveId!: number;
  @ApiPropertyOptional() readonly clientId!: number | null;
  @ApiPropertyOptional() readonly facilityId!: number | null;
  @ApiPropertyOptional() readonly roomId!: number | null;
  @ApiPropertyOptional() readonly stayTypeId!: number | null;
  @ApiProperty() readonly dataStatus!: number;
  @ApiProperty() readonly reserveStatus!: number;
  @ApiPropertyOptional() readonly reserveType!: number | null;
  @ApiPropertyOptional() readonly deleteStatus!: number | null;
  @ApiPropertyOptional() readonly periodFrom!: Date | null;
  @ApiPropertyOptional() readonly periodTo!: Date | null;
  @ApiProperty() readonly confirmFlag!: boolean;
  @ApiProperty() readonly checkinFlag!: boolean;
  @ApiPropertyOptional() readonly checkedInAt!: Date | null;
  @ApiPropertyOptional() readonly checkoutAt!: Date | null;
  @ApiPropertyOptional() readonly bookingUnitPrice!: number | null;
  @ApiPropertyOptional() readonly adjustmentUnitPrice!: number | null;
  @ApiPropertyOptional() readonly deposit!: number | null;
  @ApiPropertyOptional() readonly note!: string | null;
  @ApiPropertyOptional() readonly memo!: string | null;
  @ApiPropertyOptional() readonly advertisingType!: number | null;
  @ApiPropertyOptional() readonly cancelReason!: string | null;
  @ApiPropertyOptional() readonly cancelledAt!: Date | null;
  @ApiProperty() readonly petFlag!: boolean;
  @ApiPropertyOptional() readonly chargeStaffId!: number | null;
  @ApiPropertyOptional() readonly checkinReceptionistId!: number | null;
  @ApiPropertyOptional() readonly checkoutReceptionistId!: number | null;
  @ApiPropertyOptional() readonly confirmStaffId!: number | null;
  @ApiProperty() readonly createdAt!: Date;
  @ApiProperty() readonly updatedAt!: Date;

  // Joined fields
  @ApiPropertyOptional() readonly clientName?: string;
  @ApiPropertyOptional() readonly facilityName?: string;
  @ApiPropertyOptional() readonly roomNumber?: string;
  @ApiPropertyOptional() readonly roomTypeName?: string;
  @ApiPropertyOptional() readonly roomClassName?: string;
  @ApiPropertyOptional() readonly stayTypeName?: string;

  static fromEntity(reserve: ReserveWithRelations): ReservationResponseDto {
    return Object.assign(new ReservationResponseDto(), {
      reserveId: reserve.reserveId,
      clientId: reserve.clientId,
      facilityId: reserve.facilityId,
      roomId: reserve.roomId,
      stayTypeId: reserve.stayTypeId,
      dataStatus: reserve.dataStatus,
      reserveStatus: reserve.reserveStatus,
      reserveType: reserve.reserveType,
      deleteStatus: reserve.deleteStatus,
      periodFrom: reserve.periodFrom,
      periodTo: reserve.periodTo,
      confirmFlag: reserve.confirmFlag,
      checkinFlag: reserve.checkinFlag,
      checkedInAt: reserve.checkedInAt,
      checkoutAt: reserve.checkoutAt,
      bookingUnitPrice: reserve.bookingUnitPrice,
      adjustmentUnitPrice: reserve.adjustmentUnitPrice,
      deposit: reserve.deposit,
      note: reserve.note,
      memo: reserve.memo,
      advertisingType: reserve.advertisingType,
      cancelReason: reserve.cancelReason,
      cancelledAt: reserve.cancelledAt,
      petFlag: reserve.petFlag,
      chargeStaffId: reserve.chargeStaffId,
      checkinReceptionistId: reserve.checkinReceptionistId,
      checkoutReceptionistId: reserve.checkoutReceptionistId,
      confirmStaffId: reserve.confirmStaffId,
      createdAt: reserve.createdAt,
      updatedAt: reserve.updatedAt,
      clientName: reserve.client?.clientName,
      facilityName: reserve.facility?.facilityName,
      roomNumber: reserve.room?.roomNumber,
      roomTypeName: reserve.room?.roomType?.roomTypeName,
      roomClassName: reserve.room?.roomType?.roomClass?.roomClassName,
      stayTypeName: reserve.stayType?.stayTypeNameEn,
    } satisfies Record<keyof ReservationResponseDto, unknown>);
  }
}
