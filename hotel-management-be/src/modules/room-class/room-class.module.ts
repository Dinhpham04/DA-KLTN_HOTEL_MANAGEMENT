import { Module } from '@nestjs/common';
import { RoomClassController } from './room-class.controller';
import { RoomClassService } from './room-class.service';
import { RoomClassRepository } from './room-class.repository';

@Module({
  controllers: [RoomClassController],
  providers: [RoomClassService, RoomClassRepository],
  exports: [RoomClassService],
})
export class RoomClassModule { }
