import { IsArray, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateParkingOrderDto {
  @ApiProperty({ description: 'Ordered array of parking IDs', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  readonly ids!: number[];
}
