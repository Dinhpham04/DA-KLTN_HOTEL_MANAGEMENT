import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RolesGuard } from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';
import {
  AnnouncementFilterDto,
  AnnouncementListResponseDto,
  DailyBusinessFilterDto,
  DailyBusinessResponseDto,
  SaleSettingResponseDto,
  UpdateSaleDateDto,
  UpsertResidualRoomDto,
} from './dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('daily-business-report')
  @ApiOperation({
    summary: 'Get daily business report (room counts + targets) for a date',
  })
  getDailyBusiness(
    @Query() filter: DailyBusinessFilterDto,
  ): Promise<DailyBusinessResponseDto> {
    return this.dashboardService.getDailyBusiness(filter);
  }

  @Post('residual-room')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upsert target residual room for a date' })
  upsertResidualRoom(
    @Body() dto: UpsertResidualRoomDto,
    @CurrentUser() user: CurrentStaff,
  ): Promise<{ statusCode: number }> {
    return this.dashboardService.upsertResidualRoom(dto, user.staffId);
  }

  @Get('task-notification')
  @ApiOperation({
    summary:
      'Get announcements for a date (paginated). Used by dashboard お知らせ card.',
  })
  getAnnouncements(
    @Query() filter: AnnouncementFilterDto,
  ): Promise<AnnouncementListResponseDto> {
    return this.dashboardService.getAnnouncements(filter);
  }

  @Get('sale/get-date')
  @ApiOperation({ summary: 'Get current sale date setting' })
  getSaleSetting(): Promise<SaleSettingResponseDto> {
    return this.dashboardService.getSaleSetting();
  }

  @Put('sale/update-date')
  @ApiOperation({
    summary: 'Update sale date (1=move to tomorrow, 2=revert to today)',
  })
  updateSaleDate(
    @Body() dto: UpdateSaleDateDto,
  ): Promise<{ statusCode: number }> {
    return this.dashboardService.updateSaleDate(dto);
  }
}
