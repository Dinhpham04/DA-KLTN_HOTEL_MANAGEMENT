import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateParkingReserveDto } from './create-parking-reserve.dto';

export class UpdateParkingReserveDto extends PartialType(CreateParkingReserveDto) {
  @ApiPropertyOptional({ description: 'Checkin flag' })
  @IsOptional()
  @IsBoolean()
  readonly checkinFlag?: boolean;

  @ApiPropertyOptional({ description: 'Checkout flag' })
  @IsOptional()
  @IsBoolean()
  readonly checkoutFlag?: boolean;
}
