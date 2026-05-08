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
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard, CurrentUser } from '@common/index'
import type { CurrentStaff } from '@common/decorators/current-user.decorator'
import { ReserveOccupierService } from './reserve-occupier.service'
import {
  CreateReserveOccupierDto,
  CreateReserveOccupierBatchDto,
  UpdateReserveOccupierDto,
  ReserveOccupierFilterDto,
} from './dto'

@ApiTags('ReserveOccupier')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reserve-occupiers')
export class ReserveOccupierController {
  constructor(private readonly service: ReserveOccupierService) {}

  @Get()
  @ApiOperation({ summary: 'Get all occupiers for a reservation' })
  findAll(@Query() filter: ReserveOccupierFilterDto) {
    return this.service.findByReserveId(filter.reserveId ?? 0)
  }

  @Post()
  @ApiOperation({ summary: 'Create a single occupier' })
  create(@Body() dto: CreateReserveOccupierDto, @CurrentUser() user: CurrentStaff) {
    return this.service.create(dto, user.staffId)
  }

  @Post('batch')
  @ApiOperation({ summary: 'Batch create occupiers for a reservation' })
  createBatch(@Body() dto: CreateReserveOccupierBatchDto, @CurrentUser() user: CurrentStaff) {
    return this.service.createBatch(dto, user.staffId)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an occupier' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReserveOccupierDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.update(id, dto, user.staffId)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete an occupier' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentStaff) {
    return this.service.remove(id, user.staffId)
  }
}
