import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Staff } from '@prisma/client';
import type { StaffWithUpdater } from '../staff.repository';

export class StaffResponseDto {
  @ApiProperty()
  readonly staffId!: number;

  @ApiProperty()
  readonly dataStatus!: number;

  @ApiProperty()
  readonly staffType!: number;

  @ApiProperty()
  readonly staffName!: string;

  @ApiPropertyOptional()
  readonly staffNameEn!: string | null;

  @ApiPropertyOptional()
  readonly staffNameShort!: string | null;

  @ApiProperty()
  readonly sex!: number;

  @ApiPropertyOptional()
  readonly zipCode!: string | null;

  @ApiPropertyOptional()
  readonly address!: string | null;

  @ApiProperty()
  readonly mail!: string;

  @ApiPropertyOptional()
  readonly tel!: string | null;

  @ApiPropertyOptional()
  readonly businessTel!: string | null;

  @ApiPropertyOptional()
  readonly emergencyTel!: string | null;

  @ApiPropertyOptional()
  readonly orderNum!: number | null;

  @ApiProperty()
  readonly displayInAttendance!: boolean;

  @ApiProperty()
  readonly createdAt!: Date;

  @ApiProperty()
  readonly updatedAt!: Date;

  @ApiPropertyOptional()
  readonly updatedByName!: string | null;

  static fromEntity(staff: Staff | StaffWithUpdater): StaffResponseDto {
    return Object.assign(new StaffResponseDto(), {
      staffId: staff.staffId,
      dataStatus: staff.dataStatus,
      staffType: staff.staffType,
      staffName: staff.staffName,
      staffNameEn: staff.staffNameEn,
      staffNameShort: staff.staffNameShort,
      sex: staff.sex,
      zipCode: staff.zipCode,
      address: staff.address,
      mail: staff.mail,
      tel: staff.tel,
      businessTel: staff.businessTel,
      emergencyTel: staff.emergencyTel,
      orderNum: staff.orderNum,
      displayInAttendance: staff.displayInAttendance,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
      updatedByName: (staff as StaffWithUpdater).updatedBy?.staffName ?? null,
    } satisfies Record<keyof Omit<StaffResponseDto, 'fromEntity'>, unknown>);
  }
}
