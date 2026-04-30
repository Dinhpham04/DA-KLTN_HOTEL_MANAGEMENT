import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export const DRAFT_EXPIRED_DATE_VALUES = [1, 2, 3] as const;
export type DraftExpiredDate = (typeof DRAFT_EXPIRED_DATE_VALUES)[number];

export class CreateReservationDraftDto {
  @ApiProperty({ description: 'Client ID giữ chỗ', example: 1 })
  @IsInt()
  @Min(1)
  readonly clientId!: number;

  @ApiProperty({ description: 'Facility ID', example: 1 })
  @IsInt()
  @Min(1)
  readonly facilityId!: number;

  @ApiProperty({ description: 'Room ID', example: 1 })
  @IsInt()
  @Min(1)
  readonly roomId!: number;

  @ApiProperty({ description: 'Bắt đầu giữ chỗ (ISO)', example: '2026-05-10T00:00:00Z' })
  @IsDateString()
  readonly periodFrom!: string;

  @ApiProperty({ description: 'Kết thúc giữ chỗ (ISO)', example: '2026-05-13T00:00:00Z' })
  @IsDateString()
  readonly periodTo!: string;

  @ApiPropertyOptional({
    description: 'Thời hạn giữ chỗ: 1=24h, 2=48h, 3=72h. Bỏ trống khi eternityDraft=true.',
    enum: DRAFT_EXPIRED_DATE_VALUES,
  })
  @ValidateIf((dto: CreateReservationDraftDto) => !dto.eternityDraft)
  @IsInt()
  @IsIn(DRAFT_EXPIRED_DATE_VALUES as unknown as number[])
  readonly expiredDate?: DraftExpiredDate;

  @ApiPropertyOptional({ description: 'Giữ chỗ vĩnh viễn (không expire)', default: false })
  @IsOptional()
  @IsBoolean()
  readonly eternityDraft?: boolean;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly note?: string;
}
