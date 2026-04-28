import { Module } from '@nestjs/common';
import { CleaningShiftController } from './cleaning-shift.controller';
import { CleaningShiftService } from './cleaning-shift.service';
import { CleaningShiftRepository } from './cleaning-shift.repository';

@Module({
  controllers: [CleaningShiftController],
  providers: [CleaningShiftService, CleaningShiftRepository],
  exports: [CleaningShiftService],
})
export class CleaningShiftModule {}
