import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RequestTypeFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by category',
    enum: ['rent', 'service', 'parking', 'trunkroom', 'deposit', 'discount', 'other'],
  })
  @IsOptional()
  @IsString()
  category?: string;
}
