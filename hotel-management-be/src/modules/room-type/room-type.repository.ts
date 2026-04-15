import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { RoomTypeFilterDto } from './dto';

@Injectable()
export class RoomTypeRepository {
  constructor(private readonly prisma: PrismaService) { }

  private readonly includeRelations = {
    roomClass: true,
  } as const;

  async findAll(filter: RoomTypeFilterDto) {
    const where: Prisma.RoomTypeWhereInput = { deletedAt: null };

    if (filter.dataStatus !== undefined) where.dataStatus = filter.dataStatus;
    if (filter.roomClassId !== undefined) where.roomClassId = filter.roomClassId;
    if (filter.facilityId !== undefined) {
      where.facilityRoomTypes = {
        some: {
          facilityId: filter.facilityId,
          deletedAt: null,
          dataStatus: 1,
        },
      };
    }

    if (filter.search) {
      where.OR = [
        { roomTypeName: { contains: filter.search, mode: 'insensitive' } },
        { roomTypeNameShort: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.RoomTypeOrderByWithRelationInput =
      filter.orderBy ? { [filter.orderBy]: filter.order } : { orderNum: 'asc' };

    const [data, total] = await Promise.all([
      this.prisma.roomType.findMany({
        where,
        include: this.includeRelations,
        orderBy,
        skip: filter.skip,
        take: filter.limit,
      }),
      this.prisma.roomType.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: number) {
    return this.prisma.roomType.findFirst({
      where: { roomTypeId: id, deletedAt: null },
      include: this.includeRelations,
    });
  }

  async findByName(name: string, roomClassId: number, excludeId?: number) {
    return this.prisma.roomType.findFirst({
      where: {
        roomTypeName: name,
        roomClassId,
        deletedAt: null,
        ...(excludeId !== undefined && { NOT: { roomTypeId: excludeId } }),
      },
    });
  }

  async create(data: Prisma.RoomTypeCreateInput) {
    return this.prisma.roomType.create({ data, include: this.includeRelations });
  }

  async update(id: number, data: Prisma.RoomTypeUpdateInput) {
    return this.prisma.roomType.update({
      where: { roomTypeId: id },
      data,
      include: this.includeRelations,
    });
  }

  async softDelete(id: number, staffId: number) {
    return this.prisma.roomType.update({
      where: { roomTypeId: id },
      data: {
        deletedAt: new Date(),
        deletedBy: { connect: { staffId } },
      },
    });
  }
}
