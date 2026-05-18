import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { InternalAutomationGuard } from '@common/guards/internal-automation.guard';

import { CleaningShiftService } from './cleaning-shift.service';
import { CleaningAutomationFilterDto, GenerateCleaningShiftsDto } from './dto';

@ApiTags('Internal - Cleaning Automation')
@ApiBearerAuth()
@UseGuards(InternalAutomationGuard)
@Controller('internal/cleaning-shifts')
export class CleaningShiftAutomationController {
  constructor(private readonly service: CleaningShiftService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate cleaning jobs for n8n automation' })
  generate(@Body() dto: GenerateCleaningShiftsDto) {
    return this.service.generateCleaningJobs(dto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get daily cleaning summary for automation reports' })
  summary(@Query() query: CleaningAutomationFilterDto) {
    return this.service.getAutomationSummary(query);
  }

  @Get('daily-sheet-data')
  @ApiOperation({ summary: 'Get sheet-ready cleaning rows and active staff for daily automation' })
  dailySheetData(@Query() query: CleaningAutomationFilterDto) {
    return this.service.getDailySheetData(query);
  }

  @Post('remind-unstarted')
  @ApiOperation({ summary: 'List not-started cleaning jobs for n8n reminders' })
  remindUnstarted(@Body() dto: CleaningAutomationFilterDto) {
    return this.service.getUnstartedAutomationReminder(dto);
  }

  @Post('remind-unfinished')
  @ApiOperation({ summary: 'List unfinished cleaning jobs for n8n reminders' })
  remindUnfinished(@Body() dto: CleaningAutomationFilterDto) {
    return this.service.getUnfinishedAutomationReminder(dto);
  }
}
