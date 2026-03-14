import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFacilityDto {
  @ApiProperty({ description: 'Facility number (3-char code)', maxLength: 3 })
  @IsString()
  @MaxLength(3)
  readonly facilityNo!: string;

  @ApiProperty({ description: 'Facility name', maxLength: 256 })
  @IsString()
  @MaxLength(256)
  readonly facilityName!: string;

  @ApiProperty({ description: 'Facility name (English)', maxLength: 256 })
  @IsString()
  @MaxLength(256)
  readonly facilityNameEn!: string;

  @ApiProperty({ description: 'Zip code', maxLength: 9 })
  @IsString()
  @MaxLength(9)
  readonly zipCode!: string;

  @ApiProperty({ description: 'Address', maxLength: 256 })
  @IsString()
  @MaxLength(256)
  readonly address!: string;

  @ApiProperty({ description: 'Address (English)', maxLength: 512 })
  @IsString()
  @MaxLength(512)
  readonly addressEn!: string;

  @ApiPropertyOptional({ description: 'Facility type (1=Hotel, 2=TrunkRoom)', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly facilityType?: number;

  @ApiPropertyOptional({ description: 'Key function', default: false })
  @IsOptional()
  @IsBoolean()
  readonly keyFunction?: boolean;

  @ApiPropertyOptional({ description: 'Has shared place', default: false })
  @IsOptional()
  @IsBoolean()
  readonly sharePlaceFlag?: boolean;

  @ApiPropertyOptional({ description: 'Has parking', default: false })
  @IsOptional()
  @IsBoolean()
  readonly parkingFlag?: boolean;

  @ApiPropertyOptional({ description: 'Parking image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  readonly parkingImg?: string;

  @ApiPropertyOptional({ description: 'Has bicycle parking', default: false })
  @IsOptional()
  @IsBoolean()
  readonly bicycleParkingFlag?: boolean;

  @ApiPropertyOptional({ description: 'Bicycle parking image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  readonly bicycleParkingImg?: string;

  @ApiPropertyOptional({ description: 'Has delivery box', default: false })
  @IsOptional()
  @IsBoolean()
  readonly deliveryboxFlag?: boolean;

  @ApiPropertyOptional({ description: 'Memo', maxLength: 1024 })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  readonly memo?: string;

  @ApiPropertyOptional({ description: 'Display order', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly orderNum?: number;

  @ApiPropertyOptional({ description: 'Color option code', maxLength: 128 })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  readonly colorOption?: string;
}
