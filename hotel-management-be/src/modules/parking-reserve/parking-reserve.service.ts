import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ParkingReserveRepository } from './parking-reserve.repository';
import {
  CreateParkingReserveDto,
  UpdateParkingReserveDto,
  CreateBicycleParkingReserveDto,
  UpdateBicycleParkingReserveDto,
} from './dto';

@Injectable()
export class ParkingReserveService {
  constructor(private readonly repository: ParkingReserveRepository) {}

  // ─── Car Parking Reserve ─────────────────────────────

  async createParkingReserve(dto: CreateParkingReserveDto, staffId: number) {
    const { periodFrom, periodTo } = this.parseParkingPeriod(dto.periodFrom, dto.periodTo);
    await this.ensureNoParkingReserveOverlap(dto.parkingId, periodFrom, periodTo);

    return this.repository.createParkingReserve(dto, staffId);
  }

  async updateParkingReserve(id: number, dto: UpdateParkingReserveDto, staffId: number) {
    const existing = await this.repository.findParkingReserveById(id);
    if (!existing) {
      throw new NotFoundException(`Parking reserve #${id} not found`);
    }

    const parkingId = dto.parkingId ?? existing.parkingId;
    const periodFrom = dto.periodFrom ? new Date(dto.periodFrom) : existing.periodFrom;
    const periodTo =
      dto.periodTo !== undefined ? (dto.periodTo ? new Date(dto.periodTo) : null) : existing.periodTo;
    const parkingChanged = dto.parkingId !== undefined && dto.parkingId !== existing.parkingId;
    const periodChanged = dto.periodFrom !== undefined || dto.periodTo !== undefined;

    if (parkingChanged || periodChanged) {
      this.validateParkingPeriod(periodFrom, periodTo);
      await this.ensureNoParkingReserveOverlap(parkingId, periodFrom, periodTo, id);
    }

    return this.repository.updateParkingReserve(id, dto, staffId);
  }

  async deleteParkingReserve(id: number, staffId: number) {
    const existing = await this.repository.findParkingReserveById(id);
    if (!existing) {
      throw new NotFoundException(`Parking reserve #${id} not found`);
    }
    return this.repository.softDeleteParkingReserve(id, staffId);
  }

  async checkinParkingReserve(id: number, staffId: number) {
    const existing = await this.repository.findParkingReserveById(id);
    if (!existing) {
      throw new NotFoundException(`Parking reserve #${id} not found`);
    }
    return this.repository.updateParkingReserve(
      id,
      { checkinFlag: !existing.checkinFlag } as UpdateParkingReserveDto,
      staffId,
    );
  }

  async checkoutParkingReserve(id: number, staffId: number) {
    const existing = await this.repository.findParkingReserveById(id);
    if (!existing) {
      throw new NotFoundException(`Parking reserve #${id} not found`);
    }
    return this.repository.updateParkingReserve(
      id,
      { checkoutFlag: !existing.checkoutFlag } as UpdateParkingReserveDto,
      staffId,
    );
  }

  // ─── Bicycle Parking Reserve ─────────────────────────

  async createBicycleParkingReserve(dto: CreateBicycleParkingReserveDto, staffId: number) {
    const { periodFrom, periodTo } = this.parseParkingPeriod(dto.periodFrom, dto.periodTo);
    await this.ensureNoBicycleParkingReserveOverlap(dto.bicycleParkingId, periodFrom, periodTo);

    return this.repository.createBicycleParkingReserve(dto, staffId);
  }

  async updateBicycleParkingReserve(id: number, dto: UpdateBicycleParkingReserveDto, staffId: number) {
    const existing = await this.repository.findBicycleParkingReserveById(id);
    if (!existing) {
      throw new NotFoundException(`Bicycle parking reserve #${id} not found`);
    }

    const bicycleParkingId = dto.bicycleParkingId ?? existing.bicycleParkingId;
    const periodFrom = dto.periodFrom ? new Date(dto.periodFrom) : existing.periodFrom;
    const periodTo =
      dto.periodTo !== undefined ? (dto.periodTo ? new Date(dto.periodTo) : null) : existing.periodTo;
    const parkingChanged =
      dto.bicycleParkingId !== undefined && dto.bicycleParkingId !== existing.bicycleParkingId;
    const periodChanged = dto.periodFrom !== undefined || dto.periodTo !== undefined;

    if (parkingChanged || periodChanged) {
      this.validateParkingPeriod(periodFrom, periodTo);
      await this.ensureNoBicycleParkingReserveOverlap(
        bicycleParkingId,
        periodFrom,
        periodTo,
        id,
      );
    }

    return this.repository.updateBicycleParkingReserve(id, dto, staffId);
  }

  async deleteBicycleParkingReserve(id: number, staffId: number) {
    const existing = await this.repository.findBicycleParkingReserveById(id);
    if (!existing) {
      throw new NotFoundException(`Bicycle parking reserve #${id} not found`);
    }
    return this.repository.softDeleteBicycleParkingReserve(id, staffId);
  }

  async checkinBicycleParkingReserve(id: number, staffId: number) {
    const existing = await this.repository.findBicycleParkingReserveById(id);
    if (!existing) {
      throw new NotFoundException(`Bicycle parking reserve #${id} not found`);
    }
    return this.repository.updateBicycleParkingReserve(
      id,
      { checkinFlag: !existing.checkinFlag } as UpdateBicycleParkingReserveDto,
      staffId,
    );
  }

  async checkoutBicycleParkingReserve(id: number, staffId: number) {
    const existing = await this.repository.findBicycleParkingReserveById(id);
    if (!existing) {
      throw new NotFoundException(`Bicycle parking reserve #${id} not found`);
    }
    return this.repository.updateBicycleParkingReserve(
      id,
      { checkoutFlag: !existing.checkoutFlag } as UpdateBicycleParkingReserveDto,
      staffId,
    );
  }

  private parseParkingPeriod(
    periodFromValue: string,
    periodToValue?: string,
  ): { periodFrom: Date; periodTo: Date | null } {
    const periodFrom = new Date(periodFromValue);
    const periodTo = periodToValue ? new Date(periodToValue) : null;

    this.validateParkingPeriod(periodFrom, periodTo);

    return { periodFrom, periodTo };
  }

  private validateParkingPeriod(periodFrom: Date, periodTo: Date | null): void {
    if (Number.isNaN(periodFrom.getTime()) || (periodTo && Number.isNaN(periodTo.getTime()))) {
      throw new BadRequestException('Parking period must be a valid date');
    }

    if (periodTo && periodTo < periodFrom) {
      throw new BadRequestException('Parking period to must be after or equal to period from');
    }
  }

  private async ensureNoParkingReserveOverlap(
    parkingId: number,
    periodFrom: Date,
    periodTo: Date | null,
    excludeParkingReserveId?: number,
  ): Promise<void> {
    const hasOverlap = await this.repository.hasParkingReserveOverlap(
      parkingId,
      periodFrom,
      periodTo,
      excludeParkingReserveId,
    );

    if (hasOverlap) {
      throw new ConflictException('Parking reserve overlaps existing reservation');
    }
  }

  private async ensureNoBicycleParkingReserveOverlap(
    bicycleParkingId: number,
    periodFrom: Date,
    periodTo: Date | null,
    excludeBicycleParkingReserveId?: number,
  ): Promise<void> {
    const hasOverlap = await this.repository.hasBicycleParkingReserveOverlap(
      bicycleParkingId,
      periodFrom,
      periodTo,
      excludeBicycleParkingReserveId,
    );

    if (hasOverlap) {
      throw new ConflictException('Bicycle parking reserve overlaps existing reservation');
    }
  }
}
