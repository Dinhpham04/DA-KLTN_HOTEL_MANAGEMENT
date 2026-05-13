import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { RequestType } from '@prisma/client';

export class RequestTypeResponseDto {
  @ApiProperty() readonly requestTypeId!: number;
  @ApiProperty() readonly requestTypeName!: string;
  @ApiPropertyOptional() readonly requestTypeNameEn?: string | null;
  @ApiProperty() readonly category!: string;
  @ApiProperty() readonly taxFreeDefault!: boolean;
  @ApiProperty() readonly isRefund!: boolean;
  @ApiProperty() readonly orderNum!: number;

  static fromEntity(entity: RequestType): RequestTypeResponseDto {
    return Object.assign(new RequestTypeResponseDto(), {
      requestTypeId: entity.requestTypeId,
      requestTypeName: entity.requestTypeName,
      requestTypeNameEn: entity.requestTypeNameEn,
      category: entity.category,
      taxFreeDefault: entity.taxFreeDefault,
      isRefund: entity.isRefund,
      orderNum: entity.orderNum,
    } satisfies Record<keyof RequestTypeResponseDto, unknown>);
  }
}
