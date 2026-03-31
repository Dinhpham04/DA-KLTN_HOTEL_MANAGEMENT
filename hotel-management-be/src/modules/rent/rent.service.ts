import { Injectable } from '@nestjs/common';
import { RentRepository } from './rent.repository';
import { RentFilterDto, BulkUpdateRentDto, RentGroupResponseDto } from './dto';

@Injectable()
export class RentService {
  constructor(private readonly rentRepository: RentRepository) { }

  async findRentList(filter: RentFilterDto): Promise<{ rents: RentGroupResponseDto[] }> {
    const depositFlag = filter.depositFlag ?? 0;
    const data = await this.rentRepository.findRentList(depositFlag);
    return {
      rents: data.map(RentGroupResponseDto.fromEntity),
    };
  }

  async bulkUpdateNotDeposited(dto: BulkUpdateRentDto, staffId: number): Promise<void> {
    await this.rentRepository.bulkUpdateNotDeposited(dto, staffId);
  }

  async bulkUpdateDeposited(dto: BulkUpdateRentDto, staffId: number): Promise<void> {
    await this.rentRepository.bulkUpdateDeposited(dto, staffId);
  }
}
