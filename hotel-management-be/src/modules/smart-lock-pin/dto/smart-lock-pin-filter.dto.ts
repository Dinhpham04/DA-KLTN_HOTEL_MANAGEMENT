import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@common/dto/pagination.dto';

export class SmartLockPinFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by room ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roomId?: number;

  @ApiPropertyOptional({ description: 'Filter by reserve ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  reserveId?: number;

  @ApiPropertyOptional({ description: 'Filter by status: 1=Active, 2=Revoked, 3=Expired' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([1, 2, 3])
  status?: number;

  @ApiPropertyOptional({
    description: 'Filter by data status: 0=Unavailable, 1=Available, 2=Hidden',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1, 2])
  dataStatus?: number;

  @ApiPropertyOptional({ description: 'Filter by room number' })
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by provider credential ID (contains)' })
  @IsOptional()
  @IsString()
  providerCredentialId?: string;

  @ApiPropertyOptional({ description: 'Filter credential active at datetime (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  activeAt?: string;

  @ApiPropertyOptional({
    enum: ['roomPinCredentialId', 'validFrom', 'validTo', 'createdAt', 'updatedAt'],
    default: 'roomPinCredentialId',
  })
  @IsOptional()
  @IsIn(['roomPinCredentialId', 'validFrom', 'validTo', 'createdAt', 'updatedAt'])
  orderBy: 'roomPinCredentialId' | 'validFrom' | 'validTo' | 'createdAt' | 'updatedAt' =
    'roomPinCredentialId';
}
