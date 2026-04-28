import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CleaningDetailResponseDto } from './cleaning-detail-response.dto';

export class CleansResponseDto {
  @ApiProperty()
  cleanId!: number;

  @ApiProperty()
  facilityId!: number;

  @ApiProperty()
  cleaningDate!: Date;

  @ApiPropertyOptional({ nullable: true })
  note!: string | null;

  @ApiPropertyOptional({ nullable: true })
  restTimeFrom!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  restTimeTo!: Date | null;

  @ApiProperty({ type: () => [CleaningDetailResponseDto] })
  details!: CleaningDetailResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
