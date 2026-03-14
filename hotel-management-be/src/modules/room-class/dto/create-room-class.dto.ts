import { IsString, IsOptional, IsInt, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomClassDto {
  @ApiProperty({ description: 'Room class name', maxLength: 256 })
  @IsString()
  @MaxLength(256)
  readonly roomClassName!: string;

  @ApiPropertyOptional({ description: 'Display order', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly orderNum?: number;
}
