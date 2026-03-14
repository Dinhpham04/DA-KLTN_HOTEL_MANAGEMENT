import { IsString, IsInt, IsOptional, MaxLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoomTypeDto {
  @ApiPropertyOptional({ description: 'Room class ID' })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly roomClassId?: number;

  @ApiPropertyOptional({ description: 'Data status (0=Unavailable, 1=Available, 2=Hidden)' })
  @IsOptional()
  @IsInt()
  readonly dataStatus?: number;

  @ApiPropertyOptional({ description: 'Room type name', maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  readonly roomTypeName?: string;

  @ApiPropertyOptional({ description: 'Room type short name', maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  readonly roomTypeNameShort?: string;

  @ApiPropertyOptional({ description: 'Acreage (sqm)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly acreage?: number;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly orderNum?: number;

  @ApiPropertyOptional({ description: 'Deposit display order' })
  @IsOptional()
  @IsInt()
  readonly orderNumDeposit?: number;
}
