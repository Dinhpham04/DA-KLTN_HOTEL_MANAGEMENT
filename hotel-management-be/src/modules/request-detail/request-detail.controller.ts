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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, JwtOrInternalAutomationGuard, RolesGuard } from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { RequestDetailService } from './request-detail.service';
import { CreateRequestDetailDto, RequestDetailFilterDto, UpdateRequestDetailDto } from './dto';

@ApiTags('RequestDetail')
@ApiBearerAuth()
@Controller('request-details')
export class RequestDetailController {
  constructor(private readonly service: RequestDetailService) {}

  @Get()
  @UseGuards(JwtOrInternalAutomationGuard, RolesGuard)
  @ApiOperation({ summary: 'List billing line items for a reservation' })
  findAll(@Query() filter: RequestDetailFilterDto) {
    return this.service.findByReserveId(filter.reserveId ?? 0);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Create a billing line item' })
  create(@Body() dto: CreateRequestDetailDto, @CurrentUser() user: CurrentStaff) {
    return this.service.create(dto, user.staffId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Update a billing line item' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRequestDetailDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.update(id, dto, user.staffId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a billing line item' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentStaff) {
    return this.service.remove(id, user.staffId);
  }
}
