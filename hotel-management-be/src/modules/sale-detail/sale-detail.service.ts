import { Injectable, NotFoundException } from '@nestjs/common';
import { ERROR_MESSAGES } from '@common/index';
import { SaleDetailRepository } from './sale-detail.repository';
import {
  CreateSaleDetailDto,
  SaleDetailResponseDto,
  UpdateSaleDetailDto,
} from './dto';

@Injectable()
export class SaleDetailService {
  constructor(private readonly repo: SaleDetailRepository) {}

  async findByReserveId(reserveId: number): Promise<{ data: SaleDetailResponseDto[] }> {
    const items = await this.repo.findAll(reserveId);
    return { data: items.map(SaleDetailResponseDto.fromEntity) };
  }

  async create(dto: CreateSaleDetailDto, staffId: number): Promise<SaleDetailResponseDto> {
    const entity = await this.repo.create({
      reserve: { connect: { reserveId: dto.reserveId } },
      requestTypeId: dto.requestTypeId,
      countUnit: dto.countUnit,
      ...(dto.requestDetailId !== undefined && {
        requestDetail: { connect: { requestDetailId: dto.requestDetailId } },
      }),
      ...(dto.paymentTypeId !== undefined && { paymentTypeId: dto.paymentTypeId }),
      ...(dto.paymentMethodId !== undefined && {
        paymentMethod: { connect: { paymentMethodId: dto.paymentMethodId } },
      }),
      ...(dto.stayTypeId !== undefined && {
        stayType: { connect: { stayTypeId: dto.stayTypeId } },
      }),
      ...(dto.occupierName !== undefined && { occupierName: dto.occupierName }),
      ...(dto.titlePrefix !== undefined && { titlePrefix: dto.titlePrefix }),
      ...(dto.titleSuffix !== undefined && { titleSuffix: dto.titleSuffix }),
      ...(dto.taxFreeFlag !== undefined && { taxFreeFlag: dto.taxFreeFlag }),
      ...(dto.isConfirmed !== undefined && { isConfirmed: dto.isConfirmed }),
      ...(dto.confirmedDate !== undefined && { confirmedDate: new Date(dto.confirmedDate) }),
      ...(dto.requestFrom !== undefined && { requestFrom: new Date(dto.requestFrom) }),
      ...(dto.requestTo !== undefined && { requestTo: new Date(dto.requestTo) }),
      ...(dto.requestDayCount !== undefined && { requestDayCount: dto.requestDayCount }),
      ...(dto.unitPrice !== undefined && { unitPrice: dto.unitPrice }),
      ...(dto.totalPrice !== undefined && { totalPrice: dto.totalPrice }),
      ...(dto.count !== undefined && { count: dto.count }),
      ...(dto.chargeStaffId !== undefined && {
        chargeStaff: { connect: { staffId: dto.chargeStaffId } },
      }),
      ...(dto.summary !== undefined && { summary: dto.summary }),
      ...(dto.saleDate !== undefined && { saleDate: new Date(dto.saleDate) }),
      ...(dto.receiptPaymentDate !== undefined && {
        receiptPaymentDate: new Date(dto.receiptPaymentDate),
      }),
      createdBy: { connect: { staffId } },
    });
    return SaleDetailResponseDto.fromEntity(entity);
  }

  async update(
    id: number,
    dto: UpdateSaleDetailDto,
    staffId: number,
  ): Promise<SaleDetailResponseDto> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    const entity = await this.repo.update(id, {
      ...(dto.requestTypeId !== undefined && { requestTypeId: dto.requestTypeId }),
      ...(dto.countUnit !== undefined && { countUnit: dto.countUnit }),
      ...(dto.requestDetailId !== undefined && {
        requestDetail: { connect: { requestDetailId: dto.requestDetailId } },
      }),
      ...(dto.paymentTypeId !== undefined && { paymentTypeId: dto.paymentTypeId }),
      ...(dto.paymentMethodId !== undefined && {
        paymentMethod: { connect: { paymentMethodId: dto.paymentMethodId } },
      }),
      ...(dto.stayTypeId !== undefined && {
        stayType: { connect: { stayTypeId: dto.stayTypeId } },
      }),
      ...(dto.occupierName !== undefined && { occupierName: dto.occupierName }),
      ...(dto.titlePrefix !== undefined && { titlePrefix: dto.titlePrefix }),
      ...(dto.titleSuffix !== undefined && { titleSuffix: dto.titleSuffix }),
      ...(dto.taxFreeFlag !== undefined && { taxFreeFlag: dto.taxFreeFlag }),
      ...(dto.isConfirmed !== undefined && { isConfirmed: dto.isConfirmed }),
      ...(dto.confirmedDate !== undefined && { confirmedDate: new Date(dto.confirmedDate) }),
      ...(dto.requestFrom !== undefined && { requestFrom: new Date(dto.requestFrom) }),
      ...(dto.requestTo !== undefined && { requestTo: new Date(dto.requestTo) }),
      ...(dto.requestDayCount !== undefined && { requestDayCount: dto.requestDayCount }),
      ...(dto.unitPrice !== undefined && { unitPrice: dto.unitPrice }),
      ...(dto.totalPrice !== undefined && { totalPrice: dto.totalPrice }),
      ...(dto.count !== undefined && { count: dto.count }),
      ...(dto.chargeStaffId !== undefined && {
        chargeStaff: { connect: { staffId: dto.chargeStaffId } },
      }),
      ...(dto.summary !== undefined && { summary: dto.summary }),
      ...(dto.saleDate !== undefined && { saleDate: new Date(dto.saleDate) }),
      ...(dto.receiptPaymentDate !== undefined && {
        receiptPaymentDate: new Date(dto.receiptPaymentDate),
      }),
      updatedBy: { connect: { staffId } },
    });
    return SaleDetailResponseDto.fromEntity(entity);
  }

  async remove(id: number, staffId: number): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    await this.repo.softDelete(id, staffId);
  }
}
