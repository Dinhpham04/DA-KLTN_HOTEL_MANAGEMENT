import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt } from 'class-validator';

export enum SaleDateUpdateType {
  ADD = 1,
  SUBTRACT = 2,
}

export class UpdateSaleDateDto {
  @ApiProperty({
    description: '1 = move sale date to tomorrow, 2 = revert to today',
    enum: SaleDateUpdateType,
    example: 1,
  })
  @IsInt()
  @IsIn([SaleDateUpdateType.ADD, SaleDateUpdateType.SUBTRACT])
  readonly type!: SaleDateUpdateType;
}
