import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCleansDto {
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
