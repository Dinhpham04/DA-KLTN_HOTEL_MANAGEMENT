import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles, CurrentUser, ApiPagination } from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { StaffType } from '@common/enums/index';
import { ReservationService } from './reservation.service';
import {
  CreateReservationDto,
  UpdateReservationDto,
  ReservationFilterDto,
  CancelReservationDto,
} from './dto';

@ApiTags('Reservation')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) { }

  @Get()
  @ApiOperation({ summary: 'List reservations with filtering and pagination' })
  @ApiPagination()
  findAll(@Query() filter: ReservationFilterDto) {
    return this.reservationService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reservation detail by ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.findById(id);
  }

  @Post()
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Create a new reservation' })
  create(
    @Body() dto: CreateReservationDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.reservationService.create(dto, user.staffId);
  }

  @Patch(':id')
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Update reservation information' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.reservationService.update(id, dto, user.staffId);
  }

  @Post(':id/confirm')
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Confirm a pending reservation' })
  confirm(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.reservationService.confirm(id, user.staffId);
  }

  @Post(':id/check-in')
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Check-in a confirmed reservation' })
  checkIn(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.reservationService.checkIn(id, user.staffId);
  }

  @Post(':id/check-out')
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Check-out a checked-in reservation' })
  checkOut(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.reservationService.checkOut(id, user.staffId);
  }

  @Post(':id/cancel')
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Cancel a reservation' })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelReservationDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.reservationService.cancel(id, dto, user.staffId);
  }

  @Delete(':id')
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a reservation' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.reservationService.remove(id, user.staffId);
  }
}
