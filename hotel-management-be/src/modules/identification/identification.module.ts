import { Module } from '@nestjs/common';
import { IdentificationController } from './identification.controller';
import { IdentificationService } from './identification.service';
import { IdentificationRepository } from './identification.repository';

@Module({
  controllers: [IdentificationController],
  providers: [IdentificationService, IdentificationRepository],
  exports: [IdentificationService, IdentificationRepository],
})
export class IdentificationModule {}
