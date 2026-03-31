import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

interface RentItemEntity {
  stayTypeId: number;
  dataStatus: number | null;
  dayRent: number | null;
  monthRent: bigint | number | null;
  dayRentOver3: number | null;
  monthRentOver3: bigint | number | null;
  dayCleanFee: number | null;
  monthCleanFee: bigint | number | null;
  dayCleanFeeOver3: number | null;
  monthCleanFeeOver3: bigint | number | null;
  dayMainteFee: number | null;
  dayUtilityFee: number | null;
  depositPay: bigint | number | null;
  depositPayOver3: bigint | number | null;
  monthMainteFee: bigint | number | null;
  monthUtilityFee: bigint | number | null;
  stayType?: { stayTypeName: string } | null;
}

interface RentGroupEntity {
  roomTypeId: number;
  roomClassId: number | null;
  roomTypeNameShort: string | null;
  monthMainteFee: bigint | number | null;
  monthUtilityFee: bigint | number | null;
  orderNum: number;
  rents: RentItemEntity[];
}

class RentItemResponseDto {
  @ApiProperty() readonly stayTypeId!: number;
  @ApiProperty() readonly stayTypeName!: string;
  @ApiProperty() readonly dataStatus!: number | null;
  @ApiPropertyOptional() readonly dayRent!: number | null;
  @ApiPropertyOptional() readonly monthRent!: number | null;
  @ApiPropertyOptional() readonly dayRentOver3!: number | null;
  @ApiPropertyOptional() readonly monthRentOver3!: number | null;
  @ApiPropertyOptional() readonly dayCleanFee!: number | null;
  @ApiPropertyOptional() readonly monthCleanFee!: number | null;
  @ApiPropertyOptional() readonly dayCleanFeeOver3!: number | null;
  @ApiPropertyOptional() readonly monthCleanFeeOver3!: number | null;
  @ApiPropertyOptional() readonly dayMainteFee!: number | null;
  @ApiPropertyOptional() readonly dayUtilityFee!: number | null;
  @ApiPropertyOptional() readonly depositPay!: number | null;
  @ApiPropertyOptional() readonly depositPayOver3!: number | null;
  @ApiPropertyOptional() readonly monthMainteFee!: number | null;
  @ApiPropertyOptional() readonly monthUtilityFee!: number | null;
}

export class RentGroupResponseDto {
  @ApiProperty() readonly roomTypeId!: number;
  @ApiPropertyOptional() readonly roomClassId!: number | null;
  @ApiPropertyOptional() readonly roomTypeNameShort!: string | null;
  @ApiPropertyOptional() readonly monthMainteFee!: number | null;
  @ApiPropertyOptional() readonly monthUtilityFee!: number | null;
  @ApiProperty() readonly orderNum!: number;
  @ApiProperty({ type: [RentItemResponseDto] }) readonly rents!: RentItemResponseDto[];

  private static toNumber(val: bigint | number | null | undefined): number | null {
    if (val === null || val === undefined) return null;
    return Number(val);
  }

  static fromEntity(entity: RentGroupEntity): RentGroupResponseDto {
    return Object.assign(new RentGroupResponseDto(), {
      roomTypeId: entity.roomTypeId,
      roomClassId: entity.roomClassId,
      roomTypeNameShort: entity.roomTypeNameShort,
      monthMainteFee: RentGroupResponseDto.toNumber(entity.monthMainteFee),
      monthUtilityFee: RentGroupResponseDto.toNumber(entity.monthUtilityFee),
      orderNum: entity.orderNum,
      rents: entity.rents.map((rent) => ({
        stayTypeId: rent.stayTypeId,
        stayTypeName: rent.stayType?.stayTypeName ?? '',
        dataStatus: rent.dataStatus,
        dayRent: rent.dayRent,
        monthRent: RentGroupResponseDto.toNumber(rent.monthRent),
        dayRentOver3: rent.dayRentOver3,
        monthRentOver3: RentGroupResponseDto.toNumber(rent.monthRentOver3),
        dayCleanFee: rent.dayCleanFee,
        monthCleanFee: RentGroupResponseDto.toNumber(rent.monthCleanFee),
        dayCleanFeeOver3: rent.dayCleanFeeOver3,
        monthCleanFeeOver3: RentGroupResponseDto.toNumber(rent.monthCleanFeeOver3),
        dayMainteFee: rent.dayMainteFee,
        dayUtilityFee: rent.dayUtilityFee,
        depositPay: RentGroupResponseDto.toNumber(rent.depositPay),
        depositPayOver3: RentGroupResponseDto.toNumber(rent.depositPayOver3),
        monthMainteFee: RentGroupResponseDto.toNumber(rent.monthMainteFee),
        monthUtilityFee: RentGroupResponseDto.toNumber(rent.monthUtilityFee),
      })),
    });
  }
}
