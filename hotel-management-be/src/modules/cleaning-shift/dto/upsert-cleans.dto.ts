import { IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertCleansDto {
  @ApiProperty({ description: 'Facility ID' })
  @IsInt()
  readonly facilityId!: number;

  @ApiProperty({ description: 'Cleaning date (YYYY-MM-DD)' })
  @IsDateString()
  readonly cleaningDate!: string;

  @ApiPropertyOptional({ description: 'Note', maxLength: 1024 })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  readonly note?: string;

  @ApiPropertyOptional({ description: 'Rest time from (ISO datetime)' })
  @IsOptional()
  @IsDateString()
  readonly restTimeFrom?: string;

  @ApiPropertyOptional({ description: 'Rest time to (ISO datetime)' })
  @IsOptional()
  @IsDateString()
  readonly restTimeTo?: string;
}
