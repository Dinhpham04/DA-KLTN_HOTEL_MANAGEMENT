import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { RequestDetail, SaleDetail } from '@prisma/client';

type RequestDetailWithSaleDetails = RequestDetail & {
  saleDetails?: SaleDetail[];
};

type PaymentStatus = 'unpaid' | 'paid';

export class RequestDetailResponseDto {
  @ApiProperty() requestDetailId!: number;
  @ApiProperty() reserveId!: number;
  @ApiPropertyOptional() requestId!: number | null;
  @ApiProperty() requestTypeId!: number;
  @ApiPropertyOptional() stayTypeId!: number | null;
  @ApiPropertyOptional() occupierName!: string | null;
  @ApiPropertyOptional() titlePrefix!: string | null;
  @ApiPropertyOptional() titleSuffix!: string | null;
  @ApiProperty() taxFreeFlag!: boolean;
  @ApiPropertyOptional() requestFrom!: string | null;
  @ApiPropertyOptional() requestTo!: string | null;
  @ApiPropertyOptional() requestDayCount!: number | null;
  @ApiPropertyOptional() unitPrice!: number | null;
  @ApiPropertyOptional() totalPrice!: number | null;
  @ApiPropertyOptional() totalPriceChange!: number | null;
  @ApiProperty() peopleCount!: number;
  @ApiProperty() count!: number;
  @ApiProperty() countUnit!: number;
  @ApiPropertyOptional() chargeStaffId!: number | null;
  @ApiProperty({ type: [Number] }) saleDetailIds!: number[];
  @ApiProperty() paidAmount!: number;
  @ApiProperty({ enum: ['unpaid', 'paid'] }) paymentStatus!: PaymentStatus;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;

  static fromEntity(entity: RequestDetailWithSaleDetails): RequestDetailResponseDto {
    const saleDetails = entity.saleDetails ?? [];
    const dto = new RequestDetailResponseDto();
    dto.requestDetailId = entity.requestDetailId;
    dto.reserveId = entity.reserveId;
    dto.requestId = entity.requestId;
    dto.requestTypeId = entity.requestTypeId;
    dto.stayTypeId = entity.stayTypeId;
    dto.occupierName = entity.occupierName;
    dto.titlePrefix = entity.titlePrefix;
    dto.titleSuffix = entity.titleSuffix;
    dto.taxFreeFlag = entity.taxFreeFlag;
    dto.requestFrom = entity.requestFrom ? entity.requestFrom.toISOString() : null;
    dto.requestTo = entity.requestTo ? entity.requestTo.toISOString() : null;
    dto.requestDayCount = entity.requestDayCount;
    dto.unitPrice = entity.unitPrice ? Number(entity.unitPrice) : null;
    dto.totalPrice = entity.totalPrice ? Number(entity.totalPrice) : null;
    dto.totalPriceChange = entity.totalPriceChange ? Number(entity.totalPriceChange) : null;
    dto.peopleCount = entity.peopleCount;
    dto.count = entity.count;
    dto.countUnit = entity.countUnit;
    dto.chargeStaffId = entity.chargeStaffId;
    dto.saleDetailIds = saleDetails.map((saleDetail) => saleDetail.saleDetailId);
    dto.paidAmount = saleDetails.reduce(
      (sum, saleDetail) => sum + Number(saleDetail.totalPrice ?? 0),
      0,
    );
    dto.paymentStatus = saleDetails.length > 0 ? 'paid' : 'unpaid';
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
