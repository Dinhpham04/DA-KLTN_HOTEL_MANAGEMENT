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
import { RoomClassService } from './room-class.service';
import { CreateRoomClassDto, UpdateRoomClassDto, RoomClassFilterDto } from './dto';

@ApiTags('RoomClass')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('room-classes')
export class RoomClassController {
  constructor(private readonly roomClassService: RoomClassService) { }

  @Get()
  @ApiOperation({ summary: 'List room classes with filtering and pagination' })
  @ApiPagination()
  findAll(@Query() filter: RoomClassFilterDto) {
    return this.roomClassService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room class detail by ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.roomClassService.findById(id);
  }

  @Post()
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Create a new room class' })
  create(
    @Body() dto: CreateRoomClassDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.roomClassService.create(dto, user.staffId);
  }

  @Patch(':id')
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Update a room class' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoomClassDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.roomClassService.update(id, dto, user.staffId);
  }

  @Delete(':id')
  @Roles(StaffType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a room class' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.roomClassService.remove(id, user.staffId);
  }
}
