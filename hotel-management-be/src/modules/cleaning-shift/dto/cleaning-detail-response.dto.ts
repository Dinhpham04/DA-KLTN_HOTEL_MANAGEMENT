import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PinInfoDto } from './pin-info.dto';

export class CleaningDetailResponseDto {
  @ApiProperty()
  cleaningDetailId!: number;

  @ApiProperty()
  cleanId!: number;

  @ApiProperty()
  facilityId!: number;

  @ApiPropertyOptional({ nullable: true })
  facilityName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  roomId!: number | null;

  @ApiPropertyOptional({ nullable: true })
  roomNumber!: string | null;

  @ApiPropertyOptional({ nullable: true })
  reserveId!: number | null;

  @ApiPropertyOptional({ nullable: true })
  reserveClientName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  reserveCheckoutAt!: Date | null;

  @ApiProperty({ description: '1=Room, 2=CommonArea, 3=KeySafety' })
  dataType!: number;

  @ApiPropertyOptional({ nullable: true })
  areaName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  mainStaffId!: number | null;

  @ApiPropertyOptional({ nullable: true })
  subStaffId!: number | null;

  @ApiPropertyOptional({ nullable: true })
  checkStaffId!: number | null;

  @ApiPropertyOptional({ nullable: true })
  mainStaffName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  subStaffName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  checkStaffName!: string | null;

  @ApiProperty()
  mainStaffExternalFlag!: boolean;

  @ApiProperty()
  subStaffExternalFlag!: boolean;

  @ApiProperty()
  checkStaffExternalFlag!: boolean;

  @ApiPropertyOptional({ nullable: true })
  scheduledDate!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  startDatetime!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  endDatetime!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  finishDatetime!: Date | null;

  @ApiProperty({ description: '1..7' })
  cleanStatus!: number;

  @ApiProperty()
  checkSafetyFlag!: boolean;

  @ApiPropertyOptional({ nullable: true })
  pinRevokedConfirmedAt!: Date | null;

  @ApiPropertyOptional({ type: () => PinInfoDto, nullable: true })
  pinInfo!: PinInfoDto | null;

  @ApiPropertyOptional({ nullable: true })
  comment!: string | null;

  @ApiPropertyOptional({ nullable: true })
  reportImg1!: string | null;

  @ApiPropertyOptional({ nullable: true })
  reportImg2!: string | null;

  @ApiPropertyOptional({ nullable: true })
  reportImg3!: string | null;

  @ApiPropertyOptional({ nullable: true })
  reportImg4!: string | null;

  @ApiProperty()
  noteCount!: number;

  @ApiPropertyOptional({ nullable: true })
  orderNum!: number | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
