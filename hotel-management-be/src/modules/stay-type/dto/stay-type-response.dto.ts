import { ApiProperty } from '@nestjs/swagger';
import type { StayType } from '@prisma/client';

export class StayTypeResponseDto {
  @ApiProperty() readonly stayTypeId!: number;
  @ApiProperty() readonly stayContractTypeId!: number;
  @ApiProperty() readonly stayTypeName!: string;
  @ApiProperty() readonly stayTypeNameEn!: string;
  @ApiProperty() readonly stayTypeNameShort!: string;
  @ApiProperty() readonly orderNum!: number;
  @ApiProperty() readonly active!: boolean;

  static fromEntity(entity: StayType): StayTypeResponseDto {
    return Object.assign(new StayTypeResponseDto(), {
      stayTypeId: entity.stayTypeId,
      stayContractTypeId: entity.stayContractTypeId,
      stayTypeName: entity.stayTypeName,
      stayTypeNameEn: entity.stayTypeNameEn,
      stayTypeNameShort: entity.stayTypeNameShort,
      orderNum: entity.orderNum,
      active: entity.active,
    } satisfies Record<keyof StayTypeResponseDto, unknown>);
  }
}
