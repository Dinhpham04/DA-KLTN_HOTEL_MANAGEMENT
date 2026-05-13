import { Module } from '@nestjs/common';
import { ClientModule } from '@modules/client/client.module';
import { ReservationController } from './reservation.controller';
import { ReservationAutomationController } from './reservation-automation.controller';
import { ReservationAutomationService } from './reservation-automation.service';
import { ReservationService } from './reservation.service';
import { ReservationRepository } from './reservation.repository';
import { ReservationEventListeners } from './events/reservation.listeners';

@Module({
  imports: [ClientModule],
  controllers: [ReservationController, ReservationAutomationController],
  providers: [
    ReservationService,
    ReservationAutomationService,
    ReservationRepository,
    ReservationEventListeners,
  ],
  exports: [ReservationService, ReservationRepository],
})
export class ReservationModule { }
