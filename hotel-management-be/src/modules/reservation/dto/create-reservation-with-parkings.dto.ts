import { Type } from 'class-transformer';
import { ValidateNested, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateReservationDto } from './create-reservation.dto';
import { CreateParkingReserveDto } from '@modules/parking-reserve/dto/create-parking-reserve.dto';
import { CreateBicycleParkingReserveDto } from '@modules/parking-reserve/dto/create-bicycle-parking-reserve.dto';

export class CreateReservationWithParkingsDto {
  @ApiProperty({ description: 'Reservation details' })
  @ValidateNested()
  @Type(() => CreateReservationDto)
  readonly reservation!: CreateReservationDto;

  @ApiPropertyOptional({ description: 'Parking reserves array', type: [CreateParkingReserveDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateParkingReserveDto)
  readonly parkingReserves?: CreateParkingReserveDto[];

  @ApiPropertyOptional({ description: 'Bicycle parking reserves array', type: [CreateBicycleParkingReserveDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateBicycleParkingReserveDto)
  readonly bicycleParkingReserves?: CreateBicycleParkingReserveDto[];
}
