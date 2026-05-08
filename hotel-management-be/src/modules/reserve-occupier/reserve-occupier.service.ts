import { Injectable, NotFoundException } from '@nestjs/common'
import { ERROR_MESSAGES } from '@common/index'
import { ReserveOccupierRepository } from './reserve-occupier.repository'
import {
  CreateReserveOccupierDto,
  CreateReserveOccupierBatchDto,
  UpdateReserveOccupierDto,
  ReserveOccupierResponseDto,
} from './dto'

@Injectable()
export class ReserveOccupierService {
  constructor(private readonly repo: ReserveOccupierRepository) {}

  async findByReserveId(reserveId: number): Promise<{ data: ReserveOccupierResponseDto[] }> {
    const items = await this.repo.findAll(reserveId)
    return { data: items.map(ReserveOccupierResponseDto.fromEntity) }
  }

  async create(dto: CreateReserveOccupierDto, staffId: number): Promise<ReserveOccupierResponseDto> {
    const entity = await this.repo.create({
      reserve: { connect: { reserveId: dto.reserveId } },
      occupierName: dto.occupierName,
      sex: dto.sex ?? 9,
      birthday: dto.birthday ? new Date(dto.birthday) : null,
      tel: dto.tel,
      address1: dto.address1,
      orderNum: dto.orderNum,
      createdBy: { connect: { staffId } },
    })
    return ReserveOccupierResponseDto.fromEntity(entity)
  }

  async createBatch(
    dto: CreateReserveOccupierBatchDto,
    staffId: number,
  ): Promise<{ data: ReserveOccupierResponseDto[] }> {
    await this.repo.createMany(
      dto.occupiers.map((item) => ({
        reserveId: dto.reserveId,
        occupierName: item.occupierName,
        sex: item.sex ?? 9,
        birthday: item.birthday ? new Date(item.birthday) : null,
        tel: item.tel ?? null,
        address1: item.address1 ?? null,
        orderNum: item.orderNum ?? null,
        createdStaffId: staffId,
      })),
    )
    return this.findByReserveId(dto.reserveId)
  }

  async update(id: number, dto: UpdateReserveOccupierDto, staffId: number): Promise<ReserveOccupierResponseDto> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND)

    const entity = await this.repo.update(id, {
      ...(dto.occupierName !== undefined && { occupierName: dto.occupierName }),
      ...(dto.sex !== undefined && { sex: dto.sex }),
      ...(dto.birthday !== undefined && { birthday: dto.birthday ? new Date(dto.birthday) : null }),
      ...(dto.tel !== undefined && { tel: dto.tel }),
      ...(dto.address1 !== undefined && { address1: dto.address1 }),
      ...(dto.orderNum !== undefined && { orderNum: dto.orderNum }),
      updatedBy: { connect: { staffId } },
    })
    return ReserveOccupierResponseDto.fromEntity(entity)
  }

  async remove(id: number, staffId: number): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND)
    await this.repo.softDelete(id, staffId)
  }
}
