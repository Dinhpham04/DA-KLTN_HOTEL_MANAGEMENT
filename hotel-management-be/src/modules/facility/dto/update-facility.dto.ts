import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFacilityDto {
  @ApiPropertyOptional({ description: 'Data status (0=Unavailable, 1=Available, 2=Hidden)' })
  @IsOptional()
  @IsInt()
  readonly dataStatus?: number;

  @ApiPropertyOptional({ description: 'Facility type (1=Hotel, 2=TrunkRoom)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly facilityType?: number;

  @ApiPropertyOptional({ description: 'Facility number', maxLength: 3 })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  readonly facilityNo?: string;

  @ApiPropertyOptional({ description: 'Facility name', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly facilityName?: string;

  @ApiPropertyOptional({ description: 'Facility name (English)', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly facilityNameEn?: string;

  @ApiPropertyOptional({ description: 'Zip code', maxLength: 9 })
  @IsOptional()
  @IsString()
  @MaxLength(9)
  readonly zipCode?: string;

  @ApiPropertyOptional({ description: 'Address', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly address?: string;

  @ApiPropertyOptional({ description: 'Address (English)', maxLength: 512 })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  readonly addressEn?: string;

  @ApiPropertyOptional({ description: 'Key function' })
  @IsOptional()
  @IsBoolean()
  readonly keyFunction?: boolean;

  @ApiPropertyOptional({ description: 'Has shared place' })
  @IsOptional()
  @IsBoolean()
  readonly sharePlaceFlag?: boolean;

  @ApiPropertyOptional({ description: 'Has parking' })
  @IsOptional()
  @IsBoolean()
  readonly parkingFlag?: boolean;

  @ApiPropertyOptional({ description: 'Parking image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  readonly parkingImg?: string;

  @ApiPropertyOptional({ description: 'Has bicycle parking' })
  @IsOptional()
  @IsBoolean()
  readonly bicycleParkingFlag?: boolean;

  @ApiPropertyOptional({ description: 'Bicycle parking image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  readonly bicycleParkingImg?: string;

  @ApiPropertyOptional({ description: 'Has delivery box' })
  @IsOptional()
  @IsBoolean()
  readonly deliveryboxFlag?: boolean;

  @ApiPropertyOptional({ description: 'Memo', maxLength: 1024 })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  readonly memo?: string;

  @ApiPropertyOptional({ description: 'Display order' })
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
