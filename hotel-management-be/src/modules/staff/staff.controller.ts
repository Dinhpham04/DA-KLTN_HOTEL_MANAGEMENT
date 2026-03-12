import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, type CurrentStaff } from '@common/decorators/index';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/guards/roles.guard';
import { ApiPagination } from '@common/decorators/api-pagination.decorator';
import { StaffType } from '@common/enums/index';
import type { IPaginated } from '@common/interfaces/repository.interface';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffFilterDto } from './dto/staff-filter.dto';
import { StaffResponseDto } from './dto/staff-response.dto';

@ApiTags('Staff')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('staffs')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  @Get()
  @ApiOperation({ summary: 'Get all staff (paginated)' })
  @ApiPagination()
  findAll(@Query() filter: StaffFilterDto): Promise<IPaginated<StaffResponseDto>> {
    return this.staffService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get staff by ID' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<StaffResponseDto> {
    return this.staffService.findById(id);
  }

  @Post()
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Create a new staff member' })
  create(
    @Body() dto: CreateStaffDto,
    @CurrentUser() user: CurrentStaff,
  ): Promise<StaffResponseDto> {
    return this.staffService.create(dto, user.staffId);
  }

  @Put(':id')
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Update staff member' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffDto,
    @CurrentUser() user: CurrentStaff,
  ): Promise<StaffResponseDto> {
    return this.staffService.update(id, dto, user.staffId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(StaffType.ADMIN)
  @ApiOperation({ summary: 'Soft delete staff member' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentStaff): Promise<void> {
    return this.staffService.remove(id, user.staffId);
  }
}
