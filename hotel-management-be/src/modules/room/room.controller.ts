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
import { RoomService } from './room.service';
import {
  CreateRoomDto,
  UpdateRoomDto,
  UpdateRoomStatusDto,
  RoomFilterDto,
} from './dto';

@ApiTags('Room')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) { }

  @Get()
  @ApiOperation({ summary: 'List rooms with filtering and pagination' })
  @ApiPagination()
  findAll(@Query() filter: RoomFilterDto) {
    return this.roomService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room detail by ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.findById(id);
  }

  @Post()
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Create a new room' })
  create(
    @Body() dto: CreateRoomDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.roomService.create(dto, user.staffId);
  }

  @Patch(':id')
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Update room information' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoomDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.roomService.update(id, dto, user.staffId);
  }

  @Patch(':id/status')
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Update room status' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoomStatusDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.roomService.updateStatus(id, dto, user.staffId);
  }

  @Delete(':id')
  @Roles(StaffType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a room' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.roomService.remove(id, user.staffId);
  }
}
