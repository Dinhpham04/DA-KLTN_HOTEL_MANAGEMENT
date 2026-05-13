import { Module } from '@nestjs/common';
import { RequestDetailController } from './request-detail.controller';
import { RequestDetailService } from './request-detail.service';
import { RequestDetailRepository } from './request-detail.repository';

@Module({
  controllers: [RequestDetailController],
  providers: [RequestDetailService, RequestDetailRepository],
  exports: [RequestDetailService],
})
export class RequestDetailModule {}
