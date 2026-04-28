import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CopyCleaningDetailDto {
  @ApiProperty({ description: 'Target cleaning date (YYYY-MM-DD)' })
  @IsDateString()
  readonly targetDate!: string;
}
