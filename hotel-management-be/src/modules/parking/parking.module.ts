import { Module } from '@nestjs/common';
import { ParkingController } from './parking.controller';
import { ParkingService } from './parking.service';
import { ParkingRepository } from './parking.repository';

@Module({
  controllers: [ParkingController],
  providers: [ParkingService, ParkingRepository],
  exports: [ParkingService],
})
export class ParkingModule { }
