import { IsString, IsOptional, IsInt, MaxLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoomClassDto {
  @ApiPropertyOptional({ description: 'Room class name', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly roomClassName?: string;

  @ApiPropertyOptional({ description: 'Data status (0=Unavailable, 1=Available, 2=Hidden)' })
  @IsOptional()
  @IsInt()
  readonly dataStatus?: number;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly orderNum?: number;
}
