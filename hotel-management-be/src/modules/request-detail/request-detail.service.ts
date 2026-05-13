import { Injectable, NotFoundException } from '@nestjs/common';
import { ERROR_MESSAGES } from '@common/index';
import { RequestDetailRepository } from './request-detail.repository';
import {
  CreateRequestDetailDto,
  RequestDetailResponseDto,
  UpdateRequestDetailDto,
} from './dto';

@Injectable()
export class RequestDetailService {
  constructor(private readonly repo: RequestDetailRepository) {}

  async findByReserveId(reserveId: number): Promise<{ data: RequestDetailResponseDto[] }> {
    const items = await this.repo.findAll(reserveId);
    return { data: items.map(RequestDetailResponseDto.fromEntity) };
  }

  async create(
    dto: CreateRequestDetailDto,
    staffId: number,
  ): Promise<RequestDetailResponseDto> {
    const entity = await this.repo.create({
      reserve: { connect: { reserveId: dto.reserveId } },
      requestTypeId: dto.requestTypeId,
      countUnit: dto.countUnit,
      ...(dto.stayTypeId !== undefined && {
        stayType: { connect: { stayTypeId: dto.stayTypeId } },
      }),
      ...(dto.occupierName !== undefined && { occupierName: dto.occupierName }),
      ...(dto.titlePrefix !== undefined && { titlePrefix: dto.titlePrefix }),
      ...(dto.titleSuffix !== undefined && { titleSuffix: dto.titleSuffix }),
      ...(dto.taxFreeFlag !== undefined && { taxFreeFlag: dto.taxFreeFlag }),
      ...(dto.requestFrom !== undefined && { requestFrom: new Date(dto.requestFrom) }),
      ...(dto.requestTo !== undefined && { requestTo: new Date(dto.requestTo) }),
      ...(dto.requestDayCount !== undefined && { requestDayCount: dto.requestDayCount }),
      ...(dto.unitPrice !== undefined && { unitPrice: dto.unitPrice }),
      ...(dto.totalPrice !== undefined && { totalPrice: dto.totalPrice }),
      ...(dto.totalPriceChange !== undefined && { totalPriceChange: dto.totalPriceChange }),
      ...(dto.peopleCount !== undefined && { peopleCount: dto.peopleCount }),
      ...(dto.count !== undefined && { count: dto.count }),
      ...(dto.chargeStaffId !== undefined && {
        chargeStaff: { connect: { staffId: dto.chargeStaffId } },
      }),
      createdBy: { connect: { staffId } },
    });
    return RequestDetailResponseDto.fromEntity(entity);
  }

  async update(
    id: number,
    dto: UpdateRequestDetailDto,
    staffId: number,
  ): Promise<RequestDetailResponseDto> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    const entity = await this.repo.update(id, {
      ...(dto.requestTypeId !== undefined && { requestTypeId: dto.requestTypeId }),
      ...(dto.countUnit !== undefined && { countUnit: dto.countUnit }),
      ...(dto.stayTypeId !== undefined && {
        stayType: { connect: { stayTypeId: dto.stayTypeId } },
      }),
      ...(dto.occupierName !== undefined && { occupierName: dto.occupierName }),
      ...(dto.titlePrefix !== undefined && { titlePrefix: dto.titlePrefix }),
      ...(dto.titleSuffix !== undefined && { titleSuffix: dto.titleSuffix }),
      ...(dto.taxFreeFlag !== undefined && { taxFreeFlag: dto.taxFreeFlag }),
      ...(dto.requestFrom !== undefined && { requestFrom: new Date(dto.requestFrom) }),
      ...(dto.requestTo !== undefined && { requestTo: new Date(dto.requestTo) }),
      ...(dto.requestDayCount !== undefined && { requestDayCount: dto.requestDayCount }),
      ...(dto.unitPrice !== undefined && { unitPrice: dto.unitPrice }),
      ...(dto.totalPrice !== undefined && { totalPrice: dto.totalPrice }),
      ...(dto.totalPriceChange !== undefined && { totalPriceChange: dto.totalPriceChange }),
      ...(dto.peopleCount !== undefined && { peopleCount: dto.peopleCount }),
      ...(dto.count !== undefined && { count: dto.count }),
      ...(dto.chargeStaffId !== undefined && {
        chargeStaff: { connect: { staffId: dto.chargeStaffId } },
      }),
      updatedBy: { connect: { staffId } },
    });
    return RequestDetailResponseDto.fromEntity(entity);
  }

  async remove(id: number, staffId: number): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    await this.repo.softDelete(id, staffId);
  }
}
