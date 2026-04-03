import { IsInt, IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@common/dto/pagination.dto';

export class ReservationFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by client name or note' })
  @IsOptional()
  @IsString()
  search?: string;

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
