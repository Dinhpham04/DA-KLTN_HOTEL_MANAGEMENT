import { Module } from '@nestjs/common'
import { ReserveOccupierController } from './reserve-occupier.controller'
import { ReserveOccupierService } from './reserve-occupier.service'
import { ReserveOccupierRepository } from './reserve-occupier.repository'

@Module({
  controllers: [ReserveOccupierController],
  providers: [ReserveOccupierService, ReserveOccupierRepository],
  exports: [ReserveOccupierService],
})
export class ReserveOccupierModule {}
