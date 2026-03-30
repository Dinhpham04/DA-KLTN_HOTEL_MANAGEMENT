import { IsInt, IsString, IsOptional, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBicycleParkingDto {
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  readonly parentFacilityId!: number;

  @ApiProperty()
  @IsString()
  @MaxLength(32)
  readonly number!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  readonly notice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999999)
  @Type(() => Number)
  readonly orderNum?: number;
}
