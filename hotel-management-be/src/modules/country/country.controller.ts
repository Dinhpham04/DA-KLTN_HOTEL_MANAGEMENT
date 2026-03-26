import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CountryService } from './country.service';
import { CountryResponseDto } from './dto';

@ApiTags('Country')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  @ApiOperation({ summary: 'List all active countries' })
  @ApiOkResponse({
    description: 'List of active countries',
    type: [CountryResponseDto],
  })
  findAll() {
    return this.countryService.findAll();
  }
}
