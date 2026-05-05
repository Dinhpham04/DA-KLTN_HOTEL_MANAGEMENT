import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Reserve, Client, Facility, Room, StayType, RoomType, RoomClass, Staff } from '@prisma/client';

type ReserveWithRelations = Reserve & {
  client?: (Client & { country?: { countryNameEn: string } | null }) | null;
  facility?: Facility | null;
  room?: (Room & { roomType?: (RoomType & { roomClass?: RoomClass | null }) | null }) | null;
  stayType?: StayType | null;
  chargeStaff?: Staff | null;
  chargeStaff2?: Staff | null;
  checkinReceptionist?: Staff | null;
  checkoutReceptionist?: Staff | null;
  confirmStaff?: Staff | null;
  createdBy?: Staff | null;
  updatedBy?: Staff | null;
};

export class ReservationResponseDto {
  @ApiProperty() readonly reserveId!: number;
  @ApiPropertyOptional() readonly clientId!: number | null;
  @ApiPropertyOptional() readonly facilityId!: number | null;
  @ApiPropertyOptional() readonly roomId!: number | null;
  @ApiPropertyOptional() readonly roomTypeId!: number | null;
  @ApiPropertyOptional() readonly stayTypeId!: number | null;
  @ApiProperty() readonly dataStatus!: number;
  @ApiProperty() readonly reserveStatus!: number;
  @ApiPropertyOptional() readonly reserveType!: number | null;
  @ApiPropertyOptional() readonly deleteStatus!: number | null;

  // Flags
  @ApiProperty() readonly draftFlag!: boolean;
  @ApiProperty() readonly memoFlag!: boolean;
  @ApiProperty() readonly confirmFlag!: boolean;
  @ApiProperty() readonly checkinFlag!: boolean;
  @ApiProperty() readonly directcheckinFlag!: boolean;
  @ApiPropertyOptional() readonly directcheckinType!: number | null;
  @ApiPropertyOptional() readonly directcheckinNote!: string | null;
  @ApiProperty() readonly petFlag!: boolean;
  @ApiProperty() readonly futonFlag!: boolean;
  @ApiProperty() readonly deliveryboxFlag!: boolean;
  @ApiProperty() readonly campaignPriceFlag!: boolean;
  @ApiProperty() readonly autoExtendFlag!: boolean;
  @ApiProperty() readonly disableReservation!: boolean;
  @ApiPropertyOptional() readonly contactedFlag!: boolean | null;

  // Period
  @ApiPropertyOptional() readonly periodFrom!: Date | null;
  @ApiPropertyOptional() readonly periodTo!: Date | null;

  // Dates
  @ApiPropertyOptional() readonly checkedInAt!: Date | null;
  @ApiPropertyOptional() readonly checkoutAt!: Date | null;
  @ApiPropertyOptional() readonly checkinDate!: Date | null;
  @ApiPropertyOptional() readonly lastStayDate!: Date | null;
  @ApiPropertyOptional() readonly earlyExitDatetime!: Date | null;
  @ApiPropertyOptional() readonly paymentDueDate!: Date | null;
  @ApiPropertyOptional() readonly cancelledAt!: Date | null;

  // Pricing
  @ApiPropertyOptional() readonly bookingUnitPrice!: number | null;
  @ApiPropertyOptional() readonly adjustmentUnitPrice!: number | null;
  @ApiPropertyOptional() readonly deposit!: number | null;

  // Pet
  @ApiPropertyOptional() readonly dogCount!: number | null;
  @ApiPropertyOptional() readonly catCount!: number | null;
  @ApiPropertyOptional() readonly otherCount!: number | null;
  @ApiPropertyOptional() readonly petNote!: string | null;

  // Key management
  @ApiPropertyOptional() readonly rentalKeys!: number | null;
  @ApiPropertyOptional() readonly returnKeys!: number | null;
  @ApiPropertyOptional() readonly keyReturnContactType!: number | null;
  @ApiPropertyOptional() readonly keyReturnFlag!: boolean | null;

  // Notes
  @ApiPropertyOptional() readonly note!: string | null;
  @ApiPropertyOptional() readonly memo!: string | null;
  @ApiPropertyOptional() readonly overdueDebtNote!: string | null;
  @ApiPropertyOptional() readonly amendment!: string | null;
  @ApiPropertyOptional() readonly cancelReason!: string | null;
  @ApiPropertyOptional() readonly announcement!: string | null;
  @ApiPropertyOptional() readonly requestAnnouncement!: string | null;
  @ApiPropertyOptional() readonly saleAnnouncement!: string | null;
  @ApiPropertyOptional() readonly noticeComment!: string | null;

  @ApiPropertyOptional() readonly advertisingType!: number | null;
  @ApiPropertyOptional() readonly roomDirtyLevel!: number | null;

  // Staff IDs
  @ApiPropertyOptional() readonly chargeStaffId!: number | null;
  @ApiPropertyOptional() readonly chargeStaffId2!: number | null;
  @ApiPropertyOptional() readonly checkinReceptionistId!: number | null;
  @ApiPropertyOptional() readonly diContactStaffId!: number | null;
  @ApiPropertyOptional() readonly checkoutReceptionistId!: number | null;
  @ApiPropertyOptional() readonly checkoutReceptionistId2!: number | null;
  @ApiPropertyOptional() readonly confirmStaffId!: number | null;

  // Audit
  @ApiProperty() readonly createdAt!: Date;
  @ApiProperty() readonly updatedAt!: Date;

  // Joined fields
  @ApiPropertyOptional() readonly clientName?: string;
  @ApiPropertyOptional() readonly clientNameEn?: string;
  @ApiPropertyOptional() readonly clientTel?: string;
  @ApiPropertyOptional() readonly facilityName?: string;
  @ApiPropertyOptional() readonly facilityNo?: string;
  @ApiPropertyOptional() readonly roomNumber?: string;
  @ApiPropertyOptional() readonly roomTypeName?: string;
  @ApiPropertyOptional() readonly roomClassName?: string;
  @ApiPropertyOptional() readonly stayTypeName?: string;
  @ApiPropertyOptional() readonly chargeStaffName?: string;
  @ApiPropertyOptional() readonly chargeStaff2Name?: string;
  @ApiPropertyOptional() readonly confirmStaffName?: string;
  @ApiPropertyOptional() readonly createdStaffName?: string;
  @ApiPropertyOptional() readonly updatedStaffName?: string;
  @ApiPropertyOptional() readonly checkoutReceptionistName?: string;

  static fromEntity(reserve: ReserveWithRelations): ReservationResponseDto {
    return Object.assign(new ReservationResponseDto(), {
      reserveId: reserve.reserveId,
      clientId: reserve.clientId,
      facilityId: reserve.facilityId,
      roomId: reserve.roomId,
      roomTypeId: reserve.room?.roomTypeId ?? null,
      stayTypeId: reserve.stayTypeId,
      dataStatus: reserve.dataStatus,
      reserveStatus: reserve.reserveStatus,
      reserveType: reserve.reserveType,
      deleteStatus: reserve.deleteStatus,

      draftFlag: reserve.draftFlag,
      memoFlag: reserve.memoFlag,
      confirmFlag: reserve.confirmFlag,
      checkinFlag: reserve.checkinFlag,
      directcheckinFlag: reserve.directcheckinFlag,
      directcheckinType: reserve.directcheckinType,
      directcheckinNote: reserve.directcheckinNote,
      petFlag: reserve.petFlag,
      futonFlag: reserve.futonFlag,
      deliveryboxFlag: reserve.deliveryboxFlag,
      campaignPriceFlag: reserve.campaignPriceFlag,
      autoExtendFlag: reserve.autoExtendFlag,
      disableReservation: reserve.disableReservation,
      contactedFlag: reserve.contactedFlag,

      periodFrom: reserve.periodFrom,
      periodTo: reserve.periodTo,

      checkedInAt: reserve.checkedInAt,
      checkoutAt: reserve.checkoutAt,
      checkinDate: reserve.checkinDate,
      lastStayDate: reserve.lastStayDate,
      earlyExitDatetime: reserve.earlyExitDatetime,
      paymentDueDate: reserve.paymentDueDate,
      cancelledAt: reserve.cancelledAt,

      bookingUnitPrice: reserve.bookingUnitPrice,
      adjustmentUnitPrice: reserve.adjustmentUnitPrice,
      deposit: reserve.deposit,

      dogCount: reserve.dogCount,
      catCount: reserve.catCount,
      otherCount: reserve.otherCount,
      petNote: reserve.petNote,

      rentalKeys: reserve.rentalKeys,
      returnKeys: reserve.returnKeys,
      keyReturnContactType: reserve.keyReturnContactType,
      keyReturnFlag: reserve.keyReturnFlag,

      note: reserve.note,
      memo: reserve.memo,
      overdueDebtNote: reserve.overdueDebtNote,
      amendment: reserve.amendment,
      cancelReason: reserve.cancelReason,
      announcement: reserve.announcement,
      requestAnnouncement: reserve.requestAnnouncement,
      saleAnnouncement: reserve.saleAnnouncement,
      noticeComment: reserve.noticeComment,

      advertisingType: reserve.advertisingType,
      roomDirtyLevel: reserve.roomDirtyLevel,

      chargeStaffId: reserve.chargeStaffId,
      chargeStaffId2: reserve.chargeStaffId2,
      checkinReceptionistId: reserve.checkinReceptionistId,
      diContactStaffId: reserve.diContactStaffId,
      checkoutReceptionistId: reserve.checkoutReceptionistId,
      checkoutReceptionistId2: reserve.checkoutReceptionistId2,
      confirmStaffId: reserve.confirmStaffId,

      createdAt: reserve.createdAt,
      updatedAt: reserve.updatedAt,

      clientName: reserve.client?.clientName,
      clientNameEn: reserve.client?.clientNameEn,
      clientTel: reserve.client?.tel,
      facilityName: reserve.facility?.facilityName,
      facilityNo: reserve.facility?.facilityNo,
      roomNumber: reserve.room?.roomNumber,
      roomTypeName: reserve.room?.roomType?.roomTypeName,
      roomClassName: reserve.room?.roomType?.roomClass?.roomClassName,
      stayTypeName: reserve.stayType?.stayTypeName,
      chargeStaffName: reserve.chargeStaff?.staffName,
      chargeStaff2Name: reserve.chargeStaff2?.staffName,
      confirmStaffName: reserve.confirmStaff?.staffName,
      createdStaffName: reserve.createdBy?.staffName,
      updatedStaffName: reserve.updatedBy?.staffName,
      checkoutReceptionistName: reserve.checkoutReceptionist?.staffName,
    } satisfies Record<keyof ReservationResponseDto, unknown>);
  }
}
