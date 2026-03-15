import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { ClientFilterDto } from './dto';

@Injectable()
export class ClientRepository {
  constructor(private readonly prisma: PrismaService) { }

  private readonly includeRelations = {
    country: true,
  } as const;

  async findAll(filter: ClientFilterDto) {
    const where: Prisma.ClientWhereInput = { deletedAt: null };

    if (filter.dataStatus !== undefined) where.dataStatus = filter.dataStatus;
    if (filter.dataType !== undefined) where.dataType = filter.dataType;
    if (filter.countryId !== undefined) where.countryId = filter.countryId;

    if (filter.search) {
      where.OR = [
        { clientName: { contains: filter.search, mode: 'insensitive' } },
        { clientNameEn: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
        { tel: { contains: filter.search, mode: 'insensitive' } },
        { companyName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.ClientOrderByWithRelationInput =
      filter.orderBy ? { [filter.orderBy]: filter.order } : { clientId: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        include: this.includeRelations,
        orderBy,
        skip: filter.skip,
        take: filter.limit,
      }),
      this.prisma.client.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: number) {
    return this.prisma.client.findFirst({
      where: { clientId: id, deletedAt: null },
      include: this.includeRelations,
    });
  }

  async findByEmail(email: string, excludeId?: number) {
    return this.prisma.client.findFirst({
      where: {
        email,
        deletedAt: null,
        ...(excludeId !== undefined && { NOT: { clientId: excludeId } }),
      },
    });
  }

  async create(data: Prisma.ClientCreateInput) {
    return this.prisma.client.create({ data, include: this.includeRelations });
  }

  async update(id: number, data: Prisma.ClientUpdateInput) {
    return this.prisma.client.update({
      where: { clientId: id },
      data,
      include: this.includeRelations,
    });
  }

  async softDelete(id: number, staffId: number) {
    return this.prisma.client.update({
      where: { clientId: id },
      data: {
        deletedAt: new Date(),
        deletedBy: { connect: { staffId } },
      },
    });
  }

  async incrementUseCount(clientId: number) {
    return this.prisma.client.update({
      where: { clientId },
      data: { useCount: { increment: 1 } },
    });
  }

  async decrementUseCount(clientId: number) {
    return this.prisma.client.update({
      where: { clientId },
      data: { useCount: { decrement: 1 } },
    });
  }
}
