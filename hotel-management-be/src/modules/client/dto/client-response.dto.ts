import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Client, Country } from '@prisma/client';

type ClientWithRelations = Client & {
  country?: Country | null;
};

export class ClientResponseDto {
  @ApiProperty() readonly clientId!: number;
  @ApiProperty() readonly dataStatus!: number;
  @ApiProperty() readonly dataType!: number;
  @ApiProperty() readonly clientName!: string;
  @ApiPropertyOptional() readonly clientNameEn!: string | null;
  @ApiPropertyOptional() readonly birthday!: Date | null;
  @ApiProperty() readonly sex!: number;
  @ApiPropertyOptional() readonly contactName!: string | null;
  @ApiPropertyOptional() readonly contactNameEn!: string | null;
  @ApiPropertyOptional() readonly companyName!: string | null;
  @ApiPropertyOptional() readonly companyNameEn!: string | null;
  @ApiPropertyOptional() readonly email!: string | null;
  @ApiPropertyOptional() readonly zipCode!: string | null;
  @ApiPropertyOptional() readonly companyZipCode!: string | null;
  @ApiPropertyOptional() readonly countryId!: number | null;
  @ApiPropertyOptional() readonly address1!: string | null;
  @ApiPropertyOptional() readonly address2!: string | null;
  @ApiPropertyOptional() readonly companyAddress1!: string | null;
  @ApiPropertyOptional() readonly companyAddress2!: string | null;
  @ApiPropertyOptional() readonly tel!: string | null;
  @ApiPropertyOptional() readonly telPhone!: string | null;
  @ApiPropertyOptional() readonly telEmergency!: string | null;
  @ApiPropertyOptional() readonly companyTel!: string | null;
  @ApiPropertyOptional() readonly emergencyRelation!: string | null;
  @ApiPropertyOptional() readonly fax!: string | null;
  @ApiProperty() readonly postpaidFlag!: boolean;
  @ApiPropertyOptional() readonly advertisingType!: number | null;
  @ApiPropertyOptional() readonly memo!: string | null;
  @ApiProperty() readonly useCount!: number;
  @ApiProperty() readonly createdAt!: Date;
  @ApiProperty() readonly updatedAt!: Date;

  @ApiPropertyOptional() readonly countryName?: string;

  static fromEntity(client: ClientWithRelations): ClientResponseDto {
    return Object.assign(new ClientResponseDto(), {
      clientId: client.clientId,
      dataStatus: client.dataStatus,
      dataType: client.dataType,
      clientName: client.clientName,
      clientNameEn: client.clientNameEn,
      birthday: client.birthday,
      sex: client.sex,
      contactName: client.contactName,
      contactNameEn: client.contactNameEn,
      companyName: client.companyName,
      companyNameEn: client.companyNameEn,
      email: client.email,
      zipCode: client.zipCode,
      companyZipCode: client.companyZipCode,
      countryId: client.countryId,
      address1: client.address1,
      address2: client.address2,
      companyAddress1: client.companyAddress1,
      companyAddress2: client.companyAddress2,
      tel: client.tel,
      telPhone: client.telPhone,
      telEmergency: client.telEmergency,
      companyTel: client.companyTel,
      emergencyRelation: client.emergencyRelation,
      fax: client.fax,
      postpaidFlag: client.postpaidFlag,
      advertisingType: client.advertisingType,
      memo: client.memo,
      useCount: client.useCount,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      countryName: client.country?.countryNameEn,
    } satisfies Record<keyof ClientResponseDto, unknown>);
  }
}
