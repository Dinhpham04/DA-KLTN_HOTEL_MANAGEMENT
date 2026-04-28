import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.repository.createParkingReserve(dto, staffId);
  }

  async updateParkingReserve(id: number, dto: UpdateParkingReserveDto, staffId: number) {
    const existing = await this.repository.findParkingReserveById(id);
    if (!existing) {
      throw new NotFoundException(`Parking reserve #${id} not found`);
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
    return this.repository.createBicycleParkingReserve(dto, staffId);
  }

  async updateBicycleParkingReserve(id: number, dto: UpdateBicycleParkingReserveDto, staffId: number) {
    const existing = await this.repository.findBicycleParkingReserveById(id);
    if (!existing) {
      throw new NotFoundException(`Bicycle parking reserve #${id} not found`);
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
}
