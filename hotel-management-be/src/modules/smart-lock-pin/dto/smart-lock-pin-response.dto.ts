import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Reserve, Room, RoomPinCredential } from '@prisma/client';

type RoomPinCredentialWithRelations = RoomPinCredential & {
  room?: Pick<Room, 'roomId' | 'facilityId' | 'roomNumber'> | null;
  reserve?: Pick<
    Reserve,
    | 'reserveId'
    | 'reserveStatus'
    | 'periodFrom'
    | 'periodTo'
    | 'directcheckinFlag'
    | 'directcheckinType'
  > | null;
  updatedBy?: { staffName: string } | null;
};

export class SmartLockPinResponseDto {
  @ApiProperty() readonly roomPinCredentialId!: number;
  @ApiProperty() readonly roomId!: number;
  @ApiPropertyOptional() readonly reserveId!: number | null;
  @ApiProperty() readonly dataStatus!: number;
  @ApiProperty() readonly maskedPin!: string;
  @ApiProperty() readonly validFrom!: Date;
  @ApiProperty() readonly validTo!: Date;
  @ApiProperty() readonly status!: number;
  @ApiPropertyOptional() readonly issuedAt!: Date | null;
  @ApiPropertyOptional() readonly revokedAt!: Date | null;
  @ApiPropertyOptional() readonly expiredAt!: Date | null;
  @ApiPropertyOptional() readonly providerCredentialId!: string | null;
  @ApiPropertyOptional() readonly providerPayload!: unknown;
  @ApiPropertyOptional() readonly lastSyncAt!: Date | null;
  @ApiPropertyOptional() readonly syncError!: string | null;
  @ApiProperty() readonly createdAt!: Date;
  @ApiProperty() readonly updatedAt!: Date;

  @ApiPropertyOptional() readonly roomNumber?: string;
  @ApiPropertyOptional() readonly facilityId?: number;
  @ApiPropertyOptional() readonly reserveStatus?: number;
  @ApiPropertyOptional() readonly reservePeriodFrom?: Date | null;
  @ApiPropertyOptional() readonly reservePeriodTo?: Date | null;
  @ApiPropertyOptional() readonly directcheckinFlag?: boolean;
  @ApiPropertyOptional() readonly directcheckinType?: number | null;
  @ApiPropertyOptional() readonly updatedStaffName?: string | null;

  static fromEntity(entity: RoomPinCredentialWithRelations): SmartLockPinResponseDto {
    return Object.assign(new SmartLockPinResponseDto(), {
      roomPinCredentialId: entity.roomPinCredentialId,
      roomId: entity.roomId,
      reserveId: entity.reserveId,
      dataStatus: entity.dataStatus,
      maskedPin: entity.maskedPin,
      validFrom: entity.validFrom,
      validTo: entity.validTo,
      status: entity.status,
      issuedAt: entity.issuedAt,
      revokedAt: entity.revokedAt,
      expiredAt: entity.expiredAt,
      providerCredentialId: entity.providerCredentialId,
      providerPayload: entity.providerPayload,
      lastSyncAt: entity.lastSyncAt,
      syncError: entity.syncError,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      roomNumber: entity.room?.roomNumber,
      facilityId: entity.room?.facilityId,
      reserveStatus: entity.reserve?.reserveStatus,
      reservePeriodFrom: entity.reserve?.periodFrom,
      reservePeriodTo: entity.reserve?.periodTo,
      directcheckinFlag: entity.reserve?.directcheckinFlag,
      directcheckinType: entity.reserve?.directcheckinType,
      updatedStaffName: entity.updatedBy?.staffName ?? null,
    } satisfies Record<keyof SmartLockPinResponseDto, unknown>);
  }
}
