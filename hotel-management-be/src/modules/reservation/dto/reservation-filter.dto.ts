import { IsInt, IsOptional, IsString, IsDateString, IsBoolean, IsArray, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@common/dto/pagination.dto';

function toNumberArray(value: unknown): number[] | undefined {
  const values = Array.isArray(value)
    ? value
    : value !== undefined && value !== null && value !== ''
      ? [value]
      : [];

  const parsed = values
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item));

  return parsed.length > 0 ? parsed : undefined;
}

function toBooleanArray(value: unknown): boolean[] | undefined {
  const values = Array.isArray(value)
    ? value
    : value !== undefined && value !== null && value !== ''
      ? [value]
      : [];

  const parsed = values
    .map((item) => {
      if (item === true || item === 1 || item === '1' || item === 'true') return true;
      if (item === false || item === 0 || item === '0' || item === 'false') return false;
      return undefined;
    })
    .filter((item): item is boolean => item !== undefined);

  return parsed.length > 0 ? parsed : undefined;
}

export class ReservationFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by client name or note' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by client/company name' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ description: 'Filter by occupier name' })
  @IsOptional()
  @IsString()
  occupierName?: string;

  @ApiPropertyOptional({ description: 'Filter by charge staff name' })
  @IsOptional()
  @IsString()
  chargeStaffName?: string;

  @ApiPropertyOptional({ description: 'Filter by facility no or room number' })
  @IsOptional()
  @IsString()
  facilityOrRoom?: string;

  @ApiPropertyOptional({ description: 'Filter by phone number' })
  @IsOptional()
  @IsString()
  telPhone?: string;

  @ApiPropertyOptional({ description: 'Filter by room type ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roomTypeId?: number;

  @ApiPropertyOptional({ description: 'Filter by created staff ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  createdStaffId?: number;

  @ApiPropertyOptional({ description: 'Filter by updated staff ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  updatedStaffId?: number;

  @ApiPropertyOptional({
    description: 'Filter by client types (1=Individual, 2=Corporation, 3=Special Corporation)',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => toNumberArray(value))
  @IsInt({ each: true })
  clientTypes?: number[];

  @ApiPropertyOptional({ description: 'Filter by UG flag on client' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === 1 || value === '1')
  @IsBoolean()
  ugFlag?: boolean;

  @ApiPropertyOptional({ description: 'Filter by confirmation flags', type: [Boolean] })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => toBooleanArray(value))
  @IsBoolean({ each: true })
  confirmFlags?: boolean[];

  @ApiPropertyOptional({ description: 'Filter by delete statuses (1=Deleted, 2=Cancelled, 3=NoShow)', type: [Number] })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => toNumberArray(value))
  @IsInt({ each: true })
  deleteStatuses?: number[];

  @ApiPropertyOptional({
    description: 'Filter by request/sale state (0=No request, 1=No sale, 2=Mismatch)',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => toNumberArray(value))
  @IsInt({ each: true })
  requestSaleTypes?: number[];

  @ApiPropertyOptional({ description: 'Filter by leaving type (before, staying, left)' })
  @IsOptional()
  @IsIn(['before', 'staying', 'left'])
  leavingType?: 'before' | 'staying' | 'left';

  @ApiPropertyOptional({ description: 'Filter by reservation status (1=Pending, 2=Confirmed, 3=CheckedIn, 4=CheckedOut, 5=Cancelled)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  reserveStatus?: number;

  @ApiPropertyOptional({ description: 'Filter by client ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clientId?: number;

  @ApiPropertyOptional({ description: 'Filter by facility ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  facilityId?: number;

  @ApiPropertyOptional({ description: 'Filter by room ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roomId?: number;

  @ApiPropertyOptional({ description: 'Filter by stay type ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  stayTypeId?: number;

  @ApiPropertyOptional({ description: 'Filter by data status (0=Unavailable, 1=Available, 2=Hidden)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dataStatus?: number;

  @ApiPropertyOptional({ description: 'Filter by delete status (1=Deleted, 2=Cancelled, 3=NoShow)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  deleteStatus?: number;

  @ApiPropertyOptional({ description: 'Filter by checkin flag' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1')
  @IsBoolean()
  checkinFlag?: boolean;

  @ApiPropertyOptional({ description: 'Filter by confirm flag' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1')
  @IsBoolean()
  confirmFlag?: boolean;

  @ApiPropertyOptional({ description: 'Filter by draft flag' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1')
  @IsBoolean()
  draftFlag?: boolean;

  @ApiPropertyOptional({ description: 'Filter by charge staff ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  chargeStaffId?: number;

  @ApiPropertyOptional({ description: 'Period from (ISO 8601 datetime)' })
  @IsOptional()
  @IsDateString()
  periodFrom?: string;

  @ApiPropertyOptional({ description: 'Period to (ISO 8601 datetime)' })
  @IsOptional()
  @IsDateString()
  periodTo?: string;
}
