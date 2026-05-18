import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import {
  buildCleaningReasonComment,
  CleaningDataType,
  CleaningReason,
  CleaningStatus,
  extractCleaningReasons,
} from './enums';

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

export interface GenerateCleaningJobsParams {
  cleaningDate: Date;
  facilityIds?: number[];
  commonAreaNames: string[];
  cleaningReasons: CleaningReason[];
  mainStaffId?: number;
  automationStaffId: number;
  force: boolean;
  source: string;
}

export interface CleaningJobGenerationFacilityResult {
  facilityId: number;
  facilityNo: string;
  facilityName: string;
  cleanId: number;
  created: number;
  skipped: number;
  roomCreated: number;
  commonAreaCreated: number;
  checkoutRoomCreated: number;
  preCheckinRoomCreated: number;
  stayoverRoomCreated: number;
  forceDeleted: number;
}

export interface CleaningJobGenerationResult {
  success: true;
  cleaningDate: Date;
  source: string;
  facilities: number;
  created: number;
  skipped: number;
  roomCreated: number;
  commonAreaCreated: number;
  checkoutRoomCreated: number;
  preCheckinRoomCreated: number;
  stayoverRoomCreated: number;
  forceDeleted: number;
  facilityResults: CleaningJobGenerationFacilityResult[];
}

interface RoomCleaningCandidate {
  reason: CleaningReason;
  reserveId: number;
  roomId: number;
}

@Injectable()
export class CleaningShiftRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveStaffById(staffId: number) {
    return this.prisma.staff.findFirst({
      where: { staffId, dataStatus: 1, deletedAt: null },
      select: { staffId: true },
    });
  }

  findFirstActiveStaff() {
    return this.prisma.staff.findFirst({
      where: { dataStatus: 1, deletedAt: null },
      orderBy: [{ staffType: 'asc' }, { staffId: 'asc' }],
      select: { staffId: true },
    });
  }

  findActiveStaffCatalog() {
    return this.prisma.staff.findMany({
      where: { dataStatus: 1, deletedAt: null },
      select: {
        staffId: true,
        staffName: true,
        staffNameShort: true,
      },
      orderBy: [{ orderNum: 'asc' }, { staffId: 'asc' }],
    });
  }

  findActiveFacilities(facilityIds?: number[]) {
    return this.prisma.facility.findMany({
      where: {
        dataStatus: 1,
        deletedAt: null,
        ...(facilityIds && facilityIds.length > 0 ? { facilityId: { in: facilityIds } } : {}),
      },
      select: {
        facilityId: true,
        facilityNo: true,
        facilityName: true,
      },
      orderBy: [{ orderNum: 'asc' }, { facilityId: 'asc' }],
    });
  }

  async generateCleaningJobs(
    params: GenerateCleaningJobsParams,
  ): Promise<CleaningJobGenerationResult> {
    const facilities = await this.findActiveFacilities(params.facilityIds);
    const facilityResults: CleaningJobGenerationFacilityResult[] = [];

    for (const facility of facilities) {
      const facilityResult = await this.prisma.$transaction(async (tx) => {
        const clean = await tx.cleans.upsert({
          where: {
            facilityId_cleaningDate: {
              facilityId: facility.facilityId,
              cleaningDate: params.cleaningDate,
            },
          },
          create: {
            facilityId: facility.facilityId,
            cleaningDate: params.cleaningDate,
            createdStaffId: params.automationStaffId,
            updatedStaffId: params.automationStaffId,
          },
          update: {
            updatedStaffId: params.automationStaffId,
          },
        });

        const checkoutCandidates = params.cleaningReasons.includes(CleaningReason.CHECKOUT_ROOM)
          ? (
              await this.findCheckoutReserveCandidates(tx, facility.facilityId, params.cleaningDate)
            ).map((candidate) => ({
              ...candidate,
              reason: CleaningReason.CHECKOUT_ROOM,
            }))
          : [];
        const checkoutRoomIds = new Set(checkoutCandidates.map((candidate) => candidate.roomId));

        const preCheckinCandidates = params.cleaningReasons.includes(
          CleaningReason.PRE_CHECKIN_ROOM,
        )
          ? (
              await this.findPreCheckinReserveCandidates(
                tx,
                facility.facilityId,
                params.cleaningDate,
              )
            )
              .filter((candidate) => !checkoutRoomIds.has(candidate.roomId))
              .map((candidate) => ({
                ...candidate,
                reason: CleaningReason.PRE_CHECKIN_ROOM,
              }))
          : [];
        const preCheckinRoomIds = new Set(
          preCheckinCandidates.map((candidate) => candidate.roomId),
        );

        const stayoverCandidates = params.cleaningReasons.includes(CleaningReason.STAYOVER_ROOM)
          ? (await this.findStayoverReserveCandidates(tx, facility.facilityId, params.cleaningDate))
              .filter(
                (candidate) =>
                  !checkoutRoomIds.has(candidate.roomId) &&
                  !preCheckinRoomIds.has(candidate.roomId),
              )
              .map((candidate) => ({
                ...candidate,
                reason: CleaningReason.STAYOVER_ROOM,
              }))
          : [];

        const roomCandidates: RoomCleaningCandidate[] = [
          ...checkoutCandidates,
          ...preCheckinCandidates,
          ...stayoverCandidates,
        ];
        const commonAreaNames = params.cleaningReasons.includes(CleaningReason.COMMON_AREA_DAILY)
          ? this.normalizeCommonAreaNames(params.commonAreaNames)
          : [];
        const expectedSignatures = new Set<string>([
          ...roomCandidates.map((candidate) =>
            this.roomCleaningSignature(candidate.reason, candidate.reserveId, candidate.roomId),
          ),
          ...commonAreaNames.map((areaName) => this.commonAreaSignature(areaName)),
        ]);

        const existingDetails = await tx.cleaningDetail.findMany({
          where: {
            cleanId: clean.cleanId,
            deletedAt: null,
            dataType: { in: [CleaningDataType.ROOM, CleaningDataType.COMMON_AREA] },
          },
          select: {
            cleaningDetailId: true,
            roomId: true,
            reserveId: true,
            dataType: true,
            areaName: true,
            cleanStatus: true,
            comment: true,
          },
        });

        const forceDeleteIds = params.force
          ? existingDetails
              .filter(
                (detail) =>
                  detail.cleanStatus === Number(CleaningStatus.NOT_STARTED) &&
                  expectedSignatures.has(this.cleaningDetailSignature(detail)),
              )
              .map((detail) => detail.cleaningDetailId)
          : [];

        if (forceDeleteIds.length > 0) {
          await tx.cleaningDetail.updateMany({
            where: { cleaningDetailId: { in: forceDeleteIds } },
            data: {
              deletedAt: new Date(),
              deletedStaffId: params.automationStaffId,
              updatedStaffId: params.automationStaffId,
            },
          });
        }

        const forceDeleteSet = new Set(forceDeleteIds);
        const existingSignatures = new Set(
          existingDetails
            .filter((detail) => !forceDeleteSet.has(detail.cleaningDetailId))
            .map((detail) => this.cleaningDetailSignature(detail)),
        );

        const roomCreateData: Prisma.CleaningDetailCreateManyInput[] = [];
        for (const [index, candidate] of roomCandidates.entries()) {
          const signature = this.roomCleaningSignature(
            candidate.reason,
            candidate.reserveId,
            candidate.roomId,
          );
          if (existingSignatures.has(signature)) continue;

          roomCreateData.push({
            cleanId: clean.cleanId,
            facilityId: facility.facilityId,
            roomId: candidate.roomId,
            reserveId: candidate.reserveId,
            dataType: CleaningDataType.ROOM,
            mainStaffId: params.mainStaffId,
            scheduledDate: params.cleaningDate,
            cleanStatus: CleaningStatus.NOT_STARTED,
            orderNum: index + 1,
            comment: buildCleaningReasonComment(candidate.reason, params.source),
            createdStaffId: params.automationStaffId,
            updatedStaffId: params.automationStaffId,
          });
        }

        const commonAreaCreateData: Prisma.CleaningDetailCreateManyInput[] = [];
        const commonAreaOrderStart = roomCandidates.length + 1;
        for (const [index, areaName] of commonAreaNames.entries()) {
          const signature = this.commonAreaSignature(areaName);
          if (existingSignatures.has(signature)) continue;

          commonAreaCreateData.push({
            cleanId: clean.cleanId,
            facilityId: facility.facilityId,
            dataType: CleaningDataType.COMMON_AREA,
            areaName,
            mainStaffId: params.mainStaffId,
            scheduledDate: params.cleaningDate,
            cleanStatus: CleaningStatus.NOT_STARTED,
            orderNum: commonAreaOrderStart + index,
            comment: buildCleaningReasonComment(CleaningReason.COMMON_AREA_DAILY, params.source),
            createdStaffId: params.automationStaffId,
            updatedStaffId: params.automationStaffId,
          });
        }

        if (roomCreateData.length > 0) {
          await tx.cleaningDetail.createMany({ data: roomCreateData });
        }
        if (commonAreaCreateData.length > 0) {
          await tx.cleaningDetail.createMany({ data: commonAreaCreateData });
        }

        const created = roomCreateData.length + commonAreaCreateData.length;
        const skipped = expectedSignatures.size - forceDeleteIds.length - created;

        return {
          facilityId: facility.facilityId,
          facilityNo: facility.facilityNo,
          facilityName: facility.facilityName,
          cleanId: clean.cleanId,
          created,
          skipped: Math.max(skipped, 0),
          roomCreated: roomCreateData.length,
          commonAreaCreated: commonAreaCreateData.length,
          checkoutRoomCreated: roomCreateData.filter((item) =>
            item.comment?.includes(CleaningReason.CHECKOUT_ROOM),
          ).length,
          preCheckinRoomCreated: roomCreateData.filter((item) =>
            item.comment?.includes(CleaningReason.PRE_CHECKIN_ROOM),
          ).length,
          stayoverRoomCreated: roomCreateData.filter((item) =>
            item.comment?.includes(CleaningReason.STAYOVER_ROOM),
          ).length,
          forceDeleted: forceDeleteIds.length,
        };
      });

      facilityResults.push(facilityResult);
    }

    return {
      success: true,
      cleaningDate: params.cleaningDate,
      source: params.source,
      facilities: facilityResults.length,
      created: facilityResults.reduce((total, item) => total + item.created, 0),
      skipped: facilityResults.reduce((total, item) => total + item.skipped, 0),
      roomCreated: facilityResults.reduce((total, item) => total + item.roomCreated, 0),
      commonAreaCreated: facilityResults.reduce((total, item) => total + item.commonAreaCreated, 0),
      checkoutRoomCreated: facilityResults.reduce(
        (total, item) => total + item.checkoutRoomCreated,
        0,
      ),
      preCheckinRoomCreated: facilityResults.reduce(
        (total, item) => total + item.preCheckinRoomCreated,
        0,
      ),
      stayoverRoomCreated: facilityResults.reduce(
        (total, item) => total + item.stayoverRoomCreated,
        0,
      ),
      forceDeleted: facilityResults.reduce((total, item) => total + item.forceDeleted, 0),
      facilityResults,
    };
  }

  findAutomationDetails(cleaningDate: Date, facilityIds?: number[]) {
    return this.prisma.cleaningDetail.findMany({
      where: {
        deletedAt: null,
        dataType: { in: [CleaningDataType.ROOM, CleaningDataType.COMMON_AREA] },
        cleans: {
          cleaningDate,
          deletedAt: null,
          ...(facilityIds && facilityIds.length > 0 ? { facilityId: { in: facilityIds } } : {}),
        },
      },
      include: detailInclude,
      orderBy: [
        { facility: { orderNum: 'asc' } },
        { dataType: 'asc' },
        { orderNum: 'asc' },
        { cleaningDetailId: 'asc' },
      ],
    });
  }

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

  private async findCheckoutReserveCandidates(
    tx: Prisma.TransactionClient,
    facilityId: number,
    cleaningDate: Date,
  ): Promise<Array<{ reserveId: number; roomId: number }>> {
    const nextDate = new Date(cleaningDate);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    const reserves = await tx.reserve.findMany({
      where: {
        facilityId,
        roomId: { not: null },
        dataStatus: 1,
        deletedAt: null,
        deleteStatus: null,
        draftFlag: false,
        OR: [
          { checkoutAt: { gte: cleaningDate, lt: nextDate } },
          { periodTo: { gte: cleaningDate, lt: nextDate } },
          { lastStayDate: { gte: cleaningDate, lt: nextDate } },
        ],
      },
      select: {
        reserveId: true,
        roomId: true,
      },
      orderBy: [{ room: { orderNum: 'asc' } }, { reserveId: 'asc' }],
    });

    return this.uniqueRoomReserveCandidates(
      reserves.filter(
        (reserve): reserve is { reserveId: number; roomId: number } => reserve.roomId !== null,
      ),
    );
  }

  private async findPreCheckinReserveCandidates(
    tx: Prisma.TransactionClient,
    facilityId: number,
    cleaningDate: Date,
  ): Promise<Array<{ reserveId: number; roomId: number }>> {
    const nextDate = new Date(cleaningDate);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    const reserves = await tx.reserve.findMany({
      where: {
        facilityId,
        roomId: { not: null },
        dataStatus: 1,
        deletedAt: null,
        deleteStatus: null,
        draftFlag: false,
        OR: [
          { checkinDate: { gte: cleaningDate, lt: nextDate } },
          { periodFrom: { gte: cleaningDate, lt: nextDate } },
        ],
      },
      select: {
        reserveId: true,
        roomId: true,
      },
      orderBy: [{ room: { orderNum: 'asc' } }, { reserveId: 'asc' }],
    });

    return this.uniqueRoomReserveCandidates(
      reserves.filter(
        (reserve): reserve is { reserveId: number; roomId: number } => reserve.roomId !== null,
      ),
    );
  }

  private async findStayoverReserveCandidates(
    tx: Prisma.TransactionClient,
    facilityId: number,
    cleaningDate: Date,
  ): Promise<Array<{ reserveId: number; roomId: number }>> {
    const reserves = await tx.reserve.findMany({
      where: {
        facilityId,
        roomId: { not: null },
        dataStatus: 1,
        deletedAt: null,
        deleteStatus: null,
        draftFlag: false,
        periodFrom: { lt: cleaningDate },
        periodTo: { gt: cleaningDate },
      },
      select: {
        reserveId: true,
        roomId: true,
      },
      orderBy: [{ room: { orderNum: 'asc' } }, { reserveId: 'asc' }],
    });

    return this.uniqueRoomReserveCandidates(
      reserves.filter(
        (reserve): reserve is { reserveId: number; roomId: number } => reserve.roomId !== null,
      ),
    );
  }

  private normalizeCommonAreaNames(commonAreaNames: string[]) {
    const names = commonAreaNames.map((name) => name.trim()).filter((name) => name.length > 0);
    return [...new Set(names)];
  }

  private uniqueRoomReserveCandidates(candidates: Array<{ reserveId: number; roomId: number }>) {
    const seenRoomIds = new Set<number>();
    return candidates.filter((candidate) => {
      if (seenRoomIds.has(candidate.roomId)) return false;
      seenRoomIds.add(candidate.roomId);
      return true;
    });
  }

  private cleaningDetailSignature(detail: {
    dataType: number;
    roomId: number | null;
    reserveId: number | null;
    areaName: string | null;
    comment?: string | null;
  }) {
    if (detail.dataType === Number(CleaningDataType.ROOM)) {
      const [reason] = extractCleaningReasons(detail.comment, detail.dataType);
      return this.roomCleaningSignature(reason, detail.reserveId, detail.roomId);
    }
    return this.commonAreaSignature(detail.areaName ?? '');
  }

  private roomCleaningSignature(
    reason: CleaningReason | undefined,
    reserveId: number | null,
    roomId: number | null,
  ) {
    return `room:${reason ?? CleaningReason.CHECKOUT_ROOM}:${reserveId ?? 'none'}:${roomId ?? 'none'}`;
  }

  private commonAreaSignature(areaName: string) {
    return `common:${areaName.trim().toLowerCase()}`;
  }

  // helper exports
  static readonly PIN_STATUS_ACTIVE = PIN_STATUS_ACTIVE;
}
