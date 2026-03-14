import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { RoomClassFilterDto } from './dto';

@Injectable()
export class RoomClassRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(filter: RoomClassFilterDto) {
    const where: Prisma.RoomClassWhereInput = { deletedAt: null };

    if (filter.dataStatus !== undefined) where.dataStatus = filter.dataStatus;

    if (filter.search) {
      where.roomClassName = { contains: filter.search, mode: 'insensitive' };
    }

    const orderBy: Prisma.RoomClassOrderByWithRelationInput =
      filter.orderBy ? { [filter.orderBy]: filter.order } : { orderNum: 'asc' };

    const [data, total] = await Promise.all([
      this.prisma.roomClass.findMany({
        where,
        orderBy,
        skip: filter.skip,
        take: filter.limit,
      }),
      this.prisma.roomClass.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: number) {
    return this.prisma.roomClass.findFirst({
      where: { roomClassId: id, deletedAt: null },
    });
  }

  async findByName(name: string, excludeId?: number) {
    return this.prisma.roomClass.findFirst({
      where: {
        roomClassName: name,
        deletedAt: null,
        ...(excludeId !== undefined && { NOT: { roomClassId: excludeId } }),
      },
    });
  }

  async create(data: Prisma.RoomClassCreateInput) {
    return this.prisma.roomClass.create({ data });
  }

  async update(id: number, data: Prisma.RoomClassUpdateInput) {
    return this.prisma.roomClass.update({
      where: { roomClassId: id },
      data,
    });
  }

  async softDelete(id: number, staffId: number) {
    return this.prisma.roomClass.update({
      where: { roomClassId: id },
      data: {
        deletedAt: new Date(),
        deletedBy: { connect: { staffId } },
      },
    });
  }
}
