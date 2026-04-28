import { Module } from '@nestjs/common';
import { ParkingStatusController } from './parking-status.controller';
import { ParkingStatusService } from './parking-status.service';
import { ParkingStatusRepository } from './parking-status.repository';

@Module({
  controllers: [ParkingStatusController],
  providers: [ParkingStatusService, ParkingStatusRepository],
  exports: [ParkingStatusService],
})
export class ParkingStatusModule {}
