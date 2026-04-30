import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';

const PIN_STATUS_ACTIVE = 1;

const detailInclude = {
  facility: { select: { facilityId: true, facilityNo: true, facilityName: true } },
  room: {
    select: {
      roomId: true,
      roomNumber: true,
      mailboxPassword: true,
      roomTypeId: true,
      roomType: {
        select: {
          roomTypeName: true,
          roomTypeNameShort: true,
        },
      },
    },
  },
  reserve: {
    select: {
      reserveId: true,
      checkoutAt: true,
      periodFrom: true,
      periodTo: true,
      lastStayDate: true,
      noreserveCountAfter: true,
      disableReservation: true,
      rentalKeys: true,
      returnKeys: true,
      keyReturnDatetime: true,
      checkoutReceptionistId: true,
      roomDirtyLevel: true,
      client: { select: { clientId: true, clientName: true } },
    },
  },
  mainStaff: { select: { staffId: true, staffName: true } },
  subStaff: { select: { staffId: true, staffName: true } },
  checkStaff: { select: { staffId: true, staffName: true } },
  roomPinCredential: {
    select: {
      roomPinCredentialId: true,
      maskedPin: true,
      status: true,
      validFrom: true,
      validTo: true,
      revokedAt: true,
      expiredAt: true,
    },
  },
  _count: { select: { notes: { where: { deletedAt: null } } } },
} satisfies Prisma.CleaningDetailInclude;

export type DetailWithIncludes = Prisma.CleaningDetailGetPayload<{ include: typeof detailInclude }>;

@Injectable()
export class CleaningShiftRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Cleans (header) ─────────────────────────────────

  findCleansByFacilityAndDate(facilityId: number, cleaningDate: Date) {
    return this.prisma.cleans.findFirst({
      where: { facilityId, cleaningDate, deletedAt: null },
    });
  }

  findCleansById(cleanId: number) {
    return this.prisma.cleans.findFirst({
      where: { cleanId, deletedAt: null },
    });
  }

  upsertCleans(
    facilityId: number,
    cleaningDate: Date,
    data: { note?: string; restTimeFrom?: Date | null; restTimeTo?: Date | null },
    staffId: number,
  ) {
    return this.prisma.cleans.upsert({
      where: { facilityId_cleaningDate: { facilityId, cleaningDate } },
      create: {
        facility: { connect: { facilityId } },
        cleaningDate,
        ...(data.note !== undefined && { note: data.note }),
        ...(data.restTimeFrom !== undefined && { restTimeFrom: data.restTimeFrom }),
        ...(data.restTimeTo !== undefined && { restTimeTo: data.restTimeTo }),
        createdBy: { connect: { staffId } },
        updatedBy: { connect: { staffId } },
      },
      update: {
        ...(data.note !== undefined && { note: data.note }),
        ...(data.restTimeFrom !== undefined && { restTimeFrom: data.restTimeFrom }),
        ...(data.restTimeTo !== undefined && { restTimeTo: data.restTimeTo }),
        updatedBy: { connect: { staffId } },
      },
    });
  }

  updateCleans(
    cleanId: number,
    data: { note?: string; restTimeFrom?: Date | null; restTimeTo?: Date | null },
    staffId: number,
  ) {
    return this.prisma.cleans.update({
      where: { cleanId },
      data: {
        ...(data.note !== undefined && { note: data.note }),
        ...(data.restTimeFrom !== undefined && { restTimeFrom: data.restTimeFrom }),
        ...(data.restTimeTo !== undefined && { restTimeTo: data.restTimeTo }),
        updatedStaffId: staffId,
      },
    });
  }

  // ─── Cleaning details ────────────────────────────────

  findDetailsByCleanId(
    cleanId: number,
    params?: {
      dataType?: number;
      roomTypeIds?: number[];
      newReserveFlag?: number;
      sort?: string;
      direction?: 'asc' | 'desc';
    },
  ) {
    const direction = params?.direction ?? 'asc';
    const sort = params?.sort;
    const orderBy: Prisma.CleaningDetailOrderByWithRelationInput[] = [{ orderNum: 'asc' }];

    if (sort === 'roomNumber') {
      orderBy.unshift({ room: { roomNumber: direction } });
    } else if (sort === 'reserveCheckoutAt') {
      orderBy.unshift({ reserve: { checkoutAt: direction } });
    } else if (sort === 'mainStaffName') {
      orderBy.unshift({ mainStaff: { staffName: direction } });
    }

    return this.prisma.cleaningDetail.findMany({
      where: {
        cleanId,
        deletedAt: null,
        ...(params?.dataType !== undefined && { dataType: params.dataType }),
        ...(params?.roomTypeIds && params.roomTypeIds.length > 0
          ? {
              room: {
                roomTypeId: {
                  in: params.roomTypeIds,
                },
              },
            }
          : {}),
      },
      include: detailInclude,
      orderBy: [...orderBy, { cleaningDetailId: 'asc' }],
    });
  }

  findFutureReservesByRoomIds(roomIds: number[], fromDate: Date) {
    return this.prisma.reserve.findMany({
      where: {
        roomId: { in: roomIds },
        periodFrom: { gte: fromDate },
        dataStatus: 1,
        deletedAt: null,
        deleteStatus: null,
        rakutenFlag: false,
      },
      select: {
        reserveId: true,
        roomId: true,
        periodFrom: true,
        rentalKeys: true,
        returnKeys: true,
      },
      orderBy: [{ roomId: 'asc' }, { periodFrom: 'asc' }],
    });
  }

  findDetailById(id: number) {
    return this.prisma.cleaningDetail.findFirst({
      where: { cleaningDetailId: id, deletedAt: null },
      include: detailInclude,
    });
  }

  createDetail(data: Prisma.CleaningDetailCreateInput) {
    return this.prisma.cleaningDetail.create({
      data,
      include: detailInclude,
    });
  }

  updateDetail(id: number, data: Prisma.CleaningDetailUpdateInput) {
    return this.prisma.cleaningDetail.update({
      where: { cleaningDetailId: id },
      data,
      include: detailInclude,
    });
  }

  softDeleteDetail(id: number, staffId: number) {
    return this.prisma.cleaningDetail.update({
      where: { cleaningDetailId: id },
      data: {
        deletedAt: new Date(),
        deletedStaffId: staffId,
      },
    });
  }

  // ─── Smart-lock helpers ──────────────────────────────

  findActivePinCredential(roomId: number, reserveId: number | null) {
    return this.prisma.roomPinCredential.findFirst({
      where: {
        roomId,
        ...(reserveId !== null && { reserveId }),
        deletedAt: null,
      },
      orderBy: [{ status: 'asc' }, { validTo: 'desc' }],
      select: {
        roomPinCredentialId: true,
        maskedPin: true,
        status: true,
        validFrom: true,
        validTo: true,
        revokedAt: true,
        expiredAt: true,
      },
    });
  }

  // ─── Notes ───────────────────────────────────────────

  findNotesByDetailId(cleaningDetailId: number) {
    return this.prisma.cleanDetailNote.findMany({
      where: { cleaningDetailId, deletedAt: null },
      include: {
        createdBy: { select: { staffId: true, staffName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findNoteById(noteId: number) {
    return this.prisma.cleanDetailNote.findFirst({
      where: { cleanDetailNoteId: noteId, deletedAt: null },
      include: {
        createdBy: { select: { staffId: true, staffName: true } },
      },
    });
  }

  createNote(cleaningDetailId: number, noteContent: string, staffId: number) {
    return this.prisma.cleanDetailNote.create({
      data: {
        cleaningDetail: { connect: { cleaningDetailId } },
        noteContent,
        createdBy: { connect: { staffId } },
        updatedBy: { connect: { staffId } },
      },
      include: {
        createdBy: { select: { staffId: true, staffName: true } },
      },
    });
  }

  updateNote(noteId: number, noteContent: string, staffId: number) {
    return this.prisma.cleanDetailNote.update({
      where: { cleanDetailNoteId: noteId },
      data: {
        noteContent,
        updatedStaffId: staffId,
      },
      include: {
        createdBy: { select: { staffId: true, staffName: true } },
      },
    });
  }

  softDeleteNote(noteId: number, staffId: number) {
    return this.prisma.cleanDetailNote.update({
      where: { cleanDetailNoteId: noteId },
      data: {
        deletedAt: new Date(),
        deletedStaffId: staffId,
      },
    });
  }

  // helper exports
  static readonly PIN_STATUS_ACTIVE = PIN_STATUS_ACTIVE;
}
