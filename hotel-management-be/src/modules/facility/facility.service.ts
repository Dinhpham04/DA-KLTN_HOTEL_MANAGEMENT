import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { IPaginated, ERROR_MESSAGES } from '@common/index';
import { FacilityRepository } from './facility.repository';
import {
  CreateFacilityDto,
  UpdateFacilityDto,
  FacilityFilterDto,
  FacilityResponseDto,
} from './dto';

@Injectable()
export class FacilityService {
  constructor(private readonly facilityRepository: FacilityRepository) { }

  async findAll(filter: FacilityFilterDto): Promise<IPaginated<FacilityResponseDto>> {
    const { data, total } = await this.facilityRepository.findAll(filter);

    return {
      data: data.map(FacilityResponseDto.fromEntity),
      meta: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  async findById(id: number): Promise<FacilityResponseDto> {
    const entity = await this.facilityRepository.findById(id);
    if (!entity) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    return FacilityResponseDto.fromEntity(entity);
  }

  async create(dto: CreateFacilityDto, currentStaffId: number): Promise<FacilityResponseDto> {
    await this.ensureFacilityNoUnique(dto.facilityNo);

    const entity = await this.facilityRepository.create({
      facilityNo: dto.facilityNo,
      facilityName: dto.facilityName,
      facilityNameEn: dto.facilityNameEn,
      zipCode: dto.zipCode,
      address: dto.address,
      addressEn: dto.addressEn,
      facilityType: dto.facilityType ?? 1,
      keyFunction: dto.keyFunction ?? false,
      sharePlaceFlag: dto.sharePlaceFlag ?? false,
      parkingFlag: dto.parkingFlag ?? false,
      parkingImg: dto.parkingImg ?? '',
      bicycleParkingFlag: dto.bicycleParkingFlag ?? false,
      bicycleParkingImg: dto.bicycleParkingImg ?? '',
      deliveryboxFlag: dto.deliveryboxFlag ?? false,
      memo: dto.memo ?? null,
      orderNum: dto.orderNum ?? 1,
      colorOption: dto.colorOption ?? null,
      createdBy: { connect: { staffId: currentStaffId } },
      updatedBy: { connect: { staffId: currentStaffId } },
    });

    return FacilityResponseDto.fromEntity(entity);
  }

  async update(
    id: number,
    dto: UpdateFacilityDto,
    currentStaffId: number,
  ): Promise<FacilityResponseDto> {
    const existing = await this.facilityRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    if (dto.facilityNo !== undefined && dto.facilityNo !== existing.facilityNo) {
      await this.ensureFacilityNoUnique(dto.facilityNo, id);
    }

    const entity = await this.facilityRepository.update(id, {
      ...(dto.dataStatus !== undefined && { dataStatus: dto.dataStatus }),
      ...(dto.facilityType !== undefined && { facilityType: dto.facilityType }),
      ...(dto.facilityNo !== undefined && { facilityNo: dto.facilityNo }),
      ...(dto.facilityName !== undefined && { facilityName: dto.facilityName }),
      ...(dto.facilityNameEn !== undefined && { facilityNameEn: dto.facilityNameEn }),
      ...(dto.zipCode !== undefined && { zipCode: dto.zipCode }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.addressEn !== undefined && { addressEn: dto.addressEn }),
      ...(dto.keyFunction !== undefined && { keyFunction: dto.keyFunction }),
      ...(dto.sharePlaceFlag !== undefined && { sharePlaceFlag: dto.sharePlaceFlag }),
      ...(dto.parkingFlag !== undefined && { parkingFlag: dto.parkingFlag }),
      ...(dto.parkingImg !== undefined && { parkingImg: dto.parkingImg }),
      ...(dto.bicycleParkingFlag !== undefined && { bicycleParkingFlag: dto.bicycleParkingFlag }),
      ...(dto.bicycleParkingImg !== undefined && { bicycleParkingImg: dto.bicycleParkingImg }),
      ...(dto.deliveryboxFlag !== undefined && { deliveryboxFlag: dto.deliveryboxFlag }),
      ...(dto.memo !== undefined && { memo: dto.memo }),
      ...(dto.orderNum !== undefined && { orderNum: dto.orderNum }),
      ...(dto.colorOption !== undefined && { colorOption: dto.colorOption }),
      updatedBy: { connect: { staffId: currentStaffId } },
    });

    return FacilityResponseDto.fromEntity(entity);
  }

  async remove(id: number, currentStaffId: number): Promise<void> {
    const existing = await this.facilityRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    await this.facilityRepository.softDelete(id, currentStaffId);
  }

  private async ensureFacilityNoUnique(facilityNo: string, excludeId?: number): Promise<void> {
    const duplicate = await this.facilityRepository.findByNo(facilityNo, excludeId);
    if (duplicate) {
      throw new ConflictException(`Facility number "${facilityNo}" already exists`);
    }
  }
}
