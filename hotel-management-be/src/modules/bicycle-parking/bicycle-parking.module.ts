import { Module } from '@nestjs/common';
import { BicycleParkingController } from './bicycle-parking.controller';
import { BicycleParkingService } from './bicycle-parking.service';
import { BicycleParkingRepository } from './bicycle-parking.repository';

@Module({
  controllers: [BicycleParkingController],
  providers: [BicycleParkingService, BicycleParkingRepository],
  exports: [BicycleParkingService],
})
export class BicycleParkingModule { }
