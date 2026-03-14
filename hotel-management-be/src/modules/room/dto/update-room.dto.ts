import {
  IsInt,
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoomDto {
  @ApiPropertyOptional({ description: 'Facility ID' })
  @IsOptional()
  @IsInt()
  readonly facilityId?: number;

  @ApiPropertyOptional({ description: 'Room type ID' })
  @IsOptional()
  @IsInt()
  readonly roomTypeId?: number;

  @ApiPropertyOptional({ description: 'Data status (0=Unavailable, 1=Available, 2=Hidden)' })
  @IsOptional()
  @IsInt()
  readonly dataStatus?: number;

  @ApiPropertyOptional({ description: 'Room number', maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  readonly roomNumber?: string;

  @ApiPropertyOptional({ description: 'Key type (0=Room, 1=Cleaning)' })
  @IsOptional()
  @IsInt()
  readonly keyType?: number;

  @ApiPropertyOptional({ description: 'Room status (1=Full Cleaning, 2=Partial, 3=Finishing)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly roomStatus?: number;

  @ApiPropertyOptional({ description: 'Reserved clean day' })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly reservedCleanDay?: number;

  @ApiPropertyOptional({ description: 'Has delivery box' })
  @IsOptional()
  @IsBoolean()
  readonly deliveryboxFlag?: boolean;

  @ApiPropertyOptional({ description: 'Allows pets' })
  @IsOptional()
  @IsBoolean()
  readonly petFlag?: boolean;

  @ApiPropertyOptional({ description: 'Mailbox password', maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  readonly mailboxPassword?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly orderNum?: number;

  @ApiPropertyOptional({ description: 'External room flag' })
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
