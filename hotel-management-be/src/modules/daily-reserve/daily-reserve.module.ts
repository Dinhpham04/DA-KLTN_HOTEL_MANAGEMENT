import { Module } from '@nestjs/common';
import { DailyReserveController } from './daily-reserve.controller';
import { DailyReserveRepository } from './daily-reserve.repository';
import { DailyReserveService } from './daily-reserve.service';

@Module({
  controllers: [DailyReserveController],
  providers: [DailyReserveService, DailyReserveRepository],
  exports: [DailyReserveService],
})
export class DailyReserveModule {}
