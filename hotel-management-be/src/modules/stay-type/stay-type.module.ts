import { Module } from '@nestjs/common';
import { StayTypeController } from './stay-type.controller';
import { StayTypeService } from './stay-type.service';

@Module({
  controllers: [StayTypeController],
  providers: [StayTypeService],
  exports: [StayTypeService],
})
export class StayTypeModule { }
