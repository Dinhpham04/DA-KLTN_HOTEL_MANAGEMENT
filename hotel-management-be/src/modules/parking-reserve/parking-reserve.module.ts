import { Module } from '@nestjs/common';
import { ParkingReserveController } from './parking-reserve.controller';
import { ParkingReserveService } from './parking-reserve.service';
import { ParkingReserveRepository } from './parking-reserve.repository';

@Module({
  controllers: [ParkingReserveController],
  providers: [ParkingReserveService, ParkingReserveRepository],
  exports: [ParkingReserveService],
})
export class ParkingReserveModule {}
