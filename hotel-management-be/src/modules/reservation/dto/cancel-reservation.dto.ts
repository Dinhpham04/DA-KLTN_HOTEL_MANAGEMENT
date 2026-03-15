import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CancelReservationDto {
  @ApiPropertyOptional({ description: 'Cancellation reason', maxLength: 512 })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  readonly cancelReason?: string;
}
