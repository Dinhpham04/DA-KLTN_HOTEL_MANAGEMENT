import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ERROR_MESSAGES } from '@common/index';
import { ParkingRepository } from './parking.repository';
import {
  CreateParkingDto,
  UpdateParkingDto,
  ParkingFilterDto,
  ParkingResponseDto,
  UpdateParkingOrderDto,
} from './dto';

@Injectable()
export class ParkingService {
  constructor(private readonly parkingRepository: ParkingRepository) { }

  async findAll(filter: ParkingFilterDto): Promise<{ parkings: ParkingResponseDto[] }> {
    const data = await this.parkingRepository.findAll(filter);
    return {
      parkings: data.map(ParkingResponseDto.fromEntity),
    };
  }

  async create(dto: CreateParkingDto, staffId: number): Promise<ParkingResponseDto> {
    await this.ensureNumberUnique(dto.parentFacilityId, dto.number);

    const entity = await this.parkingRepository.create(dto, staffId);
    return ParkingResponseDto.fromEntity(entity);
  }

  async update(id: number, dto: UpdateParkingDto, staffId: number): Promise<ParkingResponseDto> {
    const existing = await this.parkingRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    if (dto.number !== undefined && dto.number !== null && dto.number !== existing.number) {
      await this.ensureNumberUnique(
        dto.parentFacilityId ?? existing.parentFacilityId,
        dto.number,
        id,
      );
    }

    const entity = await this.parkingRepository.update(id, dto, staffId);
    return ParkingResponseDto.fromEntity(entity);
  }

  async updateOrder(dto: UpdateParkingOrderDto, staffId: number): Promise<void> {
    await this.parkingRepository.updateOrder(dto.ids, staffId);
  }

  private async ensureNumberUnique(
    facilityId: number,
    number: string,
    excludeId?: number,
  ): Promise<void> {
    const duplicate = await this.parkingRepository.findByNumber(facilityId, number, excludeId);
    if (duplicate) {
      throw new ConflictException(`Parking number "${number}" already exists in this facility`);
    }
  }
}
