import { Injectable } from '@nestjs/common';
import { Prisma, Staff } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import type { IPaginated } from '@common/interfaces/repository.interface';
import type { StaffFilterDto } from './dto/staff-filter.dto';

export type StaffWithUpdater = Prisma.StaffGetPayload<{ include: { updatedBy: true } }>;

@Injectable()
export class StaffRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: number): Promise<Staff | null> {
    return this.prisma.staff.findUnique({
      where: { staffId: id, deletedAt: null },
    });
  }

  async findByMail(mail: string): Promise<Staff | null> {
    return this.prisma.staff.findUnique({
      where: { mail, deletedAt: null },
    });
  }

  async findAll(filter: StaffFilterDto): Promise<IPaginated<StaffWithUpdater>> {
    const where: Prisma.StaffWhereInput = {
      deletedAt: null,
    };

    if (filter.dataStatus !== undefined) {
      where.dataStatus = filter.dataStatus;
    }

    if (filter.staffType !== undefined) {
      where.staffType = filter.staffType;
    }

    if (filter.search) {
      where.OR = [
        { staffName: { contains: filter.search, mode: 'insensitive' } },
        { staffNameEn: { contains: filter.search, mode: 'insensitive' } },
        { mail: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.StaffOrderByWithRelationInput = filter.orderBy
      ? { [filter.orderBy]: filter.order }
      : { staffId: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.staff.findMany({
        where,
        orderBy,
        skip: filter.skip,
        take: filter.limit,
        include: { updatedBy: true },
      }),
      this.prisma.staff.count({ where }),
    ]);

    return {
      items: data,
      meta: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  async create(data: Prisma.StaffCreateInput): Promise<Staff> {
    return this.prisma.staff.create({ data });
  }

  async update(id: number, data: Prisma.StaffUpdateInput): Promise<Staff> {
    return this.prisma.staff.update({
      where: { staffId: id },
      data,
    });
  }

  async softDelete(id: number, deletedStaffId: number): Promise<Staff> {
    return this.prisma.staff.update({
      where: { staffId: id },
      data: {
        deletedAt: new Date(),
        deletedBy: { connect: { staffId: deletedStaffId } },
      },
    });
  }
}
