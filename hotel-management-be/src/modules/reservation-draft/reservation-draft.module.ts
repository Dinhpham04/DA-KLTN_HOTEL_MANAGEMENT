import { Module } from '@nestjs/common';
import { ClientModule } from '@modules/client/client.module';
import { ReservationModule } from '@modules/reservation/reservation.module';
import { ReservationDraftController } from './reservation-draft.controller';
import { ReservationDraftService } from './reservation-draft.service';

@Module({
  imports: [ClientModule, ReservationModule],
  controllers: [ReservationDraftController],
  providers: [ReservationDraftService],
})
export class ReservationDraftModule {}
