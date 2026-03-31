import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { ParkingFilterDto, CreateParkingDto, UpdateParkingDto } from './dto';

@Injectable()
export class ParkingRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(filter: ParkingFilterDto) {
    return this.prisma.parking.findMany({
      where: {
        deletedAt: null,
        ...(filter.facilityId && { parentFacilityId: filter.facilityId }),
      },
      include: {
        parkingRents: {
          where: { deletedAt: null },
          orderBy: { stayTypeId: 'asc' },
        },
        updatedBy: { select: { staffName: true } },
      },
      orderBy: { orderNum: 'asc' },
    });
  }

  async findById(id: number) {
    return this.prisma.parking.findFirst({
      where: { parkingId: id, deletedAt: null },
      include: {
        parkingRents: {
          where: { deletedAt: null },
          orderBy: { stayTypeId: 'asc' },
        },
        updatedBy: { select: { staffName: true } },
      },
    });
  }

  async findByNumber(facilityId: number, number: string, excludeId?: number) {
    return this.prisma.parking.findFirst({
      where: {
        parentFacilityId: facilityId,
        number,
        deletedAt: null,
        ...(excludeId !== undefined && { NOT: { parkingId: excludeId } }),
      },
    });
  }

  async create(dto: CreateParkingDto, staffId: number) {
    return this.prisma.$transaction(async (tx) => {
      const parking = await tx.parking.create({
        data: {
          parentFacilityId: dto.parentFacilityId,
          number: dto.number,
          heightLimit: dto.heightLimit,
          notice: dto.notice ?? null,
          orderNum: dto.orderNum ?? 99,
          createdStaffId: staffId,
          updatedStaffId: staffId,
        },
      });

      if (dto.parkingRents?.length) {
        await tx.parkingRent.createMany({
          data: dto.parkingRents.map((rent) => ({
            parkingId: parking.parkingId,
            facilityId: dto.parentFacilityId,
            stayTypeId: rent.stayTypeId,
            rent: rent.rent,
            createdStaffId: staffId,
            updatedStaffId: staffId,
          })),
        });
      }

      return tx.parking.findUniqueOrThrow({
        where: { parkingId: parking.parkingId },
        include: {
          parkingRents: {
            where: { deletedAt: null },
            orderBy: { stayTypeId: 'asc' },
          },
          updatedBy: { select: { staffName: true } },
        },
      });
    });
  }

  async update(id: number, dto: UpdateParkingDto, staffId: number) {
    return this.prisma.$transaction(async (tx) => {
      await tx.parking.update({
        where: { parkingId: id },
        data: {
          ...(dto.parentFacilityId !== undefined && { parentFacilityId: dto.parentFacilityId }),
          ...(dto.number !== undefined && dto.number !== null && { number: dto.number }),
          ...(dto.heightLimit !== undefined && { heightLimit: dto.heightLimit }),
          ...(dto.notice !== undefined && { notice: dto.notice }),
          ...(dto.orderNum !== undefined && { orderNum: dto.orderNum }),
          ...(dto.dataStatus !== undefined && { dataStatus: dto.dataStatus }),
          updatedStaffId: staffId,
        },
      });

      if (dto.parkingRents?.length) {
        // Soft delete old rents
        await tx.parkingRent.updateMany({
          where: { parkingId: id, deletedAt: null },
          data: { deletedAt: new Date(), deletedStaffId: staffId },
        });

        // Create new rents
        const facilityId = dto.parentFacilityId ??
          (await tx.parking.findUniqueOrThrow({ where: { parkingId: id } })).parentFacilityId;

        await tx.parkingRent.createMany({
          data: dto.parkingRents.map((rent) => ({
            parkingId: id,
            facilityId,
            stayTypeId: rent.stayTypeId,
            rent: rent.rent,
            createdStaffId: staffId,
            updatedStaffId: staffId,
          })),
        });
      }

      return tx.parking.findUniqueOrThrow({
        where: { parkingId: id },
        include: {
          parkingRents: {
            where: { deletedAt: null },
            orderBy: { stayTypeId: 'asc' },
          },
          updatedBy: { select: { staffName: true } },
        },
      });
    });
  }

  async updateOrder(ids: number[], staffId: number) {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.parking.update({
          where: { parkingId: id },
          data: {
            orderNum: index + 1,
            updatedStaffId: staffId,
          },
        }),
      ),
    );
  }
}
