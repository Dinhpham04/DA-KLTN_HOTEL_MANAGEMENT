import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, CurrentUser } from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { ParkingReserveService } from './parking-reserve.service';
import {
  CreateParkingReserveDto,
  UpdateParkingReserveDto,
  CreateBicycleParkingReserveDto,
  UpdateBicycleParkingReserveDto,
} from './dto';

@ApiTags('Parking Reserves')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller()
export class ParkingReserveController {
  constructor(private readonly service: ParkingReserveService) {}

  // ─── Car Parking Reserve ─────────────────────────────

  @Post('parking-reserves')
  @ApiOperation({ summary: 'Create a car parking reservation' })
  createParkingReserve(
    @Body() dto: CreateParkingReserveDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.createParkingReserve(dto, user.staffId);
  }

  @Patch('parking-reserves/:id')
  @ApiOperation({ summary: 'Update a car parking reservation' })
  updateParkingReserve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateParkingReserveDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.updateParkingReserve(id, dto, user.staffId);
  }

  @Delete('parking-reserves/:id')
  @ApiOperation({ summary: 'Delete a car parking reservation' })
  deleteParkingReserve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.deleteParkingReserve(id, user.staffId);
  }

  @Patch('parking-reserves/:id/checkin')
  @ApiOperation({ summary: 'Toggle checkin flag for car parking reservation' })
  checkinParkingReserve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.checkinParkingReserve(id, user.staffId);
  }

  @Patch('parking-reserves/:id/checkout')
  @ApiOperation({ summary: 'Toggle checkout flag for car parking reservation' })
  checkoutParkingReserve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.checkoutParkingReserve(id, user.staffId);
  }

  // ─── Bicycle Parking Reserve ─────────────────────────

  @Post('bicycle-parking-reserves')
  @ApiOperation({ summary: 'Create a bicycle parking reservation' })
  createBicycleParkingReserve(
    @Body() dto: CreateBicycleParkingReserveDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.createBicycleParkingReserve(dto, user.staffId);
  }

  @Patch('bicycle-parking-reserves/:id')
  @ApiOperation({ summary: 'Update a bicycle parking reservation' })
  updateBicycleParkingReserve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBicycleParkingReserveDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.updateBicycleParkingReserve(id, dto, user.staffId);
  }

  @Delete('bicycle-parking-reserves/:id')
  @ApiOperation({ summary: 'Delete a bicycle parking reservation' })
  deleteBicycleParkingReserve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.deleteBicycleParkingReserve(id, user.staffId);
  }

  @Patch('bicycle-parking-reserves/:id/checkin')
  @ApiOperation({ summary: 'Toggle checkin flag for bicycle parking reservation' })
  checkinBicycleParkingReserve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.checkinBicycleParkingReserve(id, user.staffId);
  }

  @Patch('bicycle-parking-reserves/:id/checkout')
  @ApiOperation({ summary: 'Toggle checkout flag for bicycle parking reservation' })
  checkoutBicycleParkingReserve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.checkoutBicycleParkingReserve(id, user.staffId);
  }
}
