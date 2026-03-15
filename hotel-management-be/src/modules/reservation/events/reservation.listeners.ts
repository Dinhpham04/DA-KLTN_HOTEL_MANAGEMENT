import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '@database/prisma.service';
import { RESERVATION_EVENTS } from '@common/constants/index';
import { RoomStatus } from '@common/enums/index';
import { ReservationCheckedInEvent, ReservationCheckedOutEvent } from './reservation.events';

@Injectable()
export class ReservationEventListeners {
  constructor(private readonly prisma: PrismaService) { }

  @OnEvent(RESERVATION_EVENTS.CHECKED_IN)
  async handleCheckedIn(event: ReservationCheckedInEvent) {
    if (event.roomId) {
      await this.prisma.room.update({
        where: { roomId: event.roomId },
        data: { roomStatus: RoomStatus.FINISHING },
      });
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
