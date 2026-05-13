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
    room: { include: { facility: true, roomType: { include: { roomClass: true } } } },
    stayType: true,
    chargeStaff: true,
    chargeStaff2: true,
    checkinReceptionist: true,
    checkoutReceptionist: true,
    confirmStaff: true,
    createdBy: true,
    updatedBy: true,
  } as const;

  async findAll(filter: ReservationFilterDto) {
    const where: Prisma.ReserveWhereInput = { deletedAt: null };
    const andConditions: Prisma.ReserveWhereInput[] = [];

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
    if (filter.createdStaffId !== undefined) where.createdStaffId = filter.createdStaffId;
    if (filter.updatedStaffId !== undefined) where.updatedStaffId = filter.updatedStaffId;

    if (filter.periodFrom) {
      andConditions.push({
        periodTo: { gte: new Date(filter.periodFrom) },
      });
    }

    if (filter.periodTo) {
      andConditions.push({
        periodFrom: { lte: new Date(filter.periodTo) },
      });
    }

    if (filter.search) {
      andConditions.push({
        OR: [
          { note: { contains: filter.search, mode: 'insensitive' } },
          { client: { is: { clientName: { contains: filter.search, mode: 'insensitive' } } } },
          { client: { is: { clientNameEn: { contains: filter.search, mode: 'insensitive' } } } },
          { client: { is: { companyName: { contains: filter.search, mode: 'insensitive' } } } },
          { client: { is: { companyNameEn: { contains: filter.search, mode: 'insensitive' } } } },
        ],
      });
    }

    if (filter.clientName) {
      andConditions.push({
        OR: [
          { client: { is: { clientName: { contains: filter.clientName, mode: 'insensitive' } } } },
          { client: { is: { clientNameEn: { contains: filter.clientName, mode: 'insensitive' } } } },
          { client: { is: { companyName: { contains: filter.clientName, mode: 'insensitive' } } } },
          { client: { is: { companyNameEn: { contains: filter.clientName, mode: 'insensitive' } } } },
        ],
      });
    }

    if (filter.occupierName) {
      andConditions.push({
        reserveOccupiers: {
          some: {
            deletedAt: null,
            OR: [
              { occupierName: { contains: filter.occupierName, mode: 'insensitive' } },
            ],
          },
        },
      });
    }

    if (filter.chargeStaffName) {
      andConditions.push({
        OR: [
          { chargeStaff: { is: { staffName: { contains: filter.chargeStaffName, mode: 'insensitive' } } } },
          { chargeStaff2: { is: { staffName: { contains: filter.chargeStaffName, mode: 'insensitive' } } } },
        ],
      });
    }

    if (filter.facilityOrRoom) {
      const facilityOrRoomKeyword = filter.facilityOrRoom.trim();
      const facilityOrRoomConditions: Prisma.ReserveWhereInput[] = [
        {
          facility: {
            is: {
              facilityNo: { contains: facilityOrRoomKeyword, mode: 'insensitive' },
            },
          },
        },
        {
          facility: {
            is: {
              facilityName: { contains: facilityOrRoomKeyword, mode: 'insensitive' },
            },
          },
        },
        {
          room: {
            is: {
              roomNumber: { contains: facilityOrRoomKeyword, mode: 'insensitive' },
            },
          },
        },
      ];

      // Support combined keyword format: facilityNo-roomNumber.
      const combinedDelimiterIndex = facilityOrRoomKeyword.lastIndexOf('-');
      const hasCombinedFormat =
        combinedDelimiterIndex > 0 &&
        combinedDelimiterIndex < facilityOrRoomKeyword.length - 1;

      if (hasCombinedFormat) {
        const facilityNoKeyword = facilityOrRoomKeyword
          .slice(0, combinedDelimiterIndex)
          .trim();
        const roomNumberKeyword = facilityOrRoomKeyword
          .slice(combinedDelimiterIndex + 1)
          .trim();

        if (facilityNoKeyword && roomNumberKeyword) {
          facilityOrRoomConditions.push({
            AND: [
              {
                facility: {
                  is: {
                    facilityNo: {
                      contains: facilityNoKeyword,
                      mode: 'insensitive',
                    },
                  },
                },
              },
              {
                room: {
                  is: {
                    roomNumber: {
                      contains: roomNumberKeyword,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            ],
          });
        }
      }

      andConditions.push({
        OR: facilityOrRoomConditions,
      });
    }

    if (filter.telPhone) {
      andConditions.push({
        OR: [
          { client: { is: { tel: { contains: filter.telPhone, mode: 'insensitive' } } } },
          { client: { is: { telPhone: { contains: filter.telPhone, mode: 'insensitive' } } } },
          { client: { is: { companyTel: { contains: filter.telPhone, mode: 'insensitive' } } } },
          {
            reserveOccupiers: {
              some: {
                deletedAt: null,
                tel: { contains: filter.telPhone, mode: 'insensitive' },
              },
            },
          },
        ],
      });
    }

    if (filter.roomTypeId !== undefined) {
      andConditions.push({ room: { is: { roomTypeId: filter.roomTypeId } } });
    }

    if (filter.clientTypes?.length) {
      const clientTypes = Array.from(new Set(filter.clientTypes)).filter((type) => type >= 1 && type <= 3);
      if (clientTypes.length === 1) {
        andConditions.push({ client: { is: { dataType: clientTypes[0] } } });
      } else if (clientTypes.length > 1) {
        andConditions.push({ client: { is: { dataType: { in: clientTypes } } } });
      }
    }

    if (filter.ugFlag !== undefined) {
      andConditions.push({ client: { is: { ugFlag: filter.ugFlag } } });
    }

    if (filter.confirmFlags?.length === 1) {
      where.confirmFlag = filter.confirmFlags[0];
    }

    if (filter.deleteStatuses?.length) {
      const deleteStatuses = Array.from(new Set(filter.deleteStatuses)).filter((status) => status >= 1 && status <= 3);
      if (deleteStatuses.length === 1) {
        where.deleteStatus = deleteStatuses[0];
      } else if (deleteStatuses.length > 1) {
        where.deleteStatus = { in: deleteStatuses };
      }
    }

    if (filter.requestSaleTypes?.length) {
      const requestSaleTypes = new Set(filter.requestSaleTypes);
      const saleConditions: Prisma.ReserveWhereInput[] = [];

      if (requestSaleTypes.has(0)) {
        saleConditions.push({
          OR: [{ requestAnnouncement: null }, { requestAnnouncement: '' }],
        });
      }

      if (requestSaleTypes.has(1)) {
        saleConditions.push({
          OR: [{ saleAnnouncement: null }, { saleAnnouncement: '' }],
        });
      }

      if (requestSaleTypes.has(2)) {
        saleConditions.push({
          OR: [
            {
              AND: [
                { requestAnnouncement: { not: null } },
                { requestAnnouncement: { not: '' } },
                { OR: [{ saleAnnouncement: null }, { saleAnnouncement: '' }] },
              ],
            },
            {
              AND: [
                { saleAnnouncement: { not: null } },
                { saleAnnouncement: { not: '' } },
                { OR: [{ requestAnnouncement: null }, { requestAnnouncement: '' }] },
              ],
            },
          ],
        });
      }

      if (saleConditions.length > 0) {
        andConditions.push({ OR: saleConditions });
      }
    }

    if (filter.leavingType) {
      const now = new Date();

      if (filter.leavingType === 'before') {
        andConditions.push({ periodFrom: { gt: now } });
      }

      if (filter.leavingType === 'staying') {
        andConditions.push({ periodFrom: { lte: now } });
        andConditions.push({ OR: [{ periodTo: { gte: now } }, { periodTo: null }] });
        andConditions.push({ cancelledAt: null });
      }

      if (filter.leavingType === 'left') {
        andConditions.push({ OR: [{ checkoutAt: { not: null } }, { periodTo: { lt: now } }] });
      }
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const secondaryOrderBy: Prisma.ReserveOrderByWithRelationInput =
      filter.orderBy ? { [filter.orderBy]: filter.order } : { reserveId: 'desc' };

    const orderBy: Prisma.ReserveOrderByWithRelationInput[] = [
      { cancelledAt: { sort: 'asc', nulls: 'first' } },
      secondaryOrderBy,
    ];

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

  getIncludeRelations() {
    return this.includeRelations;
  }
}
