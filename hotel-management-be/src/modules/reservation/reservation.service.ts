import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { IPaginated, ERROR_MESSAGES, RESERVATION_EVENTS } from '@common/index';
import { ReserveStatus, DeleteStatus } from '@common/enums/index';
import { ReservationRepository } from './reservation.repository';
import { ClientRepository } from '@modules/client/client.repository';
import {
  CreateReservationDto,
  UpdateReservationDto,
  ReservationFilterDto,
  ReservationResponseDto,
  CancelReservationDto,
} from './dto';
import {
  ReservationCreatedEvent,
  ReservationConfirmedEvent,
  ReservationCheckedInEvent,
  ReservationCheckedOutEvent,
  ReservationCancelledEvent,
} from './events/reservation.events';

@Injectable()
export class ReservationService {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly clientRepository: ClientRepository,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  // ─── State Machine Transitions ──────────────────────
  private static readonly VALID_TRANSITIONS: Record<number, number[]> = {
    [ReserveStatus.PENDING]: [ReserveStatus.CONFIRMED, ReserveStatus.CANCELLED],
    [ReserveStatus.CONFIRMED]: [ReserveStatus.CHECKED_IN, ReserveStatus.CANCELLED],
    [ReserveStatus.CHECKED_IN]: [ReserveStatus.CHECKED_OUT],
    [ReserveStatus.CHECKED_OUT]: [],
    [ReserveStatus.CANCELLED]: [],
  };

  async findAll(filter: ReservationFilterDto): Promise<IPaginated<ReservationResponseDto>> {
    const { data, total } = await this.reservationRepository.findAll(filter);

    return {
      items: data.map(ReservationResponseDto.fromEntity),
      meta: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  async findById(id: number): Promise<ReservationResponseDto> {
    const reserve = await this.reservationRepository.findById(id);
    if (!reserve) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    return ReservationResponseDto.fromEntity(reserve);
  }

  async create(dto: CreateReservationDto, currentStaffId: number): Promise<ReservationResponseDto> {
    // Validate client exists
    const client = await this.clientRepository.findById(dto.clientId);
    if (!client) throw new NotFoundException('Client not found');

    // Validate period
    const periodFrom = new Date(dto.periodFrom);
    const periodTo = new Date(dto.periodTo);
    if (periodTo <= periodFrom) {
      throw new BadRequestException('Period to must be after period from');
    }

    // Check room overlap if room assigned
    if (dto.roomId) {
      await this.ensureNoOverlap(dto.roomId, periodFrom, periodTo);
    }

    // Determine initial reserveStatus from flags
    const initialStatus = dto.confirmFlag
      ? ReserveStatus.CONFIRMED
      : ReserveStatus.PENDING;

    const data: Prisma.ReserveCreateInput = {
      reserveStatus: initialStatus,
      periodFrom,
      periodTo,
      reserveType: dto.reserveType,
      bookingUnitPrice: dto.bookingUnitPrice,
      adjustmentUnitPrice: dto.adjustmentUnitPrice,
      deposit: dto.deposit,
      note: dto.note,
      memo: dto.memo,
      amendment: dto.amendment,
      advertisingType: dto.advertisingType,
      petFlag: dto.petFlag ?? false,
      dogCount: dto.dogCount,
      catCount: dto.catCount,
      otherCount: dto.otherCount,
      petNote: dto.petNote,
      draftFlag: dto.draftFlag ?? false,
      memoFlag: dto.memoFlag ?? false,
      confirmFlag: dto.confirmFlag ?? false,
      directcheckinFlag: dto.directcheckinFlag ?? false,
      directcheckinType: dto.directcheckinType,
      directcheckinNote: dto.directcheckinNote,
      futonFlag: dto.futonFlag ?? false,
      deliveryboxFlag: dto.deliveryboxFlag ?? false,
      deliveryboxCardNumber: dto.deliveryboxCardNumber,
      campaignPriceFlag: dto.campaignPriceFlag ?? false,
      autoExtendFlag: dto.autoExtendFlag ?? false,
      announcement: dto.announcement,
      requestAnnouncement: dto.requestAnnouncement,
      saleAnnouncement: dto.saleAnnouncement,
      client: { connect: { clientId: dto.clientId } },
      ...(dto.facilityId !== undefined && {
        facility: { connect: { facilityId: dto.facilityId } },
      }),
      ...(dto.roomId !== undefined && {
        room: { connect: { roomId: dto.roomId } },
      }),
      ...(dto.stayTypeId !== undefined && {
        stayType: { connect: { stayTypeId: dto.stayTypeId } },
      }),
      ...(dto.chargeStaffId !== undefined && {
        chargeStaff: { connect: { staffId: dto.chargeStaffId } },
      }),
      ...(dto.chargeStaffId2 !== undefined && {
        chargeStaff2: { connect: { staffId: dto.chargeStaffId2 } },
      }),
      ...(dto.diContactStaffId !== undefined && {
        diContactStaff: { connect: { staffId: dto.diContactStaffId } },
      }),
      createdBy: { connect: { staffId: currentStaffId } },
      updatedBy: { connect: { staffId: currentStaffId } },
    };

    const reserve = await this.reservationRepository.create(data);

    // Increment client use count
    await this.clientRepository.incrementUseCount(dto.clientId);

    // Emit domain event
    this.eventEmitter.emit(
      RESERVATION_EVENTS.CREATED,
      new ReservationCreatedEvent(
        reserve.reserveId,
        reserve.clientId,
        reserve.roomId,
        reserve.periodFrom,
        reserve.periodTo,
      ),
    );

    return ReservationResponseDto.fromEntity(reserve);
  }

  async update(id: number, dto: UpdateReservationDto, currentStaffId: number): Promise<ReservationResponseDto> {
    const existing = await this.reservationRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    // Cannot update cancelled or checked-out reservations
    if (existing.reserveStatus === ReserveStatus.CANCELLED) {
      throw new BadRequestException(ERROR_MESSAGES.RESERVATION_ALREADY_CANCELLED);
    }
    if (existing.reserveStatus === ReserveStatus.CHECKED_OUT) {
      throw new BadRequestException(ERROR_MESSAGES.RESERVATION_ALREADY_CHECKED_OUT);
    }

    // Check overlap if room or period changed
    const roomId = dto.roomId ?? existing.roomId;
    const periodFrom = dto.periodFrom ? new Date(dto.periodFrom) : existing.periodFrom;
    const periodTo = dto.periodTo ? new Date(dto.periodTo) : existing.periodTo;

    if (roomId && periodFrom && periodTo) {
      const roomChanged = dto.roomId !== undefined && dto.roomId !== existing.roomId;
      const periodChanged = dto.periodFrom !== undefined || dto.periodTo !== undefined;

      if (roomChanged || periodChanged) {
        if (periodTo <= periodFrom) {
          throw new BadRequestException('Period to must be after period from');
        }
        await this.ensureNoOverlap(roomId, periodFrom, periodTo, id);
      }
    }

    const data: Prisma.ReserveUpdateInput = {
      ...(dto.dataStatus !== undefined && { dataStatus: dto.dataStatus }),
      ...(dto.reserveType !== undefined && { reserveType: dto.reserveType }),
      ...(dto.periodFrom !== undefined && { periodFrom: new Date(dto.periodFrom) }),
      ...(dto.periodTo !== undefined && { periodTo: new Date(dto.periodTo) }),
      ...(dto.bookingUnitPrice !== undefined && { bookingUnitPrice: dto.bookingUnitPrice }),
      ...(dto.adjustmentUnitPrice !== undefined && { adjustmentUnitPrice: dto.adjustmentUnitPrice }),
      ...(dto.deposit !== undefined && { deposit: dto.deposit }),
      ...(dto.note !== undefined && { note: dto.note }),
      ...(dto.memo !== undefined && { memo: dto.memo }),
      ...(dto.overdueDebtNote !== undefined && { overdueDebtNote: dto.overdueDebtNote }),
      ...(dto.amendment !== undefined && { amendment: dto.amendment }),
      ...(dto.advertisingType !== undefined && { advertisingType: dto.advertisingType }),
      ...(dto.petFlag !== undefined && { petFlag: dto.petFlag }),
      ...(dto.dogCount !== undefined && { dogCount: dto.dogCount }),
      ...(dto.catCount !== undefined && { catCount: dto.catCount }),
      ...(dto.otherCount !== undefined && { otherCount: dto.otherCount }),
      ...(dto.petNote !== undefined && { petNote: dto.petNote }),
      ...(dto.draftFlag !== undefined && { draftFlag: dto.draftFlag }),
      ...(dto.memoFlag !== undefined && { memoFlag: dto.memoFlag }),
      ...(dto.confirmFlag !== undefined && { confirmFlag: dto.confirmFlag }),
      ...(dto.autoExtendFlag !== undefined && { autoExtendFlag: dto.autoExtendFlag }),
      ...(dto.campaignPriceFlag !== undefined && { campaignPriceFlag: dto.campaignPriceFlag }),
      ...(dto.disableReservation !== undefined && { disableReservation: dto.disableReservation }),
      ...(dto.directcheckinFlag !== undefined && { directcheckinFlag: dto.directcheckinFlag }),
      ...(dto.directcheckinType !== undefined && { directcheckinType: dto.directcheckinType }),
      ...(dto.directcheckinNote !== undefined && { directcheckinNote: dto.directcheckinNote }),
      ...(dto.contactedFlag !== undefined && { contactedFlag: dto.contactedFlag }),
      ...(dto.rentalKeys !== undefined && { rentalKeys: dto.rentalKeys }),
      ...(dto.returnKeys !== undefined && { returnKeys: dto.returnKeys }),
      ...(dto.keyReturnContactType !== undefined && { keyReturnContactType: dto.keyReturnContactType }),
      ...(dto.keyReturnFlag !== undefined && { keyReturnFlag: dto.keyReturnFlag }),
      ...(dto.futonFlag !== undefined && { futonFlag: dto.futonFlag }),
      ...(dto.deliveryboxFlag !== undefined && { deliveryboxFlag: dto.deliveryboxFlag }),
      ...(dto.deliveryboxCardNumber !== undefined && { deliveryboxCardNumber: dto.deliveryboxCardNumber }),
      ...(dto.roomDirtyLevel !== undefined && { roomDirtyLevel: dto.roomDirtyLevel }),
      ...(dto.announcement !== undefined && { announcement: dto.announcement }),
      ...(dto.requestAnnouncement !== undefined && { requestAnnouncement: dto.requestAnnouncement }),
      ...(dto.saleAnnouncement !== undefined && { saleAnnouncement: dto.saleAnnouncement }),
      ...(dto.noticeComment !== undefined && { noticeComment: dto.noticeComment }),
      ...(dto.earlyExitDatetime !== undefined && { earlyExitDatetime: new Date(dto.earlyExitDatetime) }),
      ...(dto.paymentDueDate !== undefined && { paymentDueDate: new Date(dto.paymentDueDate) }),
      ...(dto.clientId !== undefined && {
        client: { connect: { clientId: dto.clientId } },
      }),
      ...(dto.facilityId !== undefined && {
        facility: { connect: { facilityId: dto.facilityId } },
      }),
      ...(dto.roomId !== undefined && {
        room: { connect: { roomId: dto.roomId } },
      }),
      ...(dto.stayTypeId !== undefined && {
        stayType: { connect: { stayTypeId: dto.stayTypeId } },
      }),
      ...(dto.chargeStaffId !== undefined && {
        chargeStaff: { connect: { staffId: dto.chargeStaffId } },
      }),
      ...(dto.chargeStaffId2 !== undefined && {
        chargeStaff2: { connect: { staffId: dto.chargeStaffId2 } },
      }),
      ...(dto.diContactStaffId !== undefined && {
        diContactStaff: { connect: { staffId: dto.diContactStaffId } },
      }),
      updatedBy: { connect: { staffId: currentStaffId } },
    };

    const reserve = await this.reservationRepository.update(id, data);
    return ReservationResponseDto.fromEntity(reserve);
  }

  async confirm(id: number, currentStaffId: number): Promise<ReservationResponseDto> {
    const existing = await this.reservationRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    this.validateTransition(existing.reserveStatus, ReserveStatus.CONFIRMED);

    const reserve = await this.reservationRepository.update(id, {
      reserveStatus: ReserveStatus.CONFIRMED,
      confirmFlag: true,
      confirmStaff: { connect: { staffId: currentStaffId } },
      updatedBy: { connect: { staffId: currentStaffId } },
    });

    this.eventEmitter.emit(
      RESERVATION_EVENTS.CONFIRMED,
      new ReservationConfirmedEvent(reserve.reserveId, currentStaffId),
    );

    return ReservationResponseDto.fromEntity(reserve);
  }

  async checkIn(id: number, currentStaffId: number): Promise<ReservationResponseDto> {
    const existing = await this.reservationRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    this.validateTransition(existing.reserveStatus, ReserveStatus.CHECKED_IN);

    if (!existing.roomId) {
      throw new BadRequestException(ERROR_MESSAGES.ROOM_REQUIRED_FOR_CHECKIN);
    }

    const reserve = await this.reservationRepository.update(id, {
      reserveStatus: ReserveStatus.CHECKED_IN,
      checkinFlag: true,
      checkedInAt: new Date(),
      checkinDate: new Date(),
      checkinReceptionist: { connect: { staffId: currentStaffId } },
      updatedBy: { connect: { staffId: currentStaffId } },
    });

    this.eventEmitter.emit(
      RESERVATION_EVENTS.CHECKED_IN,
      new ReservationCheckedInEvent(reserve.reserveId, reserve.roomId, currentStaffId),
    );

    return ReservationResponseDto.fromEntity(reserve);
  }

  async checkOut(id: number, currentStaffId: number): Promise<ReservationResponseDto> {
    const existing = await this.reservationRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    this.validateTransition(existing.reserveStatus, ReserveStatus.CHECKED_OUT);

    const reserve = await this.reservationRepository.update(id, {
      reserveStatus: ReserveStatus.CHECKED_OUT,
      checkoutAt: new Date(),
      lastStayDate: new Date(),
      checkoutReceptionist: { connect: { staffId: currentStaffId } },
      updatedBy: { connect: { staffId: currentStaffId } },
    });

    this.eventEmitter.emit(
      RESERVATION_EVENTS.CHECKED_OUT,
      new ReservationCheckedOutEvent(
        reserve.reserveId,
        reserve.roomId,
        reserve.facilityId,
        reserve.clientId,
        currentStaffId,
      ),
    );

    return ReservationResponseDto.fromEntity(reserve);
  }

  async cancel(id: number, dto: CancelReservationDto, currentStaffId: number): Promise<ReservationResponseDto> {
    const existing = await this.reservationRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    this.validateTransition(existing.reserveStatus, ReserveStatus.CANCELLED);

    const reserve = await this.reservationRepository.update(id, {
      reserveStatus: ReserveStatus.CANCELLED,
      deleteStatus: DeleteStatus.CANCELLED,
      cancelReason: dto.cancelReason,
      cancelledAt: new Date(),
      updatedBy: { connect: { staffId: currentStaffId } },
    });

    // Decrement client use count
    if (reserve.clientId) {
      await this.clientRepository.decrementUseCount(reserve.clientId);
    }

    this.eventEmitter.emit(
      RESERVATION_EVENTS.CANCELLED,
      new ReservationCancelledEvent(reserve.reserveId, reserve.roomId, dto.cancelReason),
    );

    return ReservationResponseDto.fromEntity(reserve);
  }

  async remove(id: number, currentStaffId: number): Promise<void> {
    const existing = await this.reservationRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    await this.reservationRepository.softDelete(id, currentStaffId);

    // Soft delete associated usage statuses
    await this.reservationRepository.softDeleteUsageStatusByReserveId(id, currentStaffId);

    // Decrement client use count
    if (existing.clientId) {
      await this.clientRepository.decrementUseCount(existing.clientId);
    }
  }

  // ─── Private Helpers ──────────────────────────────

  private validateTransition(currentStatus: number, targetStatus: number): void {
    const allowed = ReservationService.VALID_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_STATUS_TRANSITION);
    }
  }

  private async ensureNoOverlap(
    roomId: number,
    periodFrom: Date,
    periodTo: Date,
    excludeReserveId?: number,
  ): Promise<void> {
    const hasOverlap = await this.reservationRepository.checkOverlap(
      roomId,
      periodFrom,
      periodTo,
      excludeReserveId,
    );
    if (hasOverlap) {
      throw new ConflictException(ERROR_MESSAGES.ROOM_OVERLAP);
    }
  }
}
