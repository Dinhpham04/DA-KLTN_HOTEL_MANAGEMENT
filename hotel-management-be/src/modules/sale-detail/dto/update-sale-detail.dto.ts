import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSaleDetailDto } from './create-sale-detail.dto';

export class UpdateSaleDetailDto extends PartialType(
  OmitType(CreateSaleDetailDto, ['reserveId'] as const),
) {}
