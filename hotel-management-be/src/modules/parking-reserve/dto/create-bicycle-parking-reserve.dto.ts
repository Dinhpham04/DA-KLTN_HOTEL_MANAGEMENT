import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBicycleParkingReserveDto {
  @ApiProperty({ description: 'Bicycle parking slot ID' })
  @IsInt()
  readonly bicycleParkingId!: number;

  @ApiPropertyOptional({ description: 'Linked reservation ID' })
  @IsOptional()
  @IsInt()
  readonly reserveId?: number;

  @ApiPropertyOptional({ description: 'Client ID' })
  @IsOptional()
  @IsInt()
  readonly clientId?: number;

  @ApiProperty({ description: 'Start date (YYYY-MM-DD)' })
  @IsDateString()
  readonly periodFrom!: string;

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  readonly periodTo?: string;

  @ApiPropertyOptional({ description: 'Stay type ID' })
  @IsOptional()
  @IsInt()
  readonly stayTypeId?: number;

  @ApiPropertyOptional({ description: 'Confirm flag' })
  @IsOptional()
  @IsBoolean()
  readonly confirmFlag?: boolean;

  @ApiPropertyOptional({ description: 'Bicycle type note', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly bicycleTypeNote?: string;

  @ApiPropertyOptional({ description: 'Note', maxLength: 512 })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  readonly note?: string;

  @ApiPropertyOptional({ description: 'Sale date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  readonly saleDate?: string;
}
