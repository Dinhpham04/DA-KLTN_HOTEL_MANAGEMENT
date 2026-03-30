import { ApiProperty } from '@nestjs/swagger';

export class RoomTypeCellDto {
  @ApiProperty()
  roomTypeId!: number;

  @ApiProperty()
  roomTypeNameShort!: string;

  @ApiProperty()
  roomTypeName!: string;

  @ApiProperty({ nullable: true })
  acreage!: string | null;

  @ApiProperty()
  isExists!: boolean;
}

export class FacilityRowDto {
  @ApiProperty()
  facilityId!: number;

  @ApiProperty()
  facilityName!: string;

  @ApiProperty({ nullable: true })
  colorOption!: string | null;

  @ApiProperty({ type: [RoomTypeCellDto] })
  roomTypes!: RoomTypeCellDto[];
}

export class FacilityRoomTypeMatrixDto {
  @ApiProperty({ type: [FacilityRowDto] })
  facilities!: FacilityRowDto[];
}
