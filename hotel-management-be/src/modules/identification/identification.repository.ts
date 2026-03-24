import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class IdentificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByClientId(clientId: number) {
    return this.prisma.identification.findMany({
      where: { clientId, deletedAt: null },
      orderBy: { identificationId: 'desc' },
    });
  }

  async findById(id: number) {
    return this.prisma.identification.findFirst({
      where: { identificationId: id, deletedAt: null },
    });
  }

  async create(data: Prisma.IdentificationCreateInput) {
    return this.prisma.identification.create({ data });
  }

  async update(id: number, data: Prisma.IdentificationUpdateInput) {
    return this.prisma.identification.update({
      where: { identificationId: id },
      data,
    });
  }

  async softDelete(id: number, staffId: number) {
    return this.prisma.identification.update({
      where: { identificationId: id },
      data: {
        deletedAt: new Date(),
        deletedBy: { connect: { staffId } },
      },
    });
  }
}
