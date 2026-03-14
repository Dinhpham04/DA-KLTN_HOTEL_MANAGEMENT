import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoomStatusDto {
  @ApiProperty({ description: 'Room status (1=Full Cleaning, 2=Partial, 3=Finishing)' })
  @IsInt()
  @Min(1)
  @Max(3)
  readonly roomStatus!: number;
}
