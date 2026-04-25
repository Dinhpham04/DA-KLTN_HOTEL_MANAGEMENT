import { Module } from '@nestjs/common';
import { SmartLockPinController } from './smart-lock-pin.controller';
import { SmartLockPinService } from './smart-lock-pin.service';
import { SmartLockPinRepository } from './smart-lock-pin.repository';

@Module({
  controllers: [SmartLockPinController],
  providers: [SmartLockPinService, SmartLockPinRepository],
  exports: [SmartLockPinService],
})
export class SmartLockPinModule {}
