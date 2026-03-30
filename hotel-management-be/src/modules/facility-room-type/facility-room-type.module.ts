import { Module } from '@nestjs/common';
import { FacilityRoomTypeController } from './facility-room-type.controller';
import { FacilityRoomTypeService } from './facility-room-type.service';
import { FacilityRoomTypeRepository } from './facility-room-type.repository';

@Module({
  controllers: [FacilityRoomTypeController],
  providers: [FacilityRoomTypeService, FacilityRoomTypeRepository],
  exports: [FacilityRoomTypeService],
})
export class FacilityRoomTypeModule { }
