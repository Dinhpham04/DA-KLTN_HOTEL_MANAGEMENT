import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

interface ParkingRentEntity {
  parkingRentId: number;
  stayTypeId: number;
  rent: number;
}

interface ParkingEntity {
  parkingId: number;
  dataStatus: number;
  parentFacilityId: number;
  number: string;
  heightLimit: number;
  notice: string | null;
  orderNum: number;
  createdAt: Date;
  updatedAt: Date;
  parkingRents?: ParkingRentEntity[];
  updatedBy?: { staffName: string } | null;
}

class ParkingRentResponseDto {
  @ApiProperty() readonly parkingRentId!: number;
  @ApiProperty() readonly stayTypeId!: number;
  @ApiProperty() readonly rent!: number;
}

export class ParkingResponseDto {
  @ApiProperty() readonly parkingId!: number;
  @ApiProperty() readonly dataStatus!: number;
  @ApiProperty() readonly parentFacilityId!: number;
  @ApiProperty() readonly number!: string;
  @ApiProperty() readonly heightLimit!: number;
  @ApiPropertyOptional() readonly notice!: string | null;
  @ApiProperty() readonly orderNum!: number;
  @ApiProperty() readonly createdAt!: Date;
  @ApiProperty() readonly updatedAt!: Date;
  @ApiProperty({ type: [ParkingRentResponseDto] }) readonly parkingRents!: ParkingRentResponseDto[];
  @ApiPropertyOptional() readonly updatedStaffName!: string | null;

  static fromEntity(entity: ParkingEntity): ParkingResponseDto {
    return Object.assign(new ParkingResponseDto(), {
      parkingId: entity.parkingId,
      dataStatus: entity.dataStatus,
      parentFacilityId: entity.parentFacilityId,
      number: entity.number,
      heightLimit: entity.heightLimit,
      notice: entity.notice,
      orderNum: entity.orderNum,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      parkingRents: (entity.parkingRents ?? []).map((rent) => ({
        parkingRentId: rent.parkingRentId,
        stayTypeId: rent.stayTypeId,
        rent: rent.rent,
      })),
      updatedStaffName: entity.updatedBy?.staffName ?? null,
    });
  }
}
