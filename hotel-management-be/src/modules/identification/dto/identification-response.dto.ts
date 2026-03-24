import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Identification } from '@prisma/client';

export class IdentificationResponseDto {
  @ApiProperty() readonly identificationId!: number;
  @ApiProperty() readonly clientId!: number;
  @ApiProperty() readonly identificationType!: number;
  @ApiPropertyOptional() readonly identificationTypeInput!: string | null;
  @ApiPropertyOptional() readonly identificationInputType!: number | null;
  @ApiPropertyOptional() readonly imagePath!: string | null;
  @ApiPropertyOptional() readonly identificationNumber!: string | null;
  @ApiPropertyOptional() readonly expirationDate!: Date | null;
  @ApiProperty() readonly active!: boolean;
  @ApiProperty() readonly createdAt!: Date;
  @ApiProperty() readonly updatedAt!: Date;

  static fromEntity(identification: Identification): IdentificationResponseDto {
    return Object.assign(new IdentificationResponseDto(), {
      identificationId: identification.identificationId,
      clientId: identification.clientId,
      identificationType: identification.identificationType,
      identificationTypeInput: identification.identificationTypeInput,
      identificationInputType: identification.identificationInputType,
      imagePath: identification.imagePath,
      identificationNumber: identification.identificationNumber,
      expirationDate: identification.expirationDate,
      active: identification.active,
      createdAt: identification.createdAt,
      updatedAt: identification.updatedAt,
    } satisfies Record<keyof IdentificationResponseDto, unknown>);
  }
}
