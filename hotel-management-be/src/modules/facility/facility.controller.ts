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
import { FacilityService } from './facility.service';
import { CreateFacilityDto, UpdateFacilityDto, FacilityFilterDto } from './dto';

@ApiTags('Facility')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('facilities')
export class FacilityController {
  constructor(private readonly facilityService: FacilityService) { }

  @Get()
  @ApiOperation({ summary: 'List facilities with filtering and pagination' })
  @ApiPagination()
  findAll(@Query() filter: FacilityFilterDto) {
    return this.facilityService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get facility detail by ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.facilityService.findById(id);
  }

  @Post()
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Create a new facility' })
  create(
    @Body() dto: CreateFacilityDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.facilityService.create(dto, user.staffId);
  }

  @Patch(':id')
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Update a facility' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFacilityDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.facilityService.update(id, dto, user.staffId);
  }

  @Delete(':id')
  @Roles(StaffType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a facility' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.facilityService.remove(id, user.staffId);
  }
}
