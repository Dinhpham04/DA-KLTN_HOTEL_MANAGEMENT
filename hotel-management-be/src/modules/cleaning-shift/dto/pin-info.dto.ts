import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PinInfoDto {
  @ApiProperty()
  roomPinCredentialId!: number;

  @ApiProperty({ description: 'Masked PIN, e.g. ****34' })
  maskedPin!: string;

  @ApiProperty({ description: '1=active, 2=revoked, 3=expired' })
  status!: number;

  @ApiProperty()
  validFrom!: Date;

  @ApiProperty()
  validTo!: Date;

  @ApiPropertyOptional({ nullable: true })
  revokedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  expiredAt!: Date | null;

  @ApiProperty({ description: 'True when pin is no longer active (revoked or expired)' })
  revokedOk!: boolean;
}
