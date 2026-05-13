import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { ERROR_MESSAGES, RESERVATION_EVENTS } from '@common/index';
import { ReserveStatus } from '@common/enums/index';
import { CleaningStatus } from '@modules/cleaning-shift/enums';
import { ReservationCheckedInEvent } from '@modules/reservation/events/reservation.events';
import {
  DailyReserveFilterDto,
  DailyReserveItemDto,
  DailyReserveParkingDto,
  DailyReserveResponseDto,
  UpdateAllDailyReserveDto,
  UpdateAllDailyReserveResponseDto,
  UpdateDailyReserveDto,
  UpdateDailyReserveResponseDto,
} from './dto';
import {
  DailyReserveEntity,
  DailyReserveRepository,
} from './daily-reserve.repository';

const MS_PER_DAY = 86_400_000;
const STATUS_OK = 200;
const BCRYPT_ROUNDS = 12;
const SMART_LOCK_ACTIVE = 1;
const DATA_STATUS_AVAILABLE = 1;
@Injectable()
export class DailyReserveService {
  constructor(
    private readonly repository: DailyReserveRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(
    filter: DailyReserveFilterDto,
    currentStaffId: number,
  ): Promise<DailyReserveResponseDto> {
    const targetDate = this.parseDate(filter.time ?? filter.date) ?? this.startOfDay(new Date());
    const start = this.startOfDay(targetDate);
    const end = this.addDays(start, 1);
    const rows = await this.repository.findDailyReserves({
      start,
      end,
      chargeStaffId:
        filter.dashboardFlag || filter.dashboard_flag ? currentStaffId : undefined,
    });

    return {
      reserves: await this.toResponseItems(rows),
      statusCode: STATUS_OK,
    };
  }

  async update(
    id: number,
    dto: UpdateDailyReserveDto,
    currentStaffId: number,
  ): Promise<UpdateDailyReserveResponseDto> {
    const reserve = await this.repository.findById(id);
    if (!reserve) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    const data = this.buildReserveUpdate(dto, currentStaffId);
    const shouldIssueSmartLock = this.hasSmartLockUpdate(dto);
    const hasCardCountUpdate = dto.smartLockCardCount !== undefined;
    const hasPositiveCardCountUpdate =
      hasCardCountUpdate && (dto.smartLockCardCount ?? 0) > 0;
    const hasAccessUpdate = shouldIssueSmartLock || hasPositiveCardCountUpdate;
    const shouldTransitionToCheckin =
      !reserve.checkinFlag &&
      (dto.checkinFlag === true ||
      (dto.checkinFlag === undefined &&
        hasAccessUpdate &&
        this.isArrivalDue(reserve)));
    const shouldMarkCheckin =
      dto.checkinFlag === true ||
      (dto.checkinFlag === undefined &&
        hasAccessUpdate &&
        !reserve.checkinFlag &&
        this.isArrivalDue(reserve));

    if (shouldMarkCheckin) {
      await this.ensureCanCheckIn(reserve);
    }

    if (shouldIssueSmartLock) {
      await this.upsertSmartLockCredential(reserve, dto, currentStaffId);
    }

    if (shouldMarkCheckin) {
      Object.assign(data, {
        reserveStatus:
          reserve.reserveStatus < ReserveStatus.CHECKED_IN
            ? ReserveStatus.CHECKED_IN
            : reserve.reserveStatus,
        checkinFlag: true,
        checkedInAt: reserve.checkedInAt ?? new Date(),
        checkinDate: reserve.checkinDate ?? new Date(),
        contactedFlag: true,
        checkinReceptionist: { connect: { staffId: currentStaffId } },
      } satisfies Prisma.ReserveUpdateInput);
    }

    if (dto.checkinFlag === false) {
      Object.assign(data, {
        reserveStatus:
          reserve.reserveStatus === ReserveStatus.CHECKED_IN
            ? ReserveStatus.CONFIRMED
            : reserve.reserveStatus,
        checkinFlag: false,
        checkedInAt: null,
        checkinDate: null,
      } satisfies Prisma.ReserveUpdateInput);
    }

    await this.repository.updateReserve(id, data);

    if (shouldMarkCheckin) {
      await this.repository.markParkingCheckedIn(id);
    }

    if (shouldTransitionToCheckin) {
      this.eventEmitter.emit(
        RESERVATION_EVENTS.CHECKED_IN,
        new ReservationCheckedInEvent(id, reserve.roomId, currentStaffId),
      );
    }

    return { statusCode: STATUS_OK };
  }

  async updateAll(
    dto: UpdateAllDailyReserveDto,
    currentStaffId: number,
  ): Promise<UpdateAllDailyReserveResponseDto> {
    const errors: Array<{ index: number; reserveId?: number; error: string }> = [];

    for (const [index, item] of dto.reserves.entries()) {
      try {
        await this.update(item.reserveId, item, currentStaffId);
      } catch (error) {
        errors.push({
          index,
          reserveId: item.reserveId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      statusCode: errors.length === 0 ? STATUS_OK : 500,
      errors,
    };
  }

  private async toResponseItems(rows: DailyReserveEntity[]): Promise<DailyReserveItemDto[]> {
    const firstReserveByClient = await this.firstReserveDateMap(rows);
    const nextReserveByReserve = await this.nextReserveDateMap(rows);

    return rows.map((reserve) => {
      const latestPin = reserve.pinCredentials[0];
      const maskedPin = latestPin?.maskedPin ?? null;
      const parkingReserves = this.mapParkingReserves(reserve);

      return {
        reserveId: reserve.reserveId,
        clientId: reserve.clientId,
        clientName: this.getClientDisplayName(reserve),
        contactName: reserve.client?.contactName ?? null,
        clientDataType: reserve.client?.dataType ?? null,
        facilityId: reserve.facilityId,
        facilityNo: reserve.facility?.facilityNo ?? null,
        facilityName: reserve.facility?.facilityName ?? null,
        roomId: reserve.roomId,
        roomNumber: reserve.room?.roomNumber ?? null,
        occupierName: reserve.reserveOccupiers[0]?.occupierName ?? null,
        periodFrom: reserve.periodFrom,
        periodTo: reserve.periodTo,
        lastStayDate: reserve.lastStayDate,
        newReserveDate: nextReserveByReserve.get(reserve.reserveId) ?? null,
        rentalTime: this.diffDays(reserve.periodFrom, reserve.periodTo),
        result: this.paymentResult(reserve),
        flagOrderFirst: this.isFirstReserve(reserve, firstReserveByClient),
        confirmFlag: reserve.confirmFlag,
        checkinFlag: reserve.checkinFlag,
        canCheckIn: this.canCheckInFromData(reserve, latestPin),
        directcheckinFlag: reserve.directcheckinFlag,
        directcheckinType: reserve.directcheckinType,
        directcheckinNote: reserve.directcheckinNote,
        note: reserve.note,
        advertisingType: reserve.advertisingType,
        chargeStaffId: reserve.chargeStaffId,
        chargeStaffName: reserve.chargeStaff?.staffName ?? null,
        chargeStaffNameShort: reserve.chargeStaff?.staffNameShort ?? null,
        diContactStaffId: reserve.diContactStaffId,
        diContactStaffName: reserve.diContactStaff?.staffName ?? null,
        checkinReceptionistId: reserve.checkinReceptionistId,
        checkinReceptionistName: reserve.checkinReceptionist?.staffName ?? null,
        deliveryboxCardNumber: reserve.deliveryboxCardNumber,
        parkingReservesCount: reserve.parkingReserves.length,
        bicycleParkingReservesCount: reserve.bicycleParkingReserves.length,
        serviceFlags: {
          deliverybox: reserve.deliveryboxFlag,
          parking: reserve.parkingReserves.length > 0,
          bicycleParking: reserve.bicycleParkingReserves.length > 0,
          pet: reserve.petFlag,
          futon: reserve.futonFlag,
        },
        smartLock: {
          roomPinCredentialId: latestPin?.roomPinCredentialId ?? null,
          maskedPin,
          cardCount: reserve.rentalKeys ?? 0,
          validFrom: latestPin?.validFrom ?? null,
          validTo: latestPin?.validTo ?? null,
          status: latestPin?.status ?? null,
        },
        parkingReserves,
      };
    });
  }

  private buildReserveUpdate(
    dto: UpdateDailyReserveDto,
    currentStaffId: number,
  ): Prisma.ReserveUpdateInput {
    const data: Prisma.ReserveUpdateInput = {
      updatedBy: { connect: { staffId: currentStaffId } },
    };

    if (dto.note !== undefined) data.note = dto.note;
    if (dto.directcheckinType !== undefined) data.directcheckinType = dto.directcheckinType;
    if (dto.smartLockCardCount !== undefined) data.rentalKeys = dto.smartLockCardCount;

    if (dto.chargeStaffId !== undefined) {
      data.chargeStaff =
        dto.chargeStaffId === null
          ? { disconnect: true }
          : { connect: { staffId: dto.chargeStaffId } };
    }

    if (dto.diContactStaffId !== undefined) {
      data.diContactStaff =
        dto.diContactStaffId === null
          ? { disconnect: true }
          : { connect: { staffId: dto.diContactStaffId } };
    }

    return data;
  }

  private async upsertSmartLockCredential(
    reserve: DailyReserveEntity,
    dto: UpdateDailyReserveDto,
    currentStaffId: number,
  ): Promise<void> {
    if (!reserve.roomId) {
      throw new BadRequestException('Reservation room is required to issue smart lock credential');
    }

    const pin = this.cleanOptionalString(dto.smartLockPin);
    const existing = await this.repository.findLatestCredentialByReserveId(reserve.reserveId);

    if (!pin) return;

    if (existing) {
      const data: Prisma.RoomPinCredentialUncheckedUpdateInput = {
        updatedStaffId: currentStaffId,
      };

      data.encryptedPin = await bcrypt.hash(pin, BCRYPT_ROUNDS);
      data.maskedPin = this.maskPin(pin);
      data.providerPayload = {
        ...this.readProviderPayloadObject(existing.providerPayload),
        automationReleasePin: pin,
      };

      await this.repository.updateSmartLockCredential(existing.roomPinCredentialId, data);
      return;
    }

    const validFrom = reserve.periodFrom ?? new Date();
    const validTo = reserve.periodTo ?? this.addDays(validFrom, 1);

    await this.repository.createSmartLockCredential({
      roomId: reserve.roomId,
      reserveId: reserve.reserveId,
      dataStatus: DATA_STATUS_AVAILABLE,
      encryptedPin: await bcrypt.hash(pin, BCRYPT_ROUNDS),
      maskedPin: this.maskPin(pin),
      validFrom,
      validTo,
      status: SMART_LOCK_ACTIVE,
      issuedAt: new Date(),
      providerPayload: {
        automationReleasePin: pin,
      },
      createdStaffId: currentStaffId,
      updatedStaffId: currentStaffId,
    });
  }

  private async ensureCanCheckIn(reserve: DailyReserveEntity): Promise<void> {
    if (!reserve.roomId || !reserve.periodFrom) {
      throw new BadRequestException('Reservation room and check-in date are required');
    }

    if (this.startOfDay(reserve.periodFrom).getTime() > this.startOfDay(new Date()).getTime()) {
      throw new ConflictException('Chưa đến ngày nhận phòng');
    }

    const latestCleaning = await this.repository.findLatestCleaningByRoom(
      reserve.roomId,
      reserve.reserveId,
    );

    if (
      latestCleaning &&
      ![
        CleaningStatus.FINISHED,
        CleaningStatus.CHECKED,
        CleaningStatus.CANCELLED,
      ].includes(latestCleaning.cleanStatus as CleaningStatus)
    ) {
      throw new ConflictException('Phòng chưa hoàn tất vệ sinh');
    }

    const previousReserve = await this.repository.findPreviousReserveForRoom(
      reserve.roomId,
      reserve.periodFrom,
      reserve.reserveId,
    );

    if (!previousReserve) return;
    if (previousReserve.checkoutAt || previousReserve.keyReturnDatetime) return;
    if (previousReserve.checkinFlag) return;

    throw new ConflictException('Phòng hiện đang được sử dụng');
  }

  private async firstReserveDateMap(rows: DailyReserveEntity[]): Promise<Map<number, Date>> {
    const clientIds = Array.from(
      new Set(rows.map((row) => row.clientId).filter((id): id is number => id !== null)),
    );
    if (clientIds.length === 0) return new Map();

    const grouped = await this.repository.findFirstReserveDatesByClient(clientIds);
    return new Map(
      grouped
        .filter((item): item is { clientId: number; _min: { periodFrom: Date } } =>
          item.clientId !== null && item._min.periodFrom !== null,
        )
        .map((item) => [item.clientId, item._min.periodFrom]),
    );
  }

  private async nextReserveDateMap(rows: DailyReserveEntity[]): Promise<Map<number, Date>> {
    const roomIds = Array.from(
      new Set(rows.map((row) => row.roomId).filter((id): id is number => id !== null)),
    );
    const minBaseDate = rows
      .map((row) => row.lastStayDate ?? row.periodTo ?? row.periodFrom)
      .filter((date): date is Date => date !== null)
      .sort((a, b) => a.getTime() - b.getTime())[0];

    if (roomIds.length === 0 || !minBaseDate) return new Map();

    const futureReserves = await this.repository.findFutureReservesForRooms(roomIds, minBaseDate);
    const byRoom = new Map<number, typeof futureReserves>();

    for (const future of futureReserves) {
      if (!future.roomId || !future.periodFrom) continue;
      const current = byRoom.get(future.roomId) ?? [];
      current.push(future);
      byRoom.set(future.roomId, current);
    }

    const result = new Map<number, Date>();
    for (const row of rows) {
      if (!row.roomId) continue;
      const baseDate = row.lastStayDate ?? row.periodTo ?? row.periodFrom;
      if (!baseDate) continue;

      const next = byRoom
        .get(row.roomId)
        ?.find(
          (future) =>
            future.reserveId !== row.reserveId &&
            future.periodFrom !== null &&
            future.periodFrom.getTime() >= baseDate.getTime(),
        );

      if (next?.periodFrom) {
        result.set(row.reserveId, next.periodFrom);
      }
    }

    return result;
  }

  private mapParkingReserves(reserve: DailyReserveEntity): DailyReserveParkingDto[] {
    return [
      ...reserve.parkingReserves.map((item) => ({
        id: item.parkingReserveId,
        type: 'car' as const,
        number: item.parking.number,
        facilityName: item.parking.parentFacility?.facilityName ?? null,
        periodFrom: item.periodFrom,
        periodTo: item.periodTo,
        checkinFlag: item.checkinFlag,
        checkoutFlag: item.checkoutFlag,
      })),
      ...reserve.bicycleParkingReserves.map((item) => ({
        id: item.bicycleParkingReserveId,
        type: 'bicycle' as const,
        number: item.bicycleParking.number,
        facilityName: item.bicycleParking.parentFacility?.facilityName ?? null,
        periodFrom: item.periodFrom,
        periodTo: item.periodTo,
        checkinFlag: item.checkinFlag,
        checkoutFlag: item.checkoutFlag,
      })),
    ];
  }

  private paymentResult(reserve: DailyReserveEntity): string {
    if (reserve.checkinFlag) return 'Đã nhận';
    if (reserve.client?.postpaidFlag) return 'Trả sau';
    if (reserve.confirmFlag) return 'Đã xác nhận';
    return 'Chưa xác nhận';
  }

  private canCheckInFromData(
    reserve: DailyReserveEntity,
    latestPin: DailyReserveEntity['pinCredentials'][number] | undefined,
  ): boolean {
    if (reserve.checkinFlag) return false;
    if (!reserve.roomId || !reserve.periodFrom) return false;
    if (this.startOfDay(reserve.periodFrom).getTime() > this.startOfDay(new Date()).getTime()) {
      return false;
    }
    return Boolean(latestPin?.maskedPin || (reserve.rentalKeys ?? 0) > 0);
  }

  private isArrivalDue(reserve: DailyReserveEntity): boolean {
    if (!reserve.periodFrom) return false;
    return this.startOfDay(reserve.periodFrom).getTime() <= this.startOfDay(new Date()).getTime();
  }

  private isFirstReserve(reserve: DailyReserveEntity, firstReserveByClient: Map<number, Date>) {
    if (!reserve.clientId || !reserve.periodFrom) return false;
    const firstDate = firstReserveByClient.get(reserve.clientId);
    return firstDate ? firstDate.getTime() === reserve.periodFrom.getTime() : false;
  }

  private getClientDisplayName(reserve: DailyReserveEntity): string | null {
    const client = reserve.client;
    if (!client) return null;
    return (
      client.clientName ||
      client.clientNameEn ||
      client.companyName ||
      client.companyNameEn ||
      null
    );
  }

  private hasSmartLockUpdate(dto: UpdateDailyReserveDto): boolean {
    return dto.smartLockPin !== undefined;
  }

  private cleanOptionalString(value: string | null | undefined): string | undefined {
    const normalized = typeof value === 'string' ? value.trim() : value;
    return normalized ? normalized : undefined;
  }

  private diffDays(from: Date | null, to: Date | null): number {
    if (!from || !to) return 0;
    const days = Math.ceil((this.startOfDay(to).getTime() - this.startOfDay(from).getTime()) / MS_PER_DAY);
    return Math.max(0, days);
  }

  private maskPin(pin: string): string {
    return `****${pin.slice(-4)}`;
  }

  private readProviderPayloadObject(value: Prisma.JsonValue): Record<string, unknown> {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    return {};
  }

  private parseDate(value: string | undefined): Date | null {
    if (!value) return null;
    const normalized = value.replace(/\//g, '-');
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) return null;
    return this.startOfDay(parsed);
  }

  private startOfDay(date: Date): Date {
    const out = new Date(date);
    out.setHours(0, 0, 0, 0);
    return out;
  }

  private addDays(date: Date, days: number): Date {
    const out = new Date(date);
    out.setDate(out.getDate() + days);
    return out;
  }
}
