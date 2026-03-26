import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import type { Country } from '@prisma/client';

@Injectable()
export class CountryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive(): Promise<Country[]> {
    return this.prisma.country.findMany({
      where: {
        active: true,
        deletedAt: null,
      },
      orderBy: {
        orderNum: 'asc',
      },
    });
  }

  async findById(countryId: number): Promise<Country | null> {
    return this.prisma.country.findFirst({
      where: {
        countryId,
        active: true,
        deletedAt: null,
      },
    });
  }
}
