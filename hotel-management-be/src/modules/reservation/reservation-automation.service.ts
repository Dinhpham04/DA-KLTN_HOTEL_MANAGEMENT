import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { DeleteStatus, DirectCheckinType, ReserveStatus } from '@common/enums/index';
import { PrismaService } from '@database/prisma.service';
import { ReservationRepository } from './reservation.repository';

const DATA_STATUS_AVAILABLE = 1;
const SMART_LOCK_PIN_STATUS_ACTIVE = 1;
const SELF_CHECKIN_CODE_RELEASE_HOURS = 3;

type ReservationCreatedAutomationPayload = {
  event: 'reservation.created';
  reservationId: number;
  reservationCode: string;
  customer: {
    id: number | null;
    name: string;
    email: string | null;
    phone: string | null;
    language: 'vi';
  };
  booking: {
    checkInAt: string | null;
    checkOutAt: string | null;
    roomType: string | null;
    roomNumber: string | null;
    guestCount: number;
    totalAmount: number | null;
    deposit: number | null;
    paymentStatus: 'unknown';
    cancellationPolicy: string;
    checkInPolicy: string;
    checkInMethod: 'front_desk' | 'self_checkin' | 'meet_and_greet' | 'unknown';
    note: string | null;
  };
  hotel: {
    facilityId: number | null;
    name: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    frontDeskGuide: string;
  };
};

type ReservationCheckedInAutomationPayload = {
  event: 'reservation.checked_in';
  reservationId: number;
  reservationCode: string;
  checkedInAt: string;
  customer: {
    id: number | null;
    name: string;
    email: string | null;
    phone: string | null;
    language: 'vi';
  };
  stay: {
    checkInAt: string | null;
    checkOutAt: string | null;
    checkoutTime: string;
    guestCount: number;
  };
  room: {
    roomId: number | null;
    roomNumber: string | null;
    floor: string | null;
    roomType: string | null;
  };
  hotel: {
    facilityId: number | null;
    name: string | null;
    address: string | null;
    frontDeskExtension: string;
    wifiSsid: string;
    wifiPassword: string;
  };
};

type DebtReminderItem = {
  reservationId: number;
  reservationCode: string;
  paymentDueDate: string;
  requestTotal: number;
  paidTotal: number;
  remainingAmount: number;
  customer: {
    id: number | null;
    name: string;
    email: string | null;
    phone: string | null;
    language: 'vi';
  };
  booking: {
    checkInAt: string | null;
    checkOutAt: string | null;
    roomType: string | null;
    roomNumber: string | null;
  };
  hotel: {
    facilityId: number | null;
    name: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
  };
};

@Injectable()
export class ReservationAutomationService {
  private readonly logger = new Logger(ReservationAutomationService.name);

  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async notifyReservationCreated(reserveId: number): Promise<void> {
    const webhookUrl = this.configService.get<string>('N8N_RESERVATION_CREATED_WEBHOOK_URL');
    if (!webhookUrl) return;

    const payload = await this.buildReservationCreatedPayload(reserveId);
    if (!payload) return;

    await this.postN8nWebhook(webhookUrl, payload, `reservation created ${reserveId}`);
  }

  async notifyReservationCheckedIn(reserveId: number): Promise<void> {
    const webhookUrl = this.configService.get<string>('N8N_RESERVATION_CHECKED_IN_WEBHOOK_URL');
    if (!webhookUrl) return;

    const payload = await this.buildReservationCheckedInPayload(reserveId);
    if (!payload) return;

    await this.postN8nWebhook(webhookUrl, payload, `reservation checked-in ${reserveId}`);
  }

  private async postN8nWebhook(
    webhookUrl: string,
    payload: unknown,
    context: string,
  ): Promise<void> {
    const webhookToken = this.configService.get<string>('N8N_AUTOMATION_SECRET');

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhookToken ? { 'X-Hotel-Automation-Token': webhookToken } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        this.logger.warn(`n8n webhook failed for ${context}: ${response.status} ${responseText}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`n8n webhook error for ${context}: ${message}`);
    }
  }

  async getAutomationStatus(reserveId: number) {
    const reserve = await this.reservationRepository.findById(reserveId);
    if (!reserve) throw new NotFoundException('Reservation not found');

    const checkInAt = reserve.checkinDate ?? reserve.periodFrom;
    const isCancelled =
      Number(reserve.reserveStatus) === Number(ReserveStatus.CANCELLED) ||
      Number(reserve.deleteStatus) === Number(DeleteStatus.CANCELLED) ||
      reserve.cancelledAt !== null ||
      reserve.deletedAt !== null;

    return {
      reservationId: reserve.reserveId,
      reservationCode: this.formatReservationCode(reserve.reserveId),
      reserveStatus: reserve.reserveStatus,
      deleteStatus: reserve.deleteStatus,
      checkinFlag: reserve.checkinFlag,
      disableReservation: reserve.disableReservation,
      checkInAt: checkInAt?.toISOString() ?? null,
      shouldSendCheckinReminder:
        !isCancelled && !reserve.checkinFlag && !reserve.disableReservation,
    };
  }

  async getDebtRemindersDue(
    dueDate: string,
  ): Promise<{ dueDate: string; reminders: DebtReminderItem[] }> {
    const targetDate = new Date(dueDate);
    if (Number.isNaN(targetDate.getTime())) {
      throw new BadRequestException('dueDate must be a valid ISO date');
    }

    const dayStart = new Date(targetDate);
    dayStart.setUTCHours(0, 0, 0, 0);
    const nextDayStart = new Date(dayStart);
    nextDayStart.setUTCDate(nextDayStart.getUTCDate() + 1);

    const reserves = await this.prisma.reserve.findMany({
      where: {
        deletedAt: null,
        cancelledAt: null,
        deleteStatus: null,
        paymentDueDate: {
          gte: dayStart,
          lt: nextDayStart,
        },
      },
      include: {
        client: true,
        facility: true,
        room: {
          include: {
            facility: true,
            roomType: {
              include: {
                roomClass: true,
              },
            },
          },
        },
        requestDetails: {
          where: {
            deletedAt: null,
          },
        },
        saleDetails: {
          where: {
            deletedAt: null,
          },
        },
      },
      orderBy: [{ paymentDueDate: 'asc' }, { reserveId: 'asc' }],
    });

    const reminders = reserves.flatMap((reserve) => {
      const requestTotal = reserve.requestDetails.reduce(
        (sum, detail) => sum + Number(detail.totalPriceChange ?? detail.totalPrice ?? 0),
        0,
      );
      const paidTotal = reserve.saleDetails.reduce(
        (sum, detail) => sum + Number(detail.totalPrice ?? 0),
        0,
      );
      const remainingAmount = requestTotal - paidTotal;
      if (remainingAmount <= 0 || !reserve.paymentDueDate) return [];

      const facility = reserve.facility ?? reserve.room?.facility;
      const roomType = reserve.room?.roomType;
      const client = reserve.client;

      return [
        {
          reservationId: reserve.reserveId,
          reservationCode: this.formatReservationCode(reserve.reserveId),
          paymentDueDate: reserve.paymentDueDate.toISOString().split('T')[0] ?? dueDate,
          requestTotal,
          paidTotal,
          remainingAmount,
          customer: {
            id: reserve.clientId,
            name: client?.clientName ?? client?.clientNameEn ?? 'Quý khách',
            email: client?.email ?? null,
            phone: client?.tel ?? client?.telPhone ?? client?.companyTel ?? null,
            language: 'vi',
          },
          booking: {
            checkInAt: (reserve.checkinDate ?? reserve.periodFrom)?.toISOString() ?? null,
            checkOutAt: reserve.periodTo?.toISOString() ?? null,
            roomType: roomType?.roomTypeName ?? roomType?.roomClass?.roomClassName ?? null,
            roomNumber: reserve.room?.roomNumber ?? null,
          },
          hotel: {
            facilityId: facility?.facilityId ?? null,
            name: facility?.facilityName ?? null,
            address: facility?.address ?? null,
            phone: null,
            email: null,
          },
        } satisfies DebtReminderItem,
      ];
    });

    return {
      dueDate: dayStart.toISOString().split('T')[0] ?? dueDate,
      reminders,
    };
  }

  async getSelfCheckinStatus(reserveId: number) {
    const reserve = await this.reservationRepository.findById(reserveId);
    if (!reserve) throw new NotFoundException('Reservation not found');

    const checkInAt = reserve.checkinDate ?? reserve.periodFrom;
    const releaseAt = checkInAt
      ? new Date(checkInAt.getTime() - SELF_CHECKIN_CODE_RELEASE_HOURS * 60 * 60 * 1000)
      : null;
    const isSelfCheckin = this.isSelfCheckin(reserve);
    const isCancelled = this.isCancelled(reserve);
    const selfCheckinCompleted = isSelfCheckin;
    const activeCredential = await this.findLatestActiveCredential(reserve.reserveId);
    const hasReleasePin = Boolean(
      activeCredential && this.readAutomationReleasePin(activeCredential.providerPayload),
    );

    return {
      reservationId: reserve.reserveId,
      reservationCode: this.formatReservationCode(reserve.reserveId),
      isSelfCheckin,
      selfCheckinCompleted,
      selfCheckinCompletionSource: 'assumed_by_current_workflow',
      roomId: reserve.roomId,
      roomNumber: reserve.room?.roomNumber ?? null,
      hasSmartLockPin: activeCredential !== null,
      hasReleasableSmartLockPin: hasReleasePin,
      checkInAt: checkInAt?.toISOString() ?? null,
      checkOutAt: reserve.periodTo?.toISOString() ?? null,
      releaseAt: releaseAt?.toISOString() ?? null,
      checkinFlag: reserve.checkinFlag,
      disableReservation: reserve.disableReservation,
      canReleaseCheckinCode:
        isSelfCheckin &&
        selfCheckinCompleted &&
        !isCancelled &&
        !reserve.checkinFlag &&
        !reserve.disableReservation &&
        reserve.roomId !== null &&
        checkInAt !== null &&
        reserve.periodTo !== null &&
        activeCredential !== null &&
        hasReleasePin,
    };
  }

  async releaseCheckinCode(reserveId: number) {
    const reserve = await this.reservationRepository.findById(reserveId);
    if (!reserve) throw new NotFoundException('Reservation not found');

    if (!this.isSelfCheckin(reserve)) {
      throw new BadRequestException('Reservation is not configured for self check-in');
    }

    if (this.isCancelled(reserve) || reserve.disableReservation) {
      throw new ConflictException('Reservation is cancelled or disabled');
    }

    if (reserve.checkinFlag) {
      throw new ConflictException('Reservation is already checked in');
    }

    if (!reserve.roomId) {
      throw new BadRequestException('Reservation room is required to issue check-in PIN');
    }

    const existing = await this.findLatestActiveCredential(reserve.reserveId);
    if (!existing) {
      throw new ConflictException('No active smart lock PIN credential exists for reservation');
    }

    const pin = this.readAutomationReleasePin(existing.providerPayload);
    if (!pin) {
      throw new ConflictException(
        'Existing smart lock PIN cannot be released because the original PIN is not stored. Please re-save the PIN before sending it to the guest.',
      );
    }

    const now = new Date();

    const providerPayload = {
      ...this.readProviderPayloadObject(existing.providerPayload),
      releasedAt: now.toISOString(),
      releaseWindowHours: SELF_CHECKIN_CODE_RELEASE_HOURS,
    } satisfies Prisma.InputJsonObject;

    const credential = await this.prisma.roomPinCredential.update({
      where: { roomPinCredentialId: existing.roomPinCredentialId },
      data: {
        issuedAt: existing.issuedAt ?? now,
        providerPayload,
        updatedStaffId: this.getAutomationStaffId(),
      },
    });

    return {
      reservationId: reserve.reserveId,
      reservationCode: this.formatReservationCode(reserve.reserveId),
      roomPinCredentialId: credential.roomPinCredentialId,
      roomId: reserve.roomId,
      roomNumber: reserve.room?.roomNumber ?? null,
      pin,
      maskedPin: credential.maskedPin,
      validFrom: credential.validFrom.toISOString(),
      validTo: credential.validTo.toISOString(),
      issuedAt: now.toISOString(),
    };
  }

  private async buildReservationCreatedPayload(
    reserveId: number,
  ): Promise<ReservationCreatedAutomationPayload | null> {
    const reserve = await this.reservationRepository.findById(reserveId);
    if (!reserve) {
      this.logger.warn(`Reservation ${reserveId} not found for n8n webhook`);
      return null;
    }

    const client = reserve.client;
    const facility = reserve.facility ?? reserve.room?.facility;
    const roomType = reserve.room?.roomType;
    const checkInAt = reserve.checkinDate ?? reserve.periodFrom;
    const guestCount = Math.max(reserve.reserveOccupiers.length, 1);

    return {
      event: 'reservation.created',
      reservationId: reserve.reserveId,
      reservationCode: this.formatReservationCode(reserve.reserveId),
      customer: {
        id: reserve.clientId,
        name: client?.clientName ?? client?.clientNameEn ?? 'Quý khách',
        email: client?.email ?? null,
        phone: client?.tel ?? client?.telPhone ?? client?.companyTel ?? null,
        language: 'vi',
      },
      booking: {
        checkInAt: checkInAt?.toISOString() ?? null,
        checkOutAt: reserve.periodTo?.toISOString() ?? null,
        roomType: roomType?.roomTypeName ?? roomType?.roomClass?.roomClassName ?? null,
        roomNumber: reserve.room?.roomNumber ?? null,
        guestCount,
        totalAmount: reserve.bookingUnitPrice ?? null,
        deposit: reserve.deposit ?? null,
        paymentStatus: 'unknown',
        cancellationPolicy:
          'Vui lòng liên hệ khách sạn để được hỗ trợ hủy hoặc thay đổi đặt phòng.',
        checkInPolicy:
          'Giờ nhận phòng tiêu chuẩn từ 14:00. Quý khách vui lòng liên hệ trước nếu cần nhận phòng sớm.',
        checkInMethod: this.mapCheckInMethod(reserve.directcheckinType),
        note: reserve.directcheckinNote ?? reserve.note ?? null,
      },
      hotel: {
        facilityId: facility?.facilityId ?? null,
        name: facility?.facilityName ?? null,
        address: facility?.address ?? null,
        phone: null,
        email: null,
        frontDeskGuide:
          'Khi đến khách sạn, quý khách vui lòng đến quầy lễ tân và cung cấp mã đặt phòng.',
      },
    };
  }

  private async buildReservationCheckedInPayload(
    reserveId: number,
  ): Promise<ReservationCheckedInAutomationPayload | null> {
    const reserve = await this.reservationRepository.findById(reserveId);
    if (!reserve) {
      this.logger.warn(`Reservation ${reserveId} not found for checked-in n8n webhook`);
      return null;
    }

    const client = reserve.client;
    const facility = reserve.facility ?? reserve.room?.facility;
    const roomType = reserve.room?.roomType;
    const checkInAt = reserve.checkedInAt ?? reserve.checkinDate ?? reserve.periodFrom;
    const checkedInAt = reserve.checkedInAt ?? new Date();
    const guestCount = Math.max(reserve.reserveOccupiers.length, 1);

    return {
      event: 'reservation.checked_in',
      reservationId: reserve.reserveId,
      reservationCode: this.formatReservationCode(reserve.reserveId),
      checkedInAt: checkedInAt.toISOString(),
      customer: {
        id: reserve.clientId,
        name: client?.clientName ?? client?.clientNameEn ?? 'Quý khách',
        email: client?.email ?? null,
        phone: client?.tel ?? client?.telPhone ?? client?.companyTel ?? null,
        language: 'vi',
      },
      stay: {
        checkInAt: checkInAt?.toISOString() ?? null,
        checkOutAt: reserve.periodTo?.toISOString() ?? null,
        checkoutTime: '12:00',
        guestCount,
      },
      room: {
        roomId: reserve.roomId,
        roomNumber: reserve.room?.roomNumber ?? null,
        floor: this.inferFloor(reserve.room?.roomNumber),
        roomType: roomType?.roomTypeName ?? roomType?.roomClass?.roomClassName ?? null,
      },
      hotel: {
        facilityId: facility?.facilityId ?? null,
        name: facility?.facilityName ?? null,
        address: facility?.address ?? null,
        frontDeskExtension: '0',
        wifiSsid: 'Hotel-Guest',
        wifiPassword: 'Welcome2026',
      },
    };
  }

  private formatReservationCode(reserveId: number): string {
    return `RSV-${reserveId.toString().padStart(6, '0')}`;
  }

  private inferFloor(roomNumber: string | null | undefined): string | null {
    if (!roomNumber) return null;

    const digits = roomNumber.match(/\d+/)?.[0];
    if (!digits || digits.length < 2) return null;

    return digits.length >= 3 ? digits.slice(0, -2) : digits.slice(0, 1);
  }

  private isSelfCheckin(
    reserve: NonNullable<Awaited<ReturnType<ReservationRepository['findById']>>>,
  ): boolean {
    return reserve.directcheckinType === DirectCheckinType.SELF_CHECKIN;
  }

  private isCancelled(
    reserve: NonNullable<Awaited<ReturnType<ReservationRepository['findById']>>>,
  ): boolean {
    return (
      Number(reserve.reserveStatus) === Number(ReserveStatus.CANCELLED) ||
      Number(reserve.deleteStatus) === Number(DeleteStatus.CANCELLED) ||
      reserve.cancelledAt !== null ||
      reserve.deletedAt !== null
    );
  }

  private getAutomationStaffId(): number {
    return this.configService.get<number>('RESERVATION_AUTOMATION_STAFF_ID') ?? 1;
  }

  private async findLatestActiveCredential(reserveId: number) {
    return this.prisma.roomPinCredential.findFirst({
      where: {
        reserveId,
        deletedAt: null,
        dataStatus: DATA_STATUS_AVAILABLE,
        status: SMART_LOCK_PIN_STATUS_ACTIVE,
      },
      orderBy: {
        roomPinCredentialId: 'desc',
      },
    });
  }

  private readProviderPayloadObject(value: Prisma.JsonValue): Record<string, unknown> {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    return {};
  }

  private readAutomationReleasePin(value: Prisma.JsonValue): string | null {
    const payload = this.readProviderPayloadObject(value);
    const pin = payload['automationReleasePin'];

    return typeof pin === 'string' && /^\d{4,12}$/.test(pin) ? pin : null;
  }

  private mapCheckInMethod(
    directcheckinType: number | null,
  ): ReservationCreatedAutomationPayload['booking']['checkInMethod'] {
    switch (directcheckinType) {
      case DirectCheckinType.FRONT_DESK:
        return 'front_desk';
      case DirectCheckinType.SELF_CHECKIN:
        return 'self_checkin';
      case DirectCheckinType.MEET_AND_GREET:
        return 'meet_and_greet';
      default:
        return 'unknown';
    }
  }
}
