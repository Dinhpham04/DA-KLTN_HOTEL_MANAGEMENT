import { ApiProperty } from '@nestjs/swagger';
import type { RoomClass } from '@prisma/client';

export class RoomClassResponseDto {
  @ApiProperty() readonly roomClassId!: number;
  @ApiProperty() readonly dataStatus!: number;
  @ApiProperty() readonly roomClassName!: string;
  @ApiProperty() readonly orderNum!: number;
  @ApiProperty() readonly createdAt!: Date;
  @ApiProperty() readonly updatedAt!: Date;

  static fromEntity(entity: RoomClass): RoomClassResponseDto {
    return Object.assign(new RoomClassResponseDto(), {
      roomClassId: entity.roomClassId,
      dataStatus: entity.dataStatus,
      roomClassName: entity.roomClassName,
      orderNum: entity.orderNum,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    } satisfies Record<keyof RoomClassResponseDto, unknown>);
  }
}
