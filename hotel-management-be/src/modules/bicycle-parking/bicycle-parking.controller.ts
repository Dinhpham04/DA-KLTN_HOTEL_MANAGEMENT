import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles, CurrentUser } from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { StaffType } from '@common/enums/index';
import { BicycleParkingService } from './bicycle-parking.service';
import {
  CreateBicycleParkingDto,
  UpdateBicycleParkingDto,
  BicycleParkingFilterDto,
  UpdateBicycleParkingOrderDto,
} from './dto';

@ApiTags('Bicycle Parking')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('bicycle-parkings')
export class BicycleParkingController {
  constructor(private readonly bicycleParkingService: BicycleParkingService) { }

  @Get()
  @Roles(StaffType.ADMIN, StaffType.STAFF)
  @ApiOperation({ summary: 'Get bicycle parkings list (filter by facility)' })
  findAll(@Query() filter: BicycleParkingFilterDto) {
    return this.bicycleParkingService.findAll(filter);
  }

  @Post()
  @Roles(StaffType.ADMIN, StaffType.STAFF)
  @ApiOperation({ summary: 'Create new bicycle parking' })
  create(@Body() dto: CreateBicycleParkingDto, @CurrentUser() user: CurrentStaff) {
    return this.bicycleParkingService.create(dto, user.staffId);
  }

  @Patch('order/update')
  @Roles(StaffType.ADMIN, StaffType.STAFF)
  @ApiOperation({ summary: 'Update bicycle parking order' })
  updateOrder(@Body() dto: UpdateBicycleParkingOrderDto, @CurrentUser() user: CurrentStaff) {
    return this.bicycleParkingService.updateOrder(dto, user.staffId);
  }

  @Patch(':id')
  @Roles(StaffType.ADMIN, StaffType.STAFF)
  @ApiOperation({ summary: 'Update bicycle parking' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBicycleParkingDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.bicycleParkingService.update(id, dto, user.staffId);
  }
}
