import { Injectable } from '@nestjs/common'
import { PrismaService } from '@database/prisma.service'
import type { ReserveOccupier, Prisma } from '@prisma/client'

@Injectable()
export class ReserveOccupierRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(reserveId: number): Promise<ReserveOccupier[]> {
    return this.prisma.reserveOccupier.findMany({
      where: { reserveId, deletedAt: null },
      orderBy: [{ orderNum: 'asc' }, { reserveOccupierId: 'asc' }],
    })
  }

  findById(id: number): Promise<ReserveOccupier | null> {
    return this.prisma.reserveOccupier.findFirst({
      where: { reserveOccupierId: id, deletedAt: null },
    })
  }

  create(data: Prisma.ReserveOccupierCreateInput): Promise<ReserveOccupier> {
    return this.prisma.reserveOccupier.create({ data })
  }

  createMany(data: Prisma.ReserveOccupierCreateManyInput[]): Promise<{ count: number }> {
    return this.prisma.reserveOccupier.createMany({ data })
  }

  update(id: number, data: Prisma.ReserveOccupierUpdateInput): Promise<ReserveOccupier> {
    return this.prisma.reserveOccupier.update({
      where: { reserveOccupierId: id },
      data,
    })
  }

  softDelete(id: number, staffId: number): Promise<ReserveOccupier> {
    return this.prisma.reserveOccupier.update({
      where: { reserveOccupierId: id },
      data: {
        deletedAt: new Date(),
        deletedBy: { connect: { staffId } },
      },
    })
  }
}
