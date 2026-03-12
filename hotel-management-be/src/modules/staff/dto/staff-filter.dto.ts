import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '@common/dto/pagination.dto';

export class StaffFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '1=Admin, 2=Manager, 3=Staff, 4=Part-time' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  staffType?: number;

  @ApiPropertyOptional({ description: '0=Inactive, 1=Active, 2=Hidden' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2)
  dataStatus?: number;
}
