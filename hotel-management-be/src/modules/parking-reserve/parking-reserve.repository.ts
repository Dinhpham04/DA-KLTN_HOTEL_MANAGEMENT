import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import {
  CreateParkingReserveDto,
  UpdateParkingReserveDto,
  CreateBicycleParkingReserveDto,
  UpdateBicycleParkingReserveDto,
} from './dto';

@Injectable()
export class ParkingReserveRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Car Parking Reserve ─────────────────────────────

  async createParkingReserve(dto: CreateParkingReserveDto, staffId: number) {
    return this.prisma.parkingReserve.create({
      data: {
        parkingId: dto.parkingId,
        reserveId: dto.reserveId ?? null,
        clientId: dto.clientId ?? null,
        periodFrom: new Date(dto.periodFrom),
        periodTo: dto.periodTo ? new Date(dto.periodTo) : null,
        stayTypeId: dto.stayTypeId ?? null,
        confirmFlag: dto.confirmFlag ?? false,
        carType: dto.carType ?? null,
        licensePlate: dto.licensePlate ?? null,
        note: dto.note ?? null,
        saleDate: dto.saleDate ? new Date(dto.saleDate) : null,
        createdStaffId: staffId,
      },
      include: {
        client: { select: { clientName: true, dataType: true } },
        reserve: {
          select: {
            chargeStaffId: true,
            periodFrom: true,
            periodTo: true,
            facility: { select: { facilityNo: true } },
            room: { select: { roomNumber: true } },
          },
        },
      },
    });
  }

  async updateParkingReserve(id: number, dto: UpdateParkingReserveDto, staffId: number) {
    return this.prisma.parkingReserve.update({
      where: { parkingReserveId: id },
      data: {
        ...(dto.parkingId !== undefined && { parkingId: dto.parkingId }),
        ...(dto.reserveId !== undefined && { reserveId: dto.reserveId ?? null }),
        ...(dto.clientId !== undefined && { clientId: dto.clientId ?? null }),
        ...(dto.periodFrom !== undefined && { periodFrom: new Date(dto.periodFrom) }),
        ...(dto.periodTo !== undefined && { periodTo: dto.periodTo ? new Date(dto.periodTo) : null }),
        ...(dto.stayTypeId !== undefined && { stayTypeId: dto.stayTypeId ?? null }),
        ...(dto.confirmFlag !== undefined && { confirmFlag: dto.confirmFlag }),
        ...(dto.checkinFlag !== undefined && { checkinFlag: dto.checkinFlag }),
        ...(dto.checkoutFlag !== undefined && { checkoutFlag: dto.checkoutFlag }),
        ...(dto.carType !== undefined && { carType: dto.carType ?? null }),
        ...(dto.licensePlate !== undefined && { licensePlate: dto.licensePlate ?? null }),
        ...(dto.note !== undefined && { note: dto.note ?? null }),
        ...(dto.saleDate !== undefined && { saleDate: dto.saleDate ? new Date(dto.saleDate) : null }),
        updatedStaffId: staffId,
      },
    });
  }

  async softDeleteParkingReserve(id: number, staffId: number) {
    return this.prisma.parkingReserve.update({
      where: { parkingReserveId: id },
      data: {
        deletedAt: new Date(),
        deletedStaffId: staffId,
      },
    });
  }

  async findParkingReserveById(id: number) {
    return this.prisma.parkingReserve.findFirst({
      where: { parkingReserveId: id, deletedAt: null },
    });
  }

  async hasParkingReserveOverlap(
    parkingId: number,
    periodFrom: Date,
    periodTo: Date | null,
    excludeParkingReserveId?: number,
  ): Promise<boolean> {
    const overlap = await this.prisma.parkingReserve.findFirst({
      where: {
        parkingId,
        deletedAt: null,
        dataStatus: 1,
        ...(excludeParkingReserveId !== undefined && {
          parkingReserveId: { not: excludeParkingReserveId },
        }),
        ...(periodTo && { periodFrom: { lte: periodTo } }),
        OR: [{ periodTo: null }, { periodTo: { gte: periodFrom } }],
      },
      select: { parkingReserveId: true },
    });

    return overlap !== null;
  }

  // ─── Bicycle Parking Reserve ─────────────────────────

  async createBicycleParkingReserve(dto: CreateBicycleParkingReserveDto, staffId: number) {
    return this.prisma.bicycleParkingReserve.create({
      data: {
        bicycleParkingId: dto.bicycleParkingId,
        reserveId: dto.reserveId ?? null,
        clientId: dto.clientId ?? null,
        periodFrom: new Date(dto.periodFrom),
        periodTo: dto.periodTo ? new Date(dto.periodTo) : null,
        stayTypeId: dto.stayTypeId ?? null,
        confirmFlag: dto.confirmFlag ?? false,
        bicycleTypeNote: dto.bicycleTypeNote ?? null,
        note: dto.note ?? null,
        saleDate: dto.saleDate ? new Date(dto.saleDate) : null,
        createdStaffId: staffId,
      },
      include: {
        client: { select: { clientName: true, dataType: true } },
        reserve: {
          select: {
            chargeStaffId: true,
            periodFrom: true,
            periodTo: true,
            facility: { select: { facilityNo: true } },
            room: { select: { roomNumber: true } },
          },
        },
      },
    });
  }

  async updateBicycleParkingReserve(id: number, dto: UpdateBicycleParkingReserveDto, staffId: number) {
    return this.prisma.bicycleParkingReserve.update({
      where: { bicycleParkingReserveId: id },
      data: {
        ...(dto.bicycleParkingId !== undefined && { bicycleParkingId: dto.bicycleParkingId }),
        ...(dto.reserveId !== undefined && { reserveId: dto.reserveId ?? null }),
        ...(dto.clientId !== undefined && { clientId: dto.clientId ?? null }),
        ...(dto.periodFrom !== undefined && { periodFrom: new Date(dto.periodFrom) }),
        ...(dto.periodTo !== undefined && { periodTo: dto.periodTo ? new Date(dto.periodTo) : null }),
        ...(dto.stayTypeId !== undefined && { stayTypeId: dto.stayTypeId ?? null }),
        ...(dto.confirmFlag !== undefined && { confirmFlag: dto.confirmFlag }),
        ...(dto.checkinFlag !== undefined && { checkinFlag: dto.checkinFlag }),
        ...(dto.checkoutFlag !== undefined && { checkoutFlag: dto.checkoutFlag }),
        ...(dto.bicycleTypeNote !== undefined && { bicycleTypeNote: dto.bicycleTypeNote ?? null }),
        ...(dto.note !== undefined && { note: dto.note ?? null }),
        ...(dto.saleDate !== undefined && { saleDate: dto.saleDate ? new Date(dto.saleDate) : null }),
        updatedStaffId: staffId,
      },
    });
  }

  async softDeleteBicycleParkingReserve(id: number, staffId: number) {
    return this.prisma.bicycleParkingReserve.update({
      where: { bicycleParkingReserveId: id },
      data: {
        deletedAt: new Date(),
        deletedStaffId: staffId,
      },
    });
  }

  async findBicycleParkingReserveById(id: number) {
    return this.prisma.bicycleParkingReserve.findFirst({
      where: { bicycleParkingReserveId: id, deletedAt: null },
    });
  }

  async hasBicycleParkingReserveOverlap(
    bicycleParkingId: number,
    periodFrom: Date,
    periodTo: Date | null,
    excludeBicycleParkingReserveId?: number,
  ): Promise<boolean> {
    const overlap = await this.prisma.bicycleParkingReserve.findFirst({
      where: {
        bicycleParkingId,
        deletedAt: null,
        dataStatus: 1,
        ...(excludeBicycleParkingReserveId !== undefined && {
          bicycleParkingReserveId: { not: excludeBicycleParkingReserveId },
        }),
        ...(periodTo && { periodFrom: { lte: periodTo } }),
        OR: [{ periodTo: null }, { periodTo: { gte: periodFrom } }],
      },
      select: { bicycleParkingReserveId: true },
    });

    return overlap !== null;
  }
}
