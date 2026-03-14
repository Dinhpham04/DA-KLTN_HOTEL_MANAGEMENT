import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { RoomType, RoomClass } from '@prisma/client';

type RoomTypeWithRelations = RoomType & {
  roomClass?: RoomClass;
};

export class RoomTypeResponseDto {
  @ApiProperty() readonly roomTypeId!: number;
  @ApiProperty() readonly dataStatus!: number;
  @ApiProperty() readonly roomClassId!: number;
  @ApiProperty() readonly roomTypeName!: string;
  @ApiProperty() readonly roomTypeNameShort!: string;
  @ApiPropertyOptional() readonly acreage!: number | null;
  @ApiProperty() readonly orderNum!: number;
  @ApiPropertyOptional() readonly orderNumDeposit!: number | null;
  @ApiProperty() readonly createdAt!: Date;
  @ApiProperty() readonly updatedAt!: Date;

  @ApiPropertyOptional() readonly roomClassName?: string;

  static fromEntity(entity: RoomTypeWithRelations): RoomTypeResponseDto {
    return Object.assign(new RoomTypeResponseDto(), {
      roomTypeId: entity.roomTypeId,
      dataStatus: entity.dataStatus,
      roomClassId: entity.roomClassId,
      roomTypeName: entity.roomTypeName,
      roomTypeNameShort: entity.roomTypeNameShort,
      acreage: entity.acreage,
      orderNum: entity.orderNum,
      orderNumDeposit: entity.orderNumDeposit,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      roomClassName: entity.roomClass?.roomClassName,
    } satisfies Record<keyof RoomTypeResponseDto, unknown>);
  }
}
