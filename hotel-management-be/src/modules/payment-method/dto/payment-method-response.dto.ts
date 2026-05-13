import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PaymentMethod } from '@prisma/client';

export class PaymentMethodResponseDto {
  @ApiProperty() paymentMethodId!: number;
  @ApiPropertyOptional() paymentTypeId!: number | null;
  @ApiPropertyOptional() category!: string | null;
  @ApiPropertyOptional() displayName!: string | null;
  @ApiPropertyOptional() accountCode!: number | null;
  @ApiPropertyOptional() subAccountCode!: string | null;
  @ApiPropertyOptional() memo!: string | null;

  static fromEntity(entity: PaymentMethod): PaymentMethodResponseDto {
    const dto = new PaymentMethodResponseDto();
    dto.paymentMethodId = entity.paymentMethodId;
    dto.paymentTypeId = entity.paymentTypeId;
    dto.category = entity.category;
    dto.displayName = entity.displayName;
    dto.accountCode = entity.accountCode;
    dto.subAccountCode = entity.subAccountCode;
    dto.memo = entity.memo;
    return dto;
  }
}
