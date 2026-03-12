import {
  IsString,
  IsEmail,
  IsInt,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStaffDto {
  @ApiPropertyOptional({ example: 1, description: '1=Admin, 2=Manager, 3=Staff, 4=Part-time' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  readonly staffType?: number;

  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly staffName?: string;

  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly staffNameEn?: string;

  @ApiPropertyOptional({ example: 'NVA' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  readonly staffNameShort?: string;

  @ApiPropertyOptional({ example: 1, description: '1=Male, 2=Female, 9=Other' })
  @IsOptional()
  @IsInt()
  readonly sex?: number;

  @ApiPropertyOptional({ example: '100-0001' })
  @IsOptional()
  @IsString()
  @MaxLength(9)
  readonly zipCode?: string;

  @ApiPropertyOptional({ example: '123 Main St' })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  readonly address?: string;

  @ApiPropertyOptional({ example: 'staff@hotel.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(256)
  readonly mail?: string;

  @ApiPropertyOptional({ example: 'newpassword123', minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  readonly password?: string;

  @ApiPropertyOptional({ example: '090-1234-5678' })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  readonly tel?: string;

  @ApiPropertyOptional({ example: '03-1234-5678' })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  readonly businessTel?: string;

  @ApiPropertyOptional({ example: '080-9876-5432' })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  readonly emergencyTel?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  readonly orderNum?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  readonly displayInAttendance?: boolean;

  @ApiPropertyOptional({ example: 0, description: '0=Inactive, 1=Active, 2=Hidden' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  readonly dataStatus?: number;
}
