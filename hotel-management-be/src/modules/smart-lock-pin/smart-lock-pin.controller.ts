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
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiPagination, CurrentUser, Roles, RolesGuard } from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { StaffType } from '@common/enums/index';
import { SmartLockPinService } from './smart-lock-pin.service';
import {
  CreateSmartLockPinDto,
  RevokeSmartLockPinDto,
  SmartLockPinFilterDto,
  UpdateSmartLockPinDto,
} from './dto/index';

@ApiTags('Smart Lock PIN')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('smart-lock-pins')
export class SmartLockPinController {
  constructor(private readonly smartLockPinService: SmartLockPinService) {}

  @Get()
  @ApiOperation({ summary: 'List smart lock PIN credentials with pagination' })
  @ApiPagination()
  findAll(@Query() filter: SmartLockPinFilterDto) {
    return this.smartLockPinService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get smart lock PIN credential detail by ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.smartLockPinService.findById(id);
  }

  @Post()
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Create a smart lock PIN credential' })
  create(@Body() dto: CreateSmartLockPinDto, @CurrentUser() user: CurrentStaff) {
    return this.smartLockPinService.create(dto, user.staffId);
  }

  @Patch(':id')
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Update smart lock PIN credential' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSmartLockPinDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.smartLockPinService.update(id, dto, user.staffId);
  }

  @Patch(':id/revoke')
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Revoke smart lock PIN credential' })
  revoke(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RevokeSmartLockPinDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.smartLockPinService.revoke(id, dto, user.staffId);
  }

  @Post('expire-overdue')
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Mark overdue active PIN credentials as expired' })
  expireOverdue(@CurrentUser() user: CurrentStaff) {
    return this.smartLockPinService.expireOverduePins(user.staffId);
  }

  @Delete(':id')
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete smart lock PIN credential' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentStaff) {
    return this.smartLockPinService.remove(id, user.staffId);
  }
}
