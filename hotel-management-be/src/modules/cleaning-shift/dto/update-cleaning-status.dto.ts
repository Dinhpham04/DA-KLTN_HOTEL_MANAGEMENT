import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CleaningStatus } from '../enums';

export class UpdateCleaningStatusDto {
  @ApiProperty({ enum: CleaningStatus, description: 'New status (1..7)' })
  @IsEnum(CleaningStatus)
  readonly cleanStatus!: CleaningStatus;
}
