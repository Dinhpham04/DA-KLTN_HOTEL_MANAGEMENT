import {
  IsInt,
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEmail,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ description: 'Client type (0=Not specified, 1=Individual, 2=Corporation, 3=Special Corporation)' })
  @IsInt()
  @Min(0)
  @Max(3)
  readonly dataType!: number;

  @ApiProperty({ description: 'Client name', maxLength: 256 })
  @IsString()
  @MaxLength(256)
  readonly clientName!: string;

  @ApiPropertyOptional({ description: 'Client name in English', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly clientNameEn?: string;

  @ApiPropertyOptional({ description: 'Birthday (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  readonly birthday?: string;

  @ApiPropertyOptional({ description: 'Sex (1=Male, 2=Female, 9=Other)', default: 9 })
  @IsOptional()
  @IsInt()
  readonly sex?: number;

  @ApiPropertyOptional({ description: 'Contact person name', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly contactName?: string;

  @ApiPropertyOptional({ description: 'Contact person name in English', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly contactNameEn?: string;

  @ApiPropertyOptional({ description: 'Company name', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly companyName?: string;

  @ApiPropertyOptional({ description: 'Company name in English', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly companyNameEn?: string;

  @ApiPropertyOptional({ description: 'Email address', maxLength: 256 })
  @IsOptional()
  @IsEmail()
  @MaxLength(256)
  readonly email?: string;

  @ApiPropertyOptional({ description: 'Zip code', maxLength: 9 })
  @IsOptional()
  @IsString()
  @MaxLength(9)
  readonly zipCode?: string;

  @ApiPropertyOptional({ description: 'Company zip code', maxLength: 9 })
  @IsOptional()
  @IsString()
  @MaxLength(9)
  readonly companyZipCode?: string;

  @ApiPropertyOptional({ description: 'Country ID' })
  @IsOptional()
  @IsInt()
  readonly countryId?: number;

  @ApiPropertyOptional({ description: 'Address line 1', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly address1?: string;

  @ApiPropertyOptional({ description: 'Address line 2', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly address2?: string;

  @ApiPropertyOptional({ description: 'Company address line 1', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly companyAddress1?: string;

  @ApiPropertyOptional({ description: 'Company address line 2', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly companyAddress2?: string;

  @ApiPropertyOptional({ description: 'Phone number', maxLength: 18 })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  readonly tel?: string;

  @ApiPropertyOptional({ description: 'Mobile phone', maxLength: 18 })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  readonly telPhone?: string;

  @ApiPropertyOptional({ description: 'Emergency phone', maxLength: 18 })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  readonly telEmergency?: string;

  @ApiPropertyOptional({ description: 'Company phone', maxLength: 16 })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  readonly companyTel?: string;

  @ApiPropertyOptional({ description: 'Emergency contact relation', maxLength: 256 })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly emergencyRelation?: string;

  @ApiPropertyOptional({ description: 'Fax number', maxLength: 18 })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  readonly fax?: string;

  @ApiPropertyOptional({ description: 'Post-paid flag', default: false })
  @IsOptional()
  @IsBoolean()
  readonly postpaidFlag?: boolean;

  @ApiPropertyOptional({ description: 'Advertising type' })
  @IsOptional()
  @IsInt()
  readonly advertisingType?: number;

  @ApiPropertyOptional({ description: 'Memo' })
  @IsOptional()
  @IsString()
  readonly memo?: string;
}
