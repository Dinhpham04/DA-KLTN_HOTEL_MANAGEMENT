import { PartialType } from '@nestjs/swagger'
import { CreateReserveOccupierItemDto } from './create-reserve-occupier.dto'

export class UpdateReserveOccupierDto extends PartialType(CreateReserveOccupierItemDto) {}
