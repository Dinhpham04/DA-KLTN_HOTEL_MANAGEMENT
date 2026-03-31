import { Module } from '@nestjs/common';
import { RentController } from './rent.controller';
import { RentService } from './rent.service';
import { RentRepository } from './rent.repository';

@Module({
  controllers: [RentController],
  providers: [RentService, RentRepository],
  exports: [RentService],
})
export class RentModule { }
