import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ERROR_MESSAGES } from '@common/index';
import { BicycleParkingRepository } from './bicycle-parking.repository';
import {
  CreateBicycleParkingDto,
  UpdateBicycleParkingDto,
  BicycleParkingFilterDto,
  BicycleParkingResponseDto,
  UpdateBicycleParkingOrderDto,
} from './dto';

@Injectable()
export class BicycleParkingService {
  constructor(private readonly bicycleParkingRepository: BicycleParkingRepository) { }

  async findAll(filter: BicycleParkingFilterDto): Promise<{ bicycleParkings: BicycleParkingResponseDto[] }> {
    const data = await this.bicycleParkingRepository.findAll(filter);
    return {
      bicycleParkings: data.map(BicycleParkingResponseDto.fromEntity),
    };
  }

  async create(dto: CreateBicycleParkingDto, staffId: number): Promise<BicycleParkingResponseDto> {
    if (dto.number) {
      await this.ensureNumberUnique(dto.parentFacilityId, dto.number);
    }

    const entity = await this.bicycleParkingRepository.create(dto, staffId);
    return BicycleParkingResponseDto.fromEntity(entity);
  }

  async update(id: number, dto: UpdateBicycleParkingDto, staffId: number): Promise<BicycleParkingResponseDto> {
    const existing = await this.bicycleParkingRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    if (dto.number !== undefined && dto.number !== null && dto.number !== existing.number) {
      await this.ensureNumberUnique(
        dto.parentFacilityId ?? existing.parentFacilityId,
        dto.number,
        id,
      );
    }

    const entity = await this.bicycleParkingRepository.update(id, dto, staffId);
    return BicycleParkingResponseDto.fromEntity(entity);
  }

  async updateOrder(dto: UpdateBicycleParkingOrderDto, staffId: number): Promise<void> {
    await this.bicycleParkingRepository.updateOrder(dto.ids, staffId);
  }

  private async ensureNumberUnique(
    facilityId: number,
    number: string,
    excludeId?: number,
  ): Promise<void> {
    const duplicate = await this.bicycleParkingRepository.findByNumber(facilityId, number, excludeId);
    if (duplicate) {
      throw new ConflictException(`Bicycle parking number "${number}" already exists in this facility`);
    }
  }
}
