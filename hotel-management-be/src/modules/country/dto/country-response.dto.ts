import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Country } from '@prisma/client';

export class CountryResponseDto {
  @ApiProperty({ description: 'Country ID' })
  countryId!: number;

  @ApiProperty({ description: 'Country name (Vietnamese)' })
  countryName!: string;

  @ApiProperty({ description: 'Country name (English)' })
  countryNameEn!: string;

  @ApiPropertyOptional({ description: 'ISO country code (e.g., VN, JP)' })
  code?: string | null;

  @ApiProperty({ description: 'Display order' })
  orderNum!: number;

  static fromEntity(entity: Country): CountryResponseDto {
    const dto = new CountryResponseDto();
    dto.countryId = entity.countryId;
    dto.countryName = entity.countryName;
    dto.countryNameEn = entity.countryNameEn;
    dto.code = entity.code;
    dto.orderNum = entity.orderNum;
    return dto;
  }
}
