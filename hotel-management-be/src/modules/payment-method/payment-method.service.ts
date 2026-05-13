import { Injectable } from '@nestjs/common';
import { PaymentMethodRepository } from './payment-method.repository';
import { PaymentMethodResponseDto } from './dto';

@Injectable()
export class PaymentMethodService {
  constructor(private readonly repo: PaymentMethodRepository) {}

  async findAll(): Promise<{ data: PaymentMethodResponseDto[] }> {
    const items = await this.repo.findAll();
    return { data: items.map(PaymentMethodResponseDto.fromEntity) };
  }
}
