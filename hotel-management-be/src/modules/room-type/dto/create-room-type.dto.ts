import { IsString, IsInt, IsOptional, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomTypeDto {
  @ApiProperty({ description: 'Room class ID' })
  @IsInt()
  @Min(1)
  readonly roomClassId!: number;

  @ApiProperty({ description: 'Room type name', maxLength: 32 })
  @IsString()
  @MaxLength(32)
  readonly roomTypeName!: string;

  @ApiProperty({ description: 'Room type short name', maxLength: 32 })
  @IsString()
  @MaxLength(32)
  readonly roomTypeNameShort!: string;

  @ApiPropertyOptional({ description: 'Acreage (sqm)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly acreage?: number;

  @ApiPropertyOptional({ description: 'Display order', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly orderNum?: number;

  @ApiPropertyOptional({ description: 'Deposit display order' })
  @IsOptional()
  @IsInt()
  readonly orderNumDeposit?: number;
}
