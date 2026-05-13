import { Module } from '@nestjs/common';
import { SaleDetailController } from './sale-detail.controller';
import { SaleDetailService } from './sale-detail.service';
import { SaleDetailRepository } from './sale-detail.repository';

@Module({
  controllers: [SaleDetailController],
  providers: [SaleDetailService, SaleDetailRepository],
  exports: [SaleDetailService],
})
export class SaleDetailModule {}
