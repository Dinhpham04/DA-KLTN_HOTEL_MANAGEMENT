import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import type { Prisma, SaleDetail } from '@prisma/client';

@Injectable()
export class SaleDetailRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(reserveId: number): Promise<SaleDetail[]> {
    return this.prisma.saleDetail.findMany({
      where: { reserveId, deletedAt: null },
      orderBy: [{ saleDate: 'asc' }, { saleDetailId: 'asc' }],
    });
  }

  findById(id: number): Promise<SaleDetail | null> {
    return this.prisma.saleDetail.findFirst({
      where: { saleDetailId: id, deletedAt: null },
    });
  }

  create(data: Prisma.SaleDetailCreateInput): Promise<SaleDetail> {
    return this.prisma.saleDetail.create({ data });
  }

  update(id: number, data: Prisma.SaleDetailUpdateInput): Promise<SaleDetail> {
    return this.prisma.saleDetail.update({
      where: { saleDetailId: id },
      data,
    });
  }

  softDelete(id: number, staffId: number): Promise<SaleDetail> {
    return this.prisma.saleDetail.update({
      where: { saleDetailId: id },
      data: {
        deletedAt: new Date(),
        deletedBy: { connect: { staffId } },
      },
    });
  }
}
