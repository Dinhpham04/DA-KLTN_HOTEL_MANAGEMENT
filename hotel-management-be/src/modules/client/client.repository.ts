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
    const andConditions: Prisma.ClientWhereInput[] = [];

    if (filter.dataStatus !== undefined) where.dataStatus = filter.dataStatus;
    if (filter.countryId !== undefined) where.countryId = filter.countryId;

    // Handle dataTypes array (multiple types)
    if (filter.dataTypes && filter.dataTypes.length > 0) {
      where.dataType = { in: filter.dataTypes };
    } else if (filter.dataType !== undefined) {
      // Fallback to single dataType
      where.dataType = filter.dataType;
    }

    // Individual field filters (AND logic between fields)
    if (filter.clientName) {
      andConditions.push({
        OR: [
          { clientName: { contains: filter.clientName, mode: 'insensitive' } },
          { clientNameEn: { contains: filter.clientName, mode: 'insensitive' } },
          { companyName: { contains: filter.clientName, mode: 'insensitive' } },
          { companyNameEn: { contains: filter.clientName, mode: 'insensitive' } },
        ],
      });
    }

    if (filter.contactName) {
      andConditions.push({
        OR: [
          { contactName: { contains: filter.contactName, mode: 'insensitive' } },
          { contactNameEn: { contains: filter.contactName, mode: 'insensitive' } },
        ],
      });
    }

    if (filter.email) {
      andConditions.push({
        email: { contains: filter.email, mode: 'insensitive' },
      });
    }

    // Phone filters - strip non-alphanumeric for matching
    if (filter.tel) {
      const cleanTel = filter.tel.replace(/[^a-zA-Z0-9]/g, '');
      andConditions.push({
        tel: { contains: cleanTel, mode: 'insensitive' },
      });
    }

    if (filter.telPhone) {
      const cleanTelPhone = filter.telPhone.replace(/[^a-zA-Z0-9]/g, '');
      andConditions.push({
        telPhone: { contains: cleanTelPhone, mode: 'insensitive' },
      });
    }

    if (filter.telEmergency) {
      const cleanTelEmergency = filter.telEmergency.replace(/[^a-zA-Z0-9]/g, '');
      andConditions.push({
        telEmergency: { contains: cleanTelEmergency, mode: 'insensitive' },
      });
    }

    // Generic search (OR logic across multiple fields) - fallback
    if (filter.search) {
      andConditions.push({
        OR: [
          { clientName: { contains: filter.search, mode: 'insensitive' } },
          { clientNameEn: { contains: filter.search, mode: 'insensitive' } },
          { email: { contains: filter.search, mode: 'insensitive' } },
          { tel: { contains: filter.search, mode: 'insensitive' } },
          { companyName: { contains: filter.search, mode: 'insensitive' } },
        ],
      });
    }

    // Apply AND conditions
    if (andConditions.length > 0) {
      where.AND = andConditions;
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
