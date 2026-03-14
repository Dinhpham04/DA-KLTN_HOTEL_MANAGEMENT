import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Facility } from '@prisma/client';

export class FacilityResponseDto {
  @ApiProperty() readonly facilityId!: number;
  @ApiProperty() readonly dataStatus!: number;
  @ApiProperty() readonly facilityType!: number;
  @ApiProperty() readonly facilityNo!: string;
  @ApiProperty() readonly facilityName!: string;
  @ApiProperty() readonly facilityNameEn!: string;
  @ApiProperty() readonly zipCode!: string;
  @ApiProperty() readonly address!: string;
  @ApiProperty() readonly addressEn!: string;
  @ApiProperty() readonly keyFunction!: boolean;
  @ApiProperty() readonly sharePlaceFlag!: boolean;
  @ApiProperty() readonly parkingFlag!: boolean;
  @ApiProperty() readonly parkingImg!: string;
  @ApiProperty() readonly bicycleParkingFlag!: boolean;
  @ApiProperty() readonly bicycleParkingImg!: string;
  @ApiProperty() readonly deliveryboxFlag!: boolean;
  @ApiPropertyOptional() readonly memo!: string | null;
  @ApiProperty() readonly orderNum!: number;
  @ApiPropertyOptional() readonly colorOption!: string | null;
  @ApiProperty() readonly createdAt!: Date;
  @ApiProperty() readonly updatedAt!: Date;

  static fromEntity(entity: Facility): FacilityResponseDto {
    return Object.assign(new FacilityResponseDto(), {
      facilityId: entity.facilityId,
      dataStatus: entity.dataStatus,
      facilityType: entity.facilityType,
      facilityNo: entity.facilityNo,
      facilityName: entity.facilityName,
      facilityNameEn: entity.facilityNameEn,
      zipCode: entity.zipCode,
      address: entity.address,
      addressEn: entity.addressEn,
      keyFunction: entity.keyFunction,
      sharePlaceFlag: entity.sharePlaceFlag,
      parkingFlag: entity.parkingFlag,
      parkingImg: entity.parkingImg,
      bicycleParkingFlag: entity.bicycleParkingFlag,
      bicycleParkingImg: entity.bicycleParkingImg,
      deliveryboxFlag: entity.deliveryboxFlag,
      memo: entity.memo,
      orderNum: entity.orderNum,
      colorOption: entity.colorOption,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    } satisfies Record<keyof FacilityResponseDto, unknown>);
  }
}
