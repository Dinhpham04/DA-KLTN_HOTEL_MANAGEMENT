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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiPagination,
  CurrentUser,
  JwtOrInternalAutomationGuard,
  Roles,
  RolesGuard,
} from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { StaffType } from '@common/enums/index';
import { ReservationService } from './reservation.service';
import {
  CreateReservationDto,
  UpdateReservationDto,
  ReservationFilterDto,
  CancelReservationDto,
  CreateReservationWithParkingsDto,
} from './dto';

@ApiTags('Reservation')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  @UseGuards(JwtOrInternalAutomationGuard, RolesGuard)
  @ApiOperation({ summary: 'List reservations with filtering and pagination' })
  @ApiPagination()
  findAll(@Query() filter: ReservationFilterDto) {
    return this.reservationService.findAll(filter);
  }

  @Get(':id')
  @UseGuards(JwtOrInternalAutomationGuard, RolesGuard)
  @ApiOperation({ summary: 'Get reservation detail by ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Create a new reservation' })
  create(@Body() dto: CreateReservationDto, @CurrentUser() user: CurrentStaff) {
    return this.reservationService.create(dto, user.staffId);
  }

  @Post('with-parking')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Create reservation with parking reserves (atomic transaction)' })
  createWithParkings(
    @Body() dto: CreateReservationWithParkingsDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.reservationService.createReservationWithParkings(dto, user.staffId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Confirm a pending reservation' })
  confirm(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentStaff) {
    return this.reservationService.confirm(id, user.staffId);
  }

  @Post(':id/check-in')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Check-in a confirmed reservation' })
  checkIn(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentStaff) {
    return this.reservationService.checkIn(id, user.staffId);
  }

  @Post(':id/check-out')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Check-out a checked-in reservation' })
  checkOut(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentStaff) {
    return this.reservationService.checkOut(id, user.staffId);
  }

  @Post(':id/cancel')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a reservation' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentStaff) {
    return this.reservationService.remove(id, user.staffId);
  }
}
