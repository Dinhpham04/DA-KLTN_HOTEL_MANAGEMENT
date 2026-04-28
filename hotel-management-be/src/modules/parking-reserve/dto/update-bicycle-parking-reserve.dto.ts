import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateBicycleParkingReserveDto } from './create-bicycle-parking-reserve.dto';

export class UpdateBicycleParkingReserveDto extends PartialType(CreateBicycleParkingReserveDto) {
  @ApiPropertyOptional({ description: 'Checkin flag' })
  @IsOptional()
  @IsBoolean()
  readonly checkinFlag?: boolean;

  @ApiPropertyOptional({ description: 'Checkout flag' })
  @IsOptional()
  @IsBoolean()
  readonly checkoutFlag?: boolean;
}
