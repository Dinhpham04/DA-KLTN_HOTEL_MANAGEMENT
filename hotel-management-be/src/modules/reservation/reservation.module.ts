import { Module } from '@nestjs/common';
import { ClientModule } from '@modules/client/client.module';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { ReservationRepository } from './reservation.repository';
import { ReservationEventListeners } from './events/reservation.listeners';

@Module({
  imports: [ClientModule],
  controllers: [ReservationController],
  providers: [ReservationService, ReservationRepository, ReservationEventListeners],
  exports: [ReservationService, ReservationRepository],
})
export class ReservationModule { }
