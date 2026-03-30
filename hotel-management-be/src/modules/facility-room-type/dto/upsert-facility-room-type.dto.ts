import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class RoomTypeAcreageDto {
  @ApiProperty({ description: 'Room type ID' })
  @IsInt()
  readonly roomTypeId!: number;

  @ApiProperty({ description: 'Acreage value (m²)', required: false, nullable: true })
  @IsOptional()
  @IsString()
  readonly acreage!: string | null;
}

export class FacilityAcreageDto {
  @ApiProperty({ description: 'Facility ID' })
  @IsInt()
  readonly facilityId!: number;

  @ApiProperty({ description: 'Room types with acreage', type: [RoomTypeAcreageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomTypeAcreageDto)
  readonly roomTypes!: RoomTypeAcreageDto[];
}

export class UpsertFacilityRoomTypeDto {
  @ApiProperty({ description: 'Facilities with room type acreages', type: [FacilityAcreageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacilityAcreageDto)
  readonly facilities!: FacilityAcreageDto[];
}
