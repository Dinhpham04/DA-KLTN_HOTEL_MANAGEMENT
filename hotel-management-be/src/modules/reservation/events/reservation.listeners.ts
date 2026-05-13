import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '@database/prisma.service';
import { RESERVATION_EVENTS } from '@common/constants/index';
import { RoomStatus } from '@common/enums/index';
import {
  ReservationCheckedInEvent,
  ReservationCheckedOutEvent,
  ReservationCreatedEvent,
} from './reservation.events';
import { ReservationAutomationService } from '../reservation-automation.service';

@Injectable()
export class ReservationEventListeners {
  private readonly logger = new Logger(ReservationEventListeners.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reservationAutomationService: ReservationAutomationService,
  ) {}

  @OnEvent(RESERVATION_EVENTS.CREATED)
  async handleCreated(event: ReservationCreatedEvent) {
    try {
      await this.reservationAutomationService.notifyReservationCreated(event.reserveId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Reservation created automation failed: ${message}`);
    }
  }

  @OnEvent(RESERVATION_EVENTS.CHECKED_IN)
  async handleCheckedIn(event: ReservationCheckedInEvent) {
    if (event.roomId) {
      await this.prisma.room.update({
        where: { roomId: event.roomId },
        data: { roomStatus: RoomStatus.FINISHING },
      });
    }

    try {
      await this.reservationAutomationService.notifyReservationCheckedIn(event.reserveId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Reservation checked-in automation failed: ${message}`);
    }
  }

  @OnEvent(RESERVATION_EVENTS.CHECKED_OUT)
  async handleCheckedOut(event: ReservationCheckedOutEvent) {
    if (event.roomId) {
      await this.prisma.room.update({
        where: { roomId: event.roomId },
        data: { roomStatus: RoomStatus.FULL_CLEANING },
      });
    }
  }
}
