import {
  IsInt,
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIdentificationDto {
  @ApiProperty({ description: 'Identification type (1=Passport, 2=CCCD, 3=CMND, 4=Driver License, 5=Residence Card, 9=Other)' })
  @IsInt()
  @Min(1)
  @Max(9)
  readonly identificationType!: number;

  @ApiPropertyOptional({ description: 'Custom type name when type=9 (Other)', maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  readonly identificationTypeInput?: string;

  @ApiPropertyOptional({ description: 'Input type (1=Image, 2=Manual Input)', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2)
  readonly identificationInputType?: number;

  @ApiPropertyOptional({ description: 'Image path', maxLength: 1024 })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  readonly imagePath?: string;

  @ApiPropertyOptional({ description: 'Identification number', maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  readonly identificationNumber?: string;

  @ApiPropertyOptional({ description: 'Expiration date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  readonly expirationDate?: string;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
}
