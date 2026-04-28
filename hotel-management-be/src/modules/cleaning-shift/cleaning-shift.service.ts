import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ERROR_MESSAGES } from '@common/index';

import {
  CleaningShiftRepository,
  type DetailWithIncludes,
} from './cleaning-shift.repository';
import { CleaningDataType, CleaningStatus, isAllowedTransition } from './enums';
import {
  CleanDetailNoteResponseDto,
  CleaningDetailResponseDto,
  CleaningShiftFilterDto,
  CleansResponseDto,
  CopyCleaningDetailDto,
  CreateCleaningDetailDto,
  CreateCleanDetailNoteDto,
  PinInfoDto,
  UpdateCleaningDetailDto,
  UpdateCleaningDetailType1Dto,
  UpdateCleaningDetailType2Dto,
  UpdateCleaningDetailType3Dto,
  UpdateCleaningStatusDto,
  UpdateCleansDto,
  UpdateCleanDetailNoteDto,
  UpdateMainStaffDto,
  UpsertCleansDto,
} from './dto';

const PIN_STATUS_ACTIVE = 1;

@Injectable()
export class CleaningShiftService {
  constructor(private readonly repository: CleaningShiftRepository) {}

  // ─── List ────────────────────────────────────────────

  async findAll(filter: CleaningShiftFilterDto): Promise<CleansResponseDto> {
    const cleaningDate = this.parseDateOnly(filter.cleaningDate);

    let cleans = await this.repository.findCleansByFacilityAndDate(filter.facilityId, cleaningDate);

    if (!cleans) {
      // Return an empty header (not yet persisted) so FE can render the date row.
      return {
        cleanId: 0,
        facilityId: filter.facilityId,
        cleaningDate,
        note: null,
        restTimeFrom: null,
        restTimeTo: null,
        details: [],
        createdAt: cleaningDate,
        updatedAt: cleaningDate,
      };
    }

    const details = await this.repository.findDetailsByCleanId(cleans.cleanId, filter.dataType);

    const enriched = await Promise.all(details.map((d) => this.enrichDetail(d)));

    return {
      cleanId: cleans.cleanId,
      facilityId: cleans.facilityId,
      cleaningDate: cleans.cleaningDate,
      note: cleans.note,
      restTimeFrom: cleans.restTimeFrom,
      restTimeTo: cleans.restTimeTo,
      details: enriched,
      createdAt: cleans.createdAt,
      updatedAt: cleans.updatedAt,
    };
  }

  // ─── Cleans header ───────────────────────────────────

  async upsertCleans(dto: UpsertCleansDto, staffId: number) {
    const cleaningDate = this.parseDateOnly(dto.cleaningDate);
    return this.repository.upsertCleans(
      dto.facilityId,
      cleaningDate,
      {
        note: dto.note,
        restTimeFrom: dto.restTimeFrom !== undefined ? new Date(dto.restTimeFrom) : undefined,
        restTimeTo: dto.restTimeTo !== undefined ? new Date(dto.restTimeTo) : undefined,
      },
      staffId,
    );
  }

  async updateCleans(cleanId: number, dto: UpdateCleansDto, staffId: number) {
    const existing = await this.repository.findCleansById(cleanId);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    return this.repository.updateCleans(
      cleanId,
      {
        note: dto.note,
        restTimeFrom: dto.restTimeFrom !== undefined ? new Date(dto.restTimeFrom) : undefined,
        restTimeTo: dto.restTimeTo !== undefined ? new Date(dto.restTimeTo) : undefined,
      },
      staffId,
    );
  }

  // ─── Cleaning details ────────────────────────────────

  async findDetailById(id: number): Promise<CleaningDetailResponseDto> {
    const detail = await this.repository.findDetailById(id);
    if (!detail) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    return this.enrichDetail(detail);
  }

  async createDetail(
    cleanId: number,
    dto: CreateCleaningDetailDto,
    staffId: number,
  ): Promise<CleaningDetailResponseDto> {
    const cleans = await this.repository.findCleansById(cleanId);
    if (!cleans) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    if (dto.dataType === CleaningDataType.ROOM && !dto.roomId) {
      throw new BadRequestException('Phòng là bắt buộc đối với task dọn phòng');
    }
    if (dto.dataType === CleaningDataType.KEY_SAFETY && !dto.roomId) {
      throw new BadRequestException('Phòng là bắt buộc đối với task khóa & an toàn');
    }

    const data: Prisma.CleaningDetailCreateInput = {
      cleans: { connect: { cleanId } },
      facility: { connect: { facilityId: dto.facilityId } },
      dataType: dto.dataType,
      ...(dto.roomId !== undefined && { room: { connect: { roomId: dto.roomId } } }),
      ...(dto.reserveId !== undefined && { reserve: { connect: { reserveId: dto.reserveId } } }),
      ...(dto.areaName !== undefined && { areaName: dto.areaName }),
      ...(dto.mainStaffId !== undefined && {
        mainStaff: { connect: { staffId: dto.mainStaffId } },
      }),
      ...(dto.subStaffId !== undefined && {
        subStaff: { connect: { staffId: dto.subStaffId } },
      }),
      ...(dto.checkStaffId !== undefined && {
        checkStaff: { connect: { staffId: dto.checkStaffId } },
      }),
      ...(dto.mainStaffExternalFlag !== undefined && {
        mainStaffExternalFlag: dto.mainStaffExternalFlag,
      }),
      ...(dto.subStaffExternalFlag !== undefined && {
        subStaffExternalFlag: dto.subStaffExternalFlag,
      }),
      ...(dto.checkStaffExternalFlag !== undefined && {
        checkStaffExternalFlag: dto.checkStaffExternalFlag,
      }),
      ...(dto.scheduledDate !== undefined && {
        scheduledDate: this.parseDateOnly(dto.scheduledDate),
      }),
      ...(dto.comment !== undefined && { comment: dto.comment }),
      ...(dto.orderNum !== undefined && { orderNum: dto.orderNum }),
      cleanStatus: CleaningStatus.NOT_STARTED,
      createdBy: { connect: { staffId } },
      updatedBy: { connect: { staffId } },
    };

    const created = await this.repository.createDetail(data);
    return this.enrichDetail(created);
  }

  async updateDetail(
    id: number,
    dto: UpdateCleaningDetailDto,
    staffId: number,
  ): Promise<CleaningDetailResponseDto> {
    const existing = await this.repository.findDetailById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    const data: Prisma.CleaningDetailUpdateInput = this.buildStaffAndDateUpdate(dto);
    if (dto.areaName !== undefined) data.areaName = dto.areaName;
    if (dto.comment !== undefined) data.comment = dto.comment;
    if (dto.reportImg1 !== undefined) data.reportImg1 = dto.reportImg1;
    if (dto.reportImg2 !== undefined) data.reportImg2 = dto.reportImg2;
    if (dto.reportImg3 !== undefined) data.reportImg3 = dto.reportImg3;
    if (dto.reportImg4 !== undefined) data.reportImg4 = dto.reportImg4;
    if (dto.orderNum !== undefined) data.orderNum = dto.orderNum;
    data.updatedBy = { connect: { staffId } };

    const updated = await this.repository.updateDetail(id, data);
    return this.enrichDetail(updated);
  }

  async updateDetailType1(
    id: number,
    dto: UpdateCleaningDetailType1Dto,
    staffId: number,
  ): Promise<CleaningDetailResponseDto> {
    return this.updateDetail(id, dto as UpdateCleaningDetailDto, staffId);
  }

  async updateDetailType2(
    id: number,
    dto: UpdateCleaningDetailType2Dto,
    staffId: number,
  ): Promise<CleaningDetailResponseDto> {
    return this.updateDetail(id, dto as UpdateCleaningDetailDto, staffId);
  }

  async updateDetailType3(
    id: number,
    dto: UpdateCleaningDetailType3Dto,
    staffId: number,
  ): Promise<CleaningDetailResponseDto> {
    const existing = await this.repository.findDetailById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    if (existing.dataType !== CleaningDataType.KEY_SAFETY) {
      throw new BadRequestException('Task này không phải loại Khóa & An toàn');
    }

    const data: Prisma.CleaningDetailUpdateInput = {
      updatedBy: { connect: { staffId } },
    };

    if (dto.checkStaffId !== undefined) {
      data.checkStaff =
        dto.checkStaffId === null
          ? { disconnect: true }
          : { connect: { staffId: dto.checkStaffId } };
    }
    if (dto.checkStaffExternalFlag !== undefined) {
      data.checkStaffExternalFlag = dto.checkStaffExternalFlag;
    }
    if (dto.comment !== undefined) data.comment = dto.comment;

    if (dto.roomPinCredentialId !== undefined) {
      data.roomPinCredential =
        dto.roomPinCredentialId === null
          ? { disconnect: true }
          : { connect: { roomPinCredentialId: dto.roomPinCredentialId } };
    }
    if (dto.pinRevokedConfirmedAt !== undefined) {
      data.pinRevokedConfirmedAt = dto.pinRevokedConfirmedAt
        ? new Date(dto.pinRevokedConfirmedAt)
        : null;
    }

    if (dto.checkSafetyFlag === true) {
      const pin = await this.lookupPin(existing);
      if (pin && pin.status === PIN_STATUS_ACTIVE) {
        const now = new Date();
        if (now <= pin.validTo) {
          throw new BadRequestException('Mã PIN cho phòng chưa được hủy');
        }
      }
      data.checkSafetyFlag = true;
    } else if (dto.checkSafetyFlag === false) {
      data.checkSafetyFlag = false;
    }

    const updated = await this.repository.updateDetail(id, data);
    return this.enrichDetail(updated);
  }

  async updateStatus(
    id: number,
    dto: UpdateCleaningStatusDto,
    staffId: number,
  ): Promise<CleaningDetailResponseDto> {
    const existing = await this.repository.findDetailById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    const from = existing.cleanStatus as CleaningStatus;
    const to = dto.cleanStatus;
    if (from !== to && !isAllowedTransition(from, to)) {
      throw new BadRequestException(`Không cho phép chuyển trạng thái từ ${from} sang ${to}`);
    }

    const data: Prisma.CleaningDetailUpdateInput = {
      cleanStatus: to,
      updatedBy: { connect: { staffId } },
    };

    const now = new Date();
    if (to === CleaningStatus.IN_PROGRESS && !existing.startDatetime) {
      data.startDatetime = now;
    }
    if (to === CleaningStatus.FINISHED) {
      data.finishDatetime = now;
      if (!existing.endDatetime) data.endDatetime = now;
    }
    if (to === CleaningStatus.CHECKED) {
      data.checkStaff = { connect: { staffId } };
    }

    const updated = await this.repository.updateDetail(id, data);
    return this.enrichDetail(updated);
  }

  async updateMainStaff(
    id: number,
    dto: UpdateMainStaffDto,
    staffId: number,
  ): Promise<CleaningDetailResponseDto> {
    const existing = await this.repository.findDetailById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    const data: Prisma.CleaningDetailUpdateInput = {
      mainStaff:
        dto.mainStaffId === null
          ? { disconnect: true }
          : { connect: { staffId: dto.mainStaffId } },
      updatedBy: { connect: { staffId } },
    };
    if (dto.mainStaffExternalFlag !== undefined) {
      data.mainStaffExternalFlag = dto.mainStaffExternalFlag;
    }

    const updated = await this.repository.updateDetail(id, data);
    return this.enrichDetail(updated);
  }

  async copyDetail(
    id: number,
    dto: CopyCleaningDetailDto,
    staffId: number,
  ): Promise<CleaningDetailResponseDto> {
    const source = await this.repository.findDetailById(id);
    if (!source) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    const targetDate = this.parseDateOnly(dto.targetDate);
    const targetCleans = await this.repository.upsertCleans(
      source.facilityId,
      targetDate,
      {},
      staffId,
    );

    const data: Prisma.CleaningDetailCreateInput = {
      cleans: { connect: { cleanId: targetCleans.cleanId } },
      facility: { connect: { facilityId: source.facilityId } },
      dataType: source.dataType,
      ...(source.roomId !== null && { room: { connect: { roomId: source.roomId } } }),
      ...(source.reserveId !== null && { reserve: { connect: { reserveId: source.reserveId } } }),
      ...(source.areaName !== null && { areaName: source.areaName }),
      ...(source.mainStaffId !== null && {
        mainStaff: { connect: { staffId: source.mainStaffId } },
      }),
      ...(source.subStaffId !== null && {
        subStaff: { connect: { staffId: source.subStaffId } },
      }),
      ...(source.checkStaffId !== null && {
        checkStaff: { connect: { staffId: source.checkStaffId } },
      }),
      mainStaffExternalFlag: source.mainStaffExternalFlag,
      subStaffExternalFlag: source.subStaffExternalFlag,
      checkStaffExternalFlag: source.checkStaffExternalFlag,
      scheduledDate: targetDate,
      cleanStatus: CleaningStatus.NOT_STARTED,
      ...(source.comment !== null && { comment: source.comment }),
      ...(source.orderNum !== null && { orderNum: source.orderNum }),
      createdBy: { connect: { staffId } },
      updatedBy: { connect: { staffId } },
    };

    const created = await this.repository.createDetail(data);
    return this.enrichDetail(created);
  }

  async deleteDetail(id: number, staffId: number): Promise<void> {
    const existing = await this.repository.findDetailById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    await this.repository.softDeleteDetail(id, staffId);
  }

  // ─── Notes ───────────────────────────────────────────

  async findNotes(detailId: number): Promise<CleanDetailNoteResponseDto[]> {
    const detail = await this.repository.findDetailById(detailId);
    if (!detail) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    const notes = await this.repository.findNotesByDetailId(detailId);
    return notes.map((n) => this.toNoteDto(n));
  }

  async addNote(
    detailId: number,
    dto: CreateCleanDetailNoteDto,
    staffId: number,
  ): Promise<CleanDetailNoteResponseDto> {
    const detail = await this.repository.findDetailById(detailId);
    if (!detail) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    const note = await this.repository.createNote(detailId, dto.noteContent, staffId);
    return this.toNoteDto(note);
  }

  async updateNote(
    noteId: number,
    dto: UpdateCleanDetailNoteDto,
    staffId: number,
  ): Promise<CleanDetailNoteResponseDto> {
    const existing = await this.repository.findNoteById(noteId);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    if (dto.noteContent === undefined) {
      throw new BadRequestException('Nội dung ghi chú không được để trống');
    }

    const updated = await this.repository.updateNote(noteId, dto.noteContent, staffId);
    return this.toNoteDto(updated);
  }

  async removeNote(noteId: number, staffId: number): Promise<void> {
    const existing = await this.repository.findNoteById(noteId);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    await this.repository.softDeleteNote(noteId, staffId);
  }

  // ─── Helpers ─────────────────────────────────────────

  private buildStaffAndDateUpdate(
    dto: UpdateCleaningDetailDto | UpdateCleaningDetailType1Dto | UpdateCleaningDetailType2Dto,
  ): Prisma.CleaningDetailUpdateInput {
    const data: Prisma.CleaningDetailUpdateInput = {};
    const d = dto as UpdateCleaningDetailDto;

    if (d.mainStaffId !== undefined) {
      data.mainStaff =
        d.mainStaffId === null ? { disconnect: true } : { connect: { staffId: d.mainStaffId } };
    }
    if (d.subStaffId !== undefined) {
      data.subStaff =
        d.subStaffId === null ? { disconnect: true } : { connect: { staffId: d.subStaffId } };
    }
    if (d.checkStaffId !== undefined) {
      data.checkStaff =
        d.checkStaffId === null ? { disconnect: true } : { connect: { staffId: d.checkStaffId } };
    }
    if (d.mainStaffExternalFlag !== undefined) {
      data.mainStaffExternalFlag = d.mainStaffExternalFlag;
    }
    if (d.subStaffExternalFlag !== undefined) {
      data.subStaffExternalFlag = d.subStaffExternalFlag;
    }
    if (d.checkStaffExternalFlag !== undefined) {
      data.checkStaffExternalFlag = d.checkStaffExternalFlag;
    }
    if (d.scheduledDate !== undefined) {
      data.scheduledDate = this.parseDateOnly(d.scheduledDate);
    }
    if (d.startDatetime !== undefined) {
      data.startDatetime = d.startDatetime ? new Date(d.startDatetime) : null;
    }
    if (d.endDatetime !== undefined) {
      data.endDatetime = d.endDatetime ? new Date(d.endDatetime) : null;
    }
    if (d.finishDatetime !== undefined) {
      data.finishDatetime = d.finishDatetime ? new Date(d.finishDatetime) : null;
    }
    return data;
  }

  private async lookupPin(detail: DetailWithIncludes) {
    if (detail.roomPinCredential) return detail.roomPinCredential;
    if (!detail.roomId) return null;
    return this.repository.findActivePinCredential(detail.roomId, detail.reserveId);
  }

  private async enrichDetail(detail: DetailWithIncludes): Promise<CleaningDetailResponseDto> {
    let pin = detail.roomPinCredential;
    if (!pin && detail.dataType === CleaningDataType.KEY_SAFETY && detail.roomId) {
      pin = await this.repository.findActivePinCredential(detail.roomId, detail.reserveId);
    }

    const pinInfo: PinInfoDto | null = pin
      ? {
          roomPinCredentialId: pin.roomPinCredentialId,
          maskedPin: pin.maskedPin,
          status: pin.status,
          validFrom: pin.validFrom,
          validTo: pin.validTo,
          revokedAt: pin.revokedAt,
          expiredAt: pin.expiredAt,
          revokedOk: pin.status !== PIN_STATUS_ACTIVE || new Date() > pin.validTo,
        }
      : null;

    return {
      cleaningDetailId: detail.cleaningDetailId,
      cleanId: detail.cleanId,
      facilityId: detail.facilityId,
      facilityName: detail.facility?.facilityName ?? null,
      roomId: detail.roomId,
      roomNumber: detail.room?.roomNumber ?? null,
      reserveId: detail.reserveId,
      reserveClientName: detail.reserve?.client?.clientName ?? null,
      reserveCheckoutAt: detail.reserve?.checkoutAt ?? detail.reserve?.periodTo ?? null,
      dataType: detail.dataType,
      areaName: detail.areaName,
      mainStaffId: detail.mainStaffId,
      subStaffId: detail.subStaffId,
      checkStaffId: detail.checkStaffId,
      mainStaffName: detail.mainStaff?.staffName ?? null,
      subStaffName: detail.subStaff?.staffName ?? null,
      checkStaffName: detail.checkStaff?.staffName ?? null,
      mainStaffExternalFlag: detail.mainStaffExternalFlag,
      subStaffExternalFlag: detail.subStaffExternalFlag,
      checkStaffExternalFlag: detail.checkStaffExternalFlag,
      scheduledDate: detail.scheduledDate,
      startDatetime: detail.startDatetime,
      endDatetime: detail.endDatetime,
      finishDatetime: detail.finishDatetime,
      cleanStatus: detail.cleanStatus,
      checkSafetyFlag: detail.checkSafetyFlag,
      pinRevokedConfirmedAt: detail.pinRevokedConfirmedAt,
      pinInfo,
      comment: detail.comment,
      reportImg1: detail.reportImg1,
      reportImg2: detail.reportImg2,
      reportImg3: detail.reportImg3,
      reportImg4: detail.reportImg4,
      noteCount: detail._count.notes,
      orderNum: detail.orderNum,
      createdAt: detail.createdAt,
      updatedAt: detail.updatedAt,
    };
  }

  private toNoteDto(note: {
    cleanDetailNoteId: number;
    cleaningDetailId: number;
    noteContent: string;
    createdStaffId: number;
    createdBy: { staffId: number; staffName: string } | null;
    createdAt: Date;
    updatedAt: Date;
  }): CleanDetailNoteResponseDto {
    return {
      cleanDetailNoteId: note.cleanDetailNoteId,
      cleaningDetailId: note.cleaningDetailId,
      noteContent: note.noteContent,
      createdStaffId: note.createdStaffId,
      createdStaffName: note.createdBy?.staffName ?? null,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  private parseDateOnly(input: string | Date): Date {
    const d = typeof input === 'string' ? new Date(input) : input;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }
}
