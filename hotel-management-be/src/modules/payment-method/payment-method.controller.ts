import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@common/index';
import { PaymentMethodService } from './payment-method.service';

@ApiTags('PaymentMethod')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly service: PaymentMethodService) {}

  @Get()
  @ApiOperation({ summary: 'List active payment methods (for dropdown)' })
  findAll() {
    return this.service.findAll();
  }
}
