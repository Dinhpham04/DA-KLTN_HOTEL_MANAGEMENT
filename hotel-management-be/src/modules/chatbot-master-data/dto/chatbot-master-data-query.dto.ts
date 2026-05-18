import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return value === true || value === 'true' || value === '1' || value === 1;
}

export class ChatbotMasterDataQueryDto {
  @IsOptional()
  @IsString()
  readonly search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readonly facilityId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readonly roomTypeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readonly roomClassId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readonly stayTypeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readonly depositFlag?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readonly dataStatus?: number;

  @IsOptional()
  @IsString()
  readonly category?: string;

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  readonly includeRooms?: boolean;

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  readonly includePricing?: boolean;

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  readonly includePrices?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly limit?: number;
}
