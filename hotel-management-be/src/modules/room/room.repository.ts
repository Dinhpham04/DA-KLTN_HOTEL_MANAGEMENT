import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { RoomFilterDto } from './dto';

@Injectable()
export class RoomRepository {
  constructor(private readonly prisma: PrismaService) { }

  private readonly includeRelations = {
    facility: true,
    roomType: { include: { roomClass: true } },
  } as const;

  async findAll(filter: RoomFilterDto) {
    const where: Prisma.RoomWhereInput = { deletedAt: null };

    if (filter.dataStatus !== undefined) where.dataStatus = filter.dataStatus;
    if (filter.facilityId !== undefined) where.facilityId = filter.facilityId;
    if (filter.roomTypeId !== undefined) where.roomTypeId = filter.roomTypeId;
    if (filter.roomStatus !== undefined) where.roomStatus = filter.roomStatus;

    if (filter.roomClassId !== undefined) {
      where.roomType = { roomClassId: filter.roomClassId, deletedAt: null };
    }

    if (filter.search) {
      where.roomNumber = { contains: filter.search, mode: 'insensitive' };
    }

    const orderBy: Prisma.RoomOrderByWithRelationInput =
      filter.orderBy ? { [filter.orderBy]: filter.order } : { orderNum: 'asc' };

    const [data, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        include: this.includeRelations,
        orderBy,
        skip: filter.skip,
        take: filter.limit,
      }),
      this.prisma.room.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: number) {
    return this.prisma.room.findFirst({
      where: { roomId: id, deletedAt: null },
      include: this.includeRelations,
    });
  }

  async findByRoomNumber(roomNumber: string, facilityId: number, excludeId?: number) {
    return this.prisma.room.findFirst({
      where: {
        roomNumber,
        facilityId,
        deletedAt: null,
        ...(excludeId !== undefined && { NOT: { roomId: excludeId } }),
      },
    });
  }

  async create(data: Prisma.RoomCreateInput) {
    return this.prisma.room.create({ data, include: this.includeRelations });
  }

  async update(id: number, data: Prisma.RoomUpdateInput) {
    return this.prisma.room.update({
      where: { roomId: id },
      data,
      include: this.includeRelations,
    });
  }

  async softDelete(id: number, staffId: number) {
    return this.prisma.room.update({
      where: { roomId: id },
      data: {
        deletedAt: new Date(),
        deletedBy: { connect: { staffId } },
      },
    });
  }
}
