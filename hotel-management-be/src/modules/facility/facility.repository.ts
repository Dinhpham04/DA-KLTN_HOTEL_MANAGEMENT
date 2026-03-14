import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { FacilityFilterDto } from './dto';

@Injectable()
export class FacilityRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(filter: FacilityFilterDto) {
    const where: Prisma.FacilityWhereInput = { deletedAt: null };

    if (filter.dataStatus !== undefined) where.dataStatus = filter.dataStatus;
    if (filter.facilityType !== undefined) where.facilityType = filter.facilityType;

    if (filter.search) {
      where.OR = [
        { facilityName: { contains: filter.search, mode: 'insensitive' } },
        { facilityNameEn: { contains: filter.search, mode: 'insensitive' } },
        { facilityNo: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.FacilityOrderByWithRelationInput =
      filter.orderBy ? { [filter.orderBy]: filter.order } : { orderNum: 'asc' };

    const [data, total] = await Promise.all([
      this.prisma.facility.findMany({
        where,
        orderBy,
        skip: filter.skip,
        take: filter.limit,
      }),
      this.prisma.facility.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: number) {
    return this.prisma.facility.findFirst({
      where: { facilityId: id, deletedAt: null },
    });
  }

  async findByNo(facilityNo: string, excludeId?: number) {
    return this.prisma.facility.findFirst({
      where: {
        facilityNo,
        deletedAt: null,
        ...(excludeId !== undefined && { NOT: { facilityId: excludeId } }),
      },
    });
  }

  async create(data: Prisma.FacilityCreateInput) {
    return this.prisma.facility.create({ data });
  }

  async update(id: number, data: Prisma.FacilityUpdateInput) {
    return this.prisma.facility.update({
      where: { facilityId: id },
      data,
    });
  }

  async softDelete(id: number, staffId: number) {
    return this.prisma.facility.update({
      where: { facilityId: id },
      data: {
        deletedAt: new Date(),
        deletedBy: { connect: { staffId } },
      },
    });
  }
}
