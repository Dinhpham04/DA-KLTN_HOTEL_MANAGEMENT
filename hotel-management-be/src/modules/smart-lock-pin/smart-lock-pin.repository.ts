import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { SmartLockPinFilterDto } from './dto/index';

@Injectable()
export class SmartLockPinRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    room: {
      select: {
        roomId: true,
        facilityId: true,
        roomNumber: true,
      },
    },
    reserve: {
      select: {
        reserveId: true,
        reserveStatus: true,
        periodFrom: true,
        periodTo: true,
        directcheckinFlag: true,
        directcheckinType: true,
      },
    },
    updatedBy: {
      select: {
        staffName: true,
      },
    },
  } as const;

  async findAll(filter: SmartLockPinFilterDto) {
    const where: Prisma.RoomPinCredentialWhereInput = {
      deletedAt: null,
    };

    if (filter.roomId !== undefined) {
      where.roomId = filter.roomId;
    }

    if (filter.reserveId !== undefined) {
      where.reserveId = filter.reserveId;
    }

    if (filter.status !== undefined) {
      where.status = filter.status;
    }

    if (filter.dataStatus !== undefined) {
      where.dataStatus = filter.dataStatus;
    }

    if (filter.roomNumber) {
      where.room = {
        is: {
          roomNumber: {
            contains: filter.roomNumber,
            mode: 'insensitive',
          },
        },
      };
    }

    if (filter.providerCredentialId) {
      where.providerCredentialId = {
        contains: filter.providerCredentialId,
        mode: 'insensitive',
      };
    }

    if (filter.activeAt) {
      const activeAt = new Date(filter.activeAt);
      where.validFrom = { lte: activeAt };
      where.validTo = { gte: activeAt };
    }

    const orderByField = filter.orderBy ?? 'roomPinCredentialId';
    const orderBy = {
      [orderByField]: filter.order,
    } as Prisma.RoomPinCredentialOrderByWithRelationInput;

    const [data, total] = await Promise.all([
      this.prisma.roomPinCredential.findMany({
        where,
        include: this.includeRelations,
        orderBy,
        skip: filter.skip,
        take: filter.limit,
      }),
      this.prisma.roomPinCredential.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: number) {
    return this.prisma.roomPinCredential.findFirst({
      where: {
        roomPinCredentialId: id,
        deletedAt: null,
      },
      include: this.includeRelations,
    });
  }

  async findRoomById(roomId: number) {
    return this.prisma.room.findFirst({
      where: {
        roomId,
        deletedAt: null,
      },
      select: {
        roomId: true,
      },
    });
  }

  async findReserveById(reserveId: number) {
    return this.prisma.reserve.findFirst({
      where: {
        reserveId,
        deletedAt: null,
      },
      select: {
        reserveId: true,
        roomId: true,
      },
    });
  }

  async findOverlappingActiveCredential(
    roomId: number,
    validFrom: Date,
    validTo: Date,
    excludeId?: number,
  ) {
    return this.prisma.roomPinCredential.findFirst({
      where: {
        roomId,
        deletedAt: null,
        dataStatus: 1,
        status: 1,
        validFrom: { lt: validTo },
        validTo: { gt: validFrom },
        ...(excludeId !== undefined && {
          NOT: {
            roomPinCredentialId: excludeId,
          },
        }),
      },
      select: {
        roomPinCredentialId: true,
      },
    });
  }

  async create(data: Prisma.RoomPinCredentialCreateInput) {
    return this.prisma.roomPinCredential.create({
      data,
      include: this.includeRelations,
    });
  }

  async update(id: number, data: Prisma.RoomPinCredentialUpdateInput) {
    return this.prisma.roomPinCredential.update({
      where: {
        roomPinCredentialId: id,
      },
      data,
      include: this.includeRelations,
    });
  }

  async expireActivePins(now: Date, staffId: number) {
    return this.prisma.roomPinCredential.updateMany({
      where: {
        deletedAt: null,
        dataStatus: 1,
        status: 1,
        validTo: { lt: now },
      },
      data: {
        status: 3,
        expiredAt: now,
        updatedStaffId: staffId,
      },
    });
  }

  async softDelete(id: number, staffId: number) {
    return this.prisma.roomPinCredential.update({
      where: {
        roomPinCredentialId: id,
      },
      data: {
        deletedAt: new Date(),
        deletedStaffId: staffId,
        updatedStaffId: staffId,
      },
    });
  }
}
