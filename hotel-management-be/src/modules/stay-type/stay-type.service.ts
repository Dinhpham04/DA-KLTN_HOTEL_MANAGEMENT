import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { StayTypeResponseDto } from './dto';

@Injectable()
export class StayTypeService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(): Promise<StayTypeResponseDto[]> {
    const stayTypes = await this.prisma.stayType.findMany({
      where: { active: true, deletedAt: null },
      orderBy: { orderNum: 'asc' },
    });

    return stayTypes.map(StayTypeResponseDto.fromEntity);
  }
}
