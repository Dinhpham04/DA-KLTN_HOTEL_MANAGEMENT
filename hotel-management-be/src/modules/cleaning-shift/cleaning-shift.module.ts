import { Module } from '@nestjs/common';
import { CleaningShiftController } from './cleaning-shift.controller';
import { CleaningShiftAutomationController } from './cleaning-shift-automation.controller';
import { CleaningShiftService } from './cleaning-shift.service';
import { CleaningShiftRepository } from './cleaning-shift.repository';

@Module({
  controllers: [CleaningShiftController, CleaningShiftAutomationController],
  providers: [CleaningShiftService, CleaningShiftRepository],
  exports: [CleaningShiftService],
})
export class CleaningShiftModule {}
