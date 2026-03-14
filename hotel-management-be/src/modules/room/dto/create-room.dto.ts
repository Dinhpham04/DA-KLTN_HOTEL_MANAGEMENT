import {
  IsInt,
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ description: 'Facility ID' })
  @IsInt()
  readonly facilityId!: number;

  @ApiProperty({ description: 'Room type ID' })
  @IsInt()
  readonly roomTypeId!: number;

  @ApiProperty({ description: 'Room number', maxLength: 32 })
  @IsString()
  @MaxLength(32)
  readonly roomNumber!: string;

  @ApiPropertyOptional({ description: 'Key type (0=Room, 1=Cleaning)' })
  @IsOptional()
  @IsInt()
  readonly keyType?: number;

  @ApiProperty({ description: 'Room status (1=Full Cleaning, 2=Partial, 3=Finishing)' })
  @IsInt()
  @Min(1)
  readonly roomStatus!: number;

  @ApiPropertyOptional({ description: 'Reserved clean day', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly reservedCleanDay?: number;

  @ApiPropertyOptional({ description: 'Has delivery box', default: false })
  @IsOptional()
  @IsBoolean()
  readonly deliveryboxFlag?: boolean;

  @ApiPropertyOptional({ description: 'Allows pets', default: false })
  @IsOptional()
  @IsBoolean()
  readonly petFlag?: boolean;

  @ApiProperty({ description: 'Mailbox password', maxLength: 64 })
  @IsString()
  @MaxLength(64)
  readonly mailboxPassword!: string;

  @ApiPropertyOptional({ description: 'Display order', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly orderNum?: number;

  @ApiPropertyOptional({ description: 'External room flag', default: false })
  @IsOptional()
  @IsBoolean()
  readonly externalFlag?: boolean;

  @ApiPropertyOptional({ description: 'External date from (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  readonly externalDateFrom?: string;

  @ApiPropertyOptional({ description: 'External date to (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  readonly externalDateTo?: string;
}
