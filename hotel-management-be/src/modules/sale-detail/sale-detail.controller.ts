import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, JwtOrInternalAutomationGuard, RolesGuard } from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { SaleDetailService } from './sale-detail.service';
import { CreateSaleDetailDto, SaleDetailFilterDto, UpdateSaleDetailDto } from './dto';

@ApiTags('SaleDetail')
@ApiBearerAuth()
@Controller('sale-details')
export class SaleDetailController {
  constructor(private readonly service: SaleDetailService) {}

  @Get()
  @UseGuards(JwtOrInternalAutomationGuard, RolesGuard)
  @ApiOperation({ summary: 'List payment records for a reservation' })
  findAll(@Query() filter: SaleDetailFilterDto) {
    return this.service.findByReserveId(filter.reserveId ?? 0);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Record a payment' })
  create(@Body() dto: CreateSaleDetailDto, @CurrentUser() user: CurrentStaff) {
    return this.service.create(dto, user.staffId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Update a payment record' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSaleDetailDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.update(id, dto, user.staffId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a payment record' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentStaff) {
    return this.service.remove(id, user.staffId);
  }
}
