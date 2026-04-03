import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { ReservationFilterDto } from './dto';

@Injectable()
export class ReservationRepository {
  constructor(private readonly prisma: PrismaService) { }

  private readonly includeRelations = {
    client: { include: { country: true } },
    facility: true,
    room: { include: { roomType: { include: { roomClass: true } } } },
    stayType: true,
    chargeStaff: true,
    chargeStaff2: true,
    checkinReceptionist: true,
    checkoutReceptionist: true,
    confirmStaff: true,
  } as const;

  async findAll(filter: ReservationFilterDto) {
    const where: Prisma.ReserveWhereInput = { deletedAt: null };

    if (filter.dataStatus !== undefined) where.dataStatus = filter.dataStatus;
    if (filter.reserveStatus !== undefined) where.reserveStatus = filter.reserveStatus;
    if (filter.deleteStatus !== undefined) where.deleteStatus = filter.deleteStatus;
    if (filter.clientId !== undefined) where.clientId = filter.clientId;
    if (filter.facilityId !== undefined) where.facilityId = filter.facilityId;
    if (filter.roomId !== undefined) where.roomId = filter.roomId;
    if (filter.stayTypeId !== undefined) where.stayTypeId = filter.stayTypeId;
    if (filter.chargeStaffId !== undefined) where.chargeStaffId = filter.chargeStaffId;
    if (filter.checkinFlag !== undefined) where.checkinFlag = filter.checkinFlag;
    if (filter.confirmFlag !== undefined) where.confirmFlag = filter.confirmFlag;
    if (filter.draftFlag !== undefined) where.draftFlag = filter.draftFlag;

    if (filter.periodFrom || filter.periodTo) {
      where.AND = [];
      if (filter.periodFrom) {
        (where.AND as Prisma.ReserveWhereInput[]).push({
          periodTo: { gte: new Date(filter.periodFrom) },
        });
      }
      if (filter.periodTo) {
        (where.AND as Prisma.ReserveWhereInput[]).push({
          periodFrom: { lte: new Date(filter.periodTo) },
        });
      }
    }

    if (filter.search) {
      where.OR = [
        { note: { contains: filter.search, mode: 'insensitive' } },
        { client: { clientName: { contains: filter.search, mode: 'insensitive' } } },
        { client: { clientNameEn: { contains: filter.search, mode: 'insensitive' } } },
      ];
    }

    const orderBy: Prisma.ReserveOrderByWithRelationInput =
      filter.orderBy ? { [filter.orderBy]: filter.order } : { reserveId: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.reserve.findMany({
        where,
        include: this.includeRelations,
        orderBy,
        skip: filter.skip,
        take: filter.limit,
      }),
      this.prisma.reserve.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: number) {
    return this.prisma.reserve.findFirst({
      where: { reserveId: id, deletedAt: null },
      include: {
        ...this.includeRelations,
        reserveOccupiers: {
          where: { deletedAt: null },
          orderBy: { orderNum: 'asc' },
        },
        usageStatuses: {
          where: { deletedAt: null },
        },
      },
    });
  }

  async create(data: Prisma.ReserveCreateInput) {
    return this.prisma.reserve.create({ data, include: this.includeRelations });
  }

  async update(id: number, data: Prisma.ReserveUpdateInput) {
    return this.prisma.reserve.update({
      where: { reserveId: id },
      data,
      include: this.includeRelations,
    });
  }

  async softDelete(id: number, staffId: number) {
    return this.prisma.reserve.update({
      where: { reserveId: id },
      data: {
        deletedAt: new Date(),
        deletedBy: { connect: { staffId } },
      },
    });
  }

  async checkOverlap(
    roomId: number,
    periodFrom: Date,
    periodTo: Date,
    excludeReserveId?: number,
  ): Promise<boolean> {
    const overlapping = await this.prisma.reserve.findFirst({
      where: {
        roomId,
        deletedAt: null,
        deleteStatus: null, // Only non-cancelled/deleted
        periodFrom: { lt: periodTo },
        periodTo: { gt: periodFrom },
        ...(excludeReserveId !== undefined && { NOT: { reserveId: excludeReserveId } }),
      },
    });
    return !!overlapping;
  }

  // ─── UsageStatus methods ──────────────────────────

  async createUsageStatus(data: Prisma.UsageStatusCreateInput) {
    return this.prisma.usageStatus.create({ data });
  }

  async updateUsageStatusByReserveId(
    reserveId: number,
    data: Prisma.UsageStatusUpdateInput,
  ) {
    return this.prisma.usageStatus.updateMany({
      where: { reserveId, deletedAt: null },
      data,
    });
  }

  async softDeleteUsageStatusByReserveId(reserveId: number, staffId: number) {
    return this.prisma.usageStatus.updateMany({
      where: { reserveId, deletedAt: null },
      data: {
        deletedAt: new Date(),
        deletedStaffId: staffId,
      },
    });
  }
}
