import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RentFeeDto {
  @ApiProperty() unitPrice!: number;
  @ApiProperty() count!: number;
  @ApiProperty() totalPrice!: number;
  @ApiProperty() description!: string;
}

export class ServiceFeeDto {
  @ApiProperty() requestTypeId!: number;
  @ApiProperty() requestTypeName!: string;
  @ApiProperty() unitPrice!: number;
  @ApiProperty() count!: number;
  @ApiProperty() countUnit!: number;
  @ApiProperty() totalPrice!: number;
}

export class ParkingFeeDto {
  @ApiProperty() parkingId!: number;
  @ApiProperty() unitPrice!: number;
  @ApiProperty() count!: number;
  @ApiProperty() totalPrice!: number;
}

export class CalculateFeesResponseDto {
  @ApiProperty({ type: RentFeeDto }) rentFee!: RentFeeDto;
  @ApiProperty({ type: [ServiceFeeDto] }) rentExtraFees!: ServiceFeeDto[];
  @ApiProperty({ type: [ServiceFeeDto] }) serviceFees!: ServiceFeeDto[];
  @ApiPropertyOptional({ type: ParkingFeeDto }) parkingFee?: ParkingFeeDto;
  @ApiProperty() isTaxFree!: boolean;
  @ApiProperty() subtotal!: number;
  @ApiProperty() tax!: number;
  @ApiProperty() totalPrice!: number;
}
