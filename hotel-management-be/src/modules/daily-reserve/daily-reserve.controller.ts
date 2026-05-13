import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, JwtOrInternalAutomationGuard, Roles, RolesGuard } from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { StaffType } from '@common/enums/index';
import { DailyReserveService } from './daily-reserve.service';
import {
  DailyReserveFilterDto,
  DailyReserveResponseDto,
  UpdateAllDailyReserveDto,
  UpdateAllDailyReserveResponseDto,
  UpdateDailyReserveDto,
  UpdateDailyReserveResponseDto,
} from './dto';

@ApiTags('Daily Reserve')
@ApiBearerAuth()
@Controller()
export class DailyReserveController {
  constructor(private readonly dailyReserveService: DailyReserveService) {}

  @Get('daily-reserve')
  @UseGuards(JwtOrInternalAutomationGuard, RolesGuard)
  @ApiOperation({ summary: 'Get daily check-in reserve management rows' })
  findAll(
    @Query() filter: DailyReserveFilterDto,
    @CurrentUser() user: CurrentStaff,
  ): Promise<DailyReserveResponseDto> {
    return this.dailyReserveService.findAll(filter, user.staffId);
  }

  @Put('daily-reserve/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a daily reserve row and smart lock credential' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDailyReserveDto,
    @CurrentUser() user: CurrentStaff,
  ): Promise<UpdateDailyReserveResponseDto> {
    return this.dailyReserveService.update(id, dto, user.staffId);
  }

  @Put('daily-reserves')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk update daily reserve rows' })
  updateAll(
    @Body() dto: UpdateAllDailyReserveDto,
    @CurrentUser() user: CurrentStaff,
  ): Promise<UpdateAllDailyReserveResponseDto> {
    return this.dailyReserveService.updateAll(dto, user.staffId);
  }
}
