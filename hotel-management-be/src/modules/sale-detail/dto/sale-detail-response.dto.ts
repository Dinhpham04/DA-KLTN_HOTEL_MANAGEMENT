import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { SaleDetail } from '@prisma/client';

export class SaleDetailResponseDto {
  @ApiProperty() saleDetailId!: number;
  @ApiProperty() reserveId!: number;
  @ApiPropertyOptional() saleId!: number | null;
  @ApiPropertyOptional() requestDetailId!: number | null;
  @ApiProperty() requestTypeId!: number;
  @ApiPropertyOptional() paymentTypeId!: number | null;
  @ApiPropertyOptional() paymentMethodId!: number | null;
  @ApiPropertyOptional() stayTypeId!: number | null;
  @ApiPropertyOptional() occupierName!: string | null;
  @ApiPropertyOptional() titlePrefix!: string | null;
  @ApiPropertyOptional() titleSuffix!: string | null;
  @ApiProperty() taxFreeFlag!: boolean;
  @ApiProperty() isConfirmed!: boolean;
  @ApiPropertyOptional() confirmedDate!: Date | null;
  @ApiPropertyOptional() requestFrom!: string | null;
  @ApiPropertyOptional() requestTo!: string | null;
  @ApiPropertyOptional() requestDayCount!: number | null;
  @ApiPropertyOptional() unitPrice!: number | null;
  @ApiPropertyOptional() totalPrice!: number | null;
  @ApiProperty() count!: number;
  @ApiProperty() countUnit!: number;
  @ApiPropertyOptional() chargeStaffId!: number | null;
  @ApiPropertyOptional() summary!: string | null;
  @ApiPropertyOptional() saleDate!: string | null;
  @ApiPropertyOptional() receiptPaymentDate!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;

  static fromEntity(entity: SaleDetail): SaleDetailResponseDto {
    const dto = new SaleDetailResponseDto();
    dto.saleDetailId = entity.saleDetailId;
    dto.reserveId = entity.reserveId;
    dto.saleId = entity.saleId;
    dto.requestDetailId = entity.requestDetailId;
    dto.requestTypeId = entity.requestTypeId;
    dto.paymentTypeId = entity.paymentTypeId;
    dto.paymentMethodId = entity.paymentMethodId;
    dto.stayTypeId = entity.stayTypeId;
    dto.occupierName = entity.occupierName;
    dto.titlePrefix = entity.titlePrefix;
    dto.titleSuffix = entity.titleSuffix;
    dto.taxFreeFlag = entity.taxFreeFlag;
    dto.isConfirmed = entity.isConfirmed;
    dto.confirmedDate = entity.confirmedDate;
    dto.requestFrom = entity.requestFrom ? entity.requestFrom.toISOString() : null;
    dto.requestTo = entity.requestTo ? entity.requestTo.toISOString() : null;
    dto.requestDayCount = entity.requestDayCount;
    dto.unitPrice = entity.unitPrice ? Number(entity.unitPrice) : null;
    dto.totalPrice = entity.totalPrice ? Number(entity.totalPrice) : null;
    dto.count = entity.count;
    dto.countUnit = entity.countUnit;
    dto.chargeStaffId = entity.chargeStaffId;
    dto.summary = entity.summary;
    dto.saleDate = entity.saleDate ? entity.saleDate.toISOString().split('T')[0] ?? null : null;
    dto.receiptPaymentDate = entity.receiptPaymentDate
      ? (entity.receiptPaymentDate.toISOString().split('T')[0] ?? null)
      : null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
