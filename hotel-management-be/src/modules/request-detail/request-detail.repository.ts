import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import type { Prisma, RequestDetail } from '@prisma/client';

@Injectable()
export class RequestDetailRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(reserveId: number): Promise<RequestDetail[]> {
    return this.prisma.requestDetail.findMany({
      where: { reserveId, deletedAt: null },
      orderBy: [{ requestDetailId: 'asc' }],
    });
  }

  findById(id: number): Promise<RequestDetail | null> {
    return this.prisma.requestDetail.findFirst({
      where: { requestDetailId: id, deletedAt: null },
    });
  }

  create(data: Prisma.RequestDetailCreateInput): Promise<RequestDetail> {
    return this.prisma.requestDetail.create({ data });
  }

  update(id: number, data: Prisma.RequestDetailUpdateInput): Promise<RequestDetail> {
    return this.prisma.requestDetail.update({
      where: { requestDetailId: id },
      data,
    });
  }

  softDelete(id: number, staffId: number): Promise<RequestDetail> {
    return this.prisma.requestDetail.update({
      where: { requestDetailId: id },
      data: {
        deletedAt: new Date(),
        deletedBy: { connect: { staffId } },
      },
    });
  }
}
