import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@common/index';
import { PricingService } from './pricing.service';
import {
  CalculateFeesDto,
  CalculateFeesResponseDto,
  RequestTypeFilterDto,
  RequestTypeResponseDto,
} from './dto';

@ApiTags('Pricing')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('request-types')
  @ApiOperation({ summary: 'List active request types (fee categories)' })
  findRequestTypes(@Query() filter: RequestTypeFilterDto): Promise<RequestTypeResponseDto[]> {
    return this.pricingService.findRequestTypes(filter);
  }

  @Post('calculate-fees')
  @ApiOperation({ summary: 'Calculate reservation fees (rent, services, parking, tax)' })
  calculateFees(@Body() dto: CalculateFeesDto): Promise<CalculateFeesResponseDto> {
    return this.pricingService.calculateFees(dto);
  }
}
