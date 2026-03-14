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
import { RolesGuard, Roles, CurrentUser, ApiPagination } from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { StaffType } from '@common/enums/index';
import { RoomTypeService } from './room-type.service';
import { CreateRoomTypeDto, UpdateRoomTypeDto, RoomTypeFilterDto } from './dto';

@ApiTags('RoomType')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('room-types')
export class RoomTypeController {
  constructor(private readonly roomTypeService: RoomTypeService) { }

  @Get()
  @ApiOperation({ summary: 'List room types with filtering and pagination' })
  @ApiPagination()
  findAll(@Query() filter: RoomTypeFilterDto) {
    return this.roomTypeService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room type detail by ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.roomTypeService.findById(id);
  }

  @Post()
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Create a new room type' })
  create(
    @Body() dto: CreateRoomTypeDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.roomTypeService.create(dto, user.staffId);
  }

  @Patch(':id')
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Update a room type' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoomTypeDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.roomTypeService.update(id, dto, user.staffId);
  }

  @Delete(':id')
  @Roles(StaffType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a room type' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.roomTypeService.remove(id, user.staffId);
  }
}
