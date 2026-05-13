import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import type { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentMethodRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<PaymentMethod[]> {
    return this.prisma.paymentMethod.findMany({
      where: { dataStatus: 1, deletedAt: null },
      orderBy: [{ paymentTypeId: 'asc' }, { paymentMethodId: 'asc' }],
    });
  }
}
