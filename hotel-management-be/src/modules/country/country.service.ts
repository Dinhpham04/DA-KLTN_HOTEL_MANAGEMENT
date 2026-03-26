import { Injectable } from '@nestjs/common';
import { CountryRepository } from './country.repository';
import { CountryResponseDto } from './dto';

@Injectable()
export class CountryService {
  constructor(private readonly countryRepository: CountryRepository) {}

  async findAll(): Promise<CountryResponseDto[]> {
    const countries = await this.countryRepository.findAllActive();
    return countries.map(CountryResponseDto.fromEntity);
  }
}
