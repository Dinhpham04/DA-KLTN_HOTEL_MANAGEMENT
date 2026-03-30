import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { BicycleParkingFilterDto, CreateBicycleParkingDto, UpdateBicycleParkingDto } from './dto';

@Injectable()
export class BicycleParkingRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(filter: BicycleParkingFilterDto) {
    return this.prisma.bicycleParking.findMany({
      where: {
        deletedAt: null,
        ...(filter.facilityId && { parentFacilityId: filter.facilityId }),
      },
      include: {
        updatedBy: { select: { staffName: true } },
      },
      orderBy: { orderNum: 'asc' },
    });
  }

  async findById(id: number) {
    return this.prisma.bicycleParking.findFirst({
      where: { bicycleParkingId: id, deletedAt: null },
      include: {
        updatedBy: { select: { staffName: true } },
      },
    });
  }

  async findByNumber(facilityId: number, number: string, excludeId?: number) {
    return this.prisma.bicycleParking.findFirst({
      where: {
        parentFacilityId: facilityId,
        number,
        deletedAt: null,
        ...(excludeId !== undefined && { NOT: { bicycleParkingId: excludeId } }),
      },
    });
  }

  async create(dto: CreateBicycleParkingDto, staffId: number) {
    return this.prisma.bicycleParking.create({
      data: {
        parentFacilityId: dto.parentFacilityId,
        number: dto.number,
        notice: dto.notice ?? null,
        orderNum: dto.orderNum ?? 99,
        createdStaffId: staffId,
        updatedStaffId: staffId,
      },
      include: {
        updatedBy: { select: { staffName: true } },
      },
    });
  }

  async update(id: number, dto: UpdateBicycleParkingDto, staffId: number) {
    return this.prisma.bicycleParking.update({
      where: { bicycleParkingId: id },
      data: {
        ...(dto.parentFacilityId !== undefined && { parentFacilityId: dto.parentFacilityId }),
        ...(dto.number !== undefined && dto.number !== null && { number: dto.number }),
        ...(dto.notice !== undefined && { notice: dto.notice }),
        ...(dto.orderNum !== undefined && { orderNum: dto.orderNum }),
        ...(dto.dataStatus !== undefined && { dataStatus: dto.dataStatus }),
        updatedStaffId: staffId,
      },
      include: {
        updatedBy: { select: { staffName: true } },
      },
    });
  }

  async updateOrder(ids: number[], staffId: number) {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.bicycleParking.update({
          where: { bicycleParkingId: id },
          data: {
            orderNum: index + 1,
            updatedStaffId: staffId,
          },
        }),
      ),
    );
  }
}
