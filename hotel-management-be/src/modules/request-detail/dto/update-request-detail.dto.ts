import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateRequestDetailDto } from './create-request-detail.dto';

export class UpdateRequestDetailDto extends PartialType(
  OmitType(CreateRequestDetailDto, ['reserveId'] as const),
) {}
