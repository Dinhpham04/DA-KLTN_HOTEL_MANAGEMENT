import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReservationDraftResponseDto {
  @ApiProperty() readonly reserveId!: number;
  @ApiProperty() readonly clientId!: number;
  @ApiProperty() readonly facilityId!: number;
  @ApiProperty() readonly roomId!: number;
  @ApiProperty() readonly periodFrom!: Date;
  @ApiProperty() readonly periodTo!: Date;
  @ApiProperty() readonly draftFlag!: boolean;
  @ApiProperty() readonly eternityDraft!: boolean;
  @ApiPropertyOptional({ nullable: true }) readonly expiredDate!: number | null;
  @ApiPropertyOptional({ nullable: true }) readonly note!: string | null;
  @ApiProperty() readonly createdAt!: Date;

  static fromEntity(entity: {
    reserveId: number;
    clientId: number | null;
    facilityId: number | null;
    roomId: number | null;
    periodFrom: Date | null;
    periodTo: Date | null;
    draftFlag: boolean;
    eternityDraft: boolean;
    expiredDate: number | null;
    note: string | null;
    createdAt: Date;
  }): ReservationDraftResponseDto {
    const dto = new ReservationDraftResponseDto();
    Object.assign(dto, {
      reserveId: entity.reserveId,
      clientId: entity.clientId!,
      facilityId: entity.facilityId!,
      roomId: entity.roomId!,
      periodFrom: entity.periodFrom!,
      periodTo: entity.periodTo!,
      draftFlag: entity.draftFlag,
      eternityDraft: entity.eternityDraft,
      expiredDate: entity.expiredDate,
      note: entity.note,
      createdAt: entity.createdAt,
    });
    return dto;
  }
}
