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
import { ParkingService } from './parking.service';
import { CreateParkingDto, UpdateParkingDto, ParkingFilterDto, UpdateParkingOrderDto } from './dto';

@ApiTags('Parking')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('parkings')
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) { }

  @Get()
  @ApiOperation({ summary: 'List parkings by facility' })
  findAll(@Query() filter: ParkingFilterDto) {
    return this.parkingService.findAll(filter);
  }

  @Post()
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Create a new parking' })
  create(
    @Body() dto: CreateParkingDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.parkingService.create(dto, user.staffId);
  }

  @Patch(':id')
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Update a parking' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateParkingDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.parkingService.update(id, dto, user.staffId);
  }

  @Patch('order/update')
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Update parking order numbers' })
  updateOrder(
    @Body() dto: UpdateParkingOrderDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.parkingService.updateOrder(dto, user.staffId);
  }
}
