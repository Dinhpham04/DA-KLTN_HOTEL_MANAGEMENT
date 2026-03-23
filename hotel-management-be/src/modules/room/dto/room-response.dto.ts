import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Room, RoomType, Facility, RoomClass } from '@prisma/client';

type RoomWithRelations = Room & {
  roomType?: RoomType & { roomClass?: RoomClass };
  facility?: Facility;
  updatedBy?: { staffId: number; staffName: string } | null;
};

export class RoomResponseDto {
  @ApiProperty() readonly roomId!: number;
  @ApiProperty() readonly facilityId!: number;
  @ApiProperty() readonly roomTypeId!: number;
  @ApiProperty() readonly dataStatus!: number;
  @ApiProperty() readonly roomNumber!: string;
  @ApiPropertyOptional() readonly keyType!: number | null;
  @ApiProperty() readonly roomStatus!: number;
  @ApiProperty() readonly reservedCleanDay!: number;
  @ApiProperty() readonly deliveryboxFlag!: boolean;
  @ApiProperty() readonly petFlag!: boolean;
  @ApiProperty() readonly mailboxPassword!: string;
  @ApiProperty() readonly orderNum!: number;
  @ApiProperty() readonly externalFlag!: boolean;
  @ApiPropertyOptional() readonly externalDateFrom!: Date | null;
  @ApiPropertyOptional() readonly externalDateTo!: Date | null;
  @ApiProperty() readonly createdAt!: Date;
  @ApiProperty() readonly updatedAt!: Date;

  @ApiPropertyOptional() readonly facilityName?: string;
  @ApiPropertyOptional() readonly facilityNo?: string;
  @ApiPropertyOptional() readonly roomTypeName?: string;
  @ApiPropertyOptional() readonly roomClassName?: string;
  @ApiPropertyOptional() readonly updatedByName?: string;

  static fromEntity(room: RoomWithRelations): RoomResponseDto {
    return Object.assign(new RoomResponseDto(), {
      roomId: room.roomId,
      facilityId: room.facilityId,
      roomTypeId: room.roomTypeId,
      dataStatus: room.dataStatus,
      roomNumber: room.roomNumber,
      keyType: room.keyType,
      roomStatus: room.roomStatus,
      reservedCleanDay: room.reservedCleanDay,
      deliveryboxFlag: room.deliveryboxFlag,
      petFlag: room.petFlag,
      mailboxPassword: room.mailboxPassword,
      orderNum: room.orderNum,
      externalFlag: room.externalFlag,
      externalDateFrom: room.externalDateFrom,
      externalDateTo: room.externalDateTo,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      facilityName: room.facility?.facilityName,
      facilityNo: room.facility?.facilityNo,
      roomTypeName: room.roomType?.roomTypeName,
      roomClassName: room.roomType?.roomClass?.roomClassName,
      updatedByName: room.updatedBy?.staffName,
    } satisfies Record<keyof RoomResponseDto, unknown>);
  }
}
