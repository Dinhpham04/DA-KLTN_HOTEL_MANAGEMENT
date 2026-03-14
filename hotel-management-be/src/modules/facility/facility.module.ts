import { Module } from '@nestjs/common';
import { FacilityController } from './facility.controller';
import { FacilityService } from './facility.service';
import { FacilityRepository } from './facility.repository';

@Module({
  controllers: [FacilityController],
  providers: [FacilityService, FacilityRepository],
  exports: [FacilityService],
})
export class FacilityModule { }
