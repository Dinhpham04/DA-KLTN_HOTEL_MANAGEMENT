import { Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InternalAutomationGuard } from '@common/guards/internal-automation.guard';
import { ReservationAutomationService } from './reservation-automation.service';

@ApiTags('Internal - Reservation Automation')
@ApiBearerAuth()
@UseGuards(InternalAutomationGuard)
@Controller('internal/reservations')
export class ReservationAutomationController {
  constructor(private readonly reservationAutomationService: ReservationAutomationService) {}

  @Get(':id/automation-status')
  @ApiOperation({ summary: 'Get reservation status for n8n reminder workflows' })
  getAutomationStatus(@Param('id', ParseIntPipe) id: number) {
    return this.reservationAutomationService.getAutomationStatus(id);
  }

  @Get('debt-reminders/due')
  @ApiOperation({ summary: 'List reservations with outstanding debt due on a target date' })
  getDebtRemindersDue(@Query('dueDate') dueDate: string) {
    return this.reservationAutomationService.getDebtRemindersDue(dueDate);
  }

  @Get(':id/self-checkin-status')
  @ApiOperation({ summary: 'Get self check-in status for n8n workflows' })
  getSelfCheckinStatus(@Param('id', ParseIntPipe) id: number) {
    return this.reservationAutomationService.getSelfCheckinStatus(id);
  }

  @Post(':id/release-checkin-code')
  @ApiOperation({ summary: 'Generate and release self check-in PIN for n8n workflows' })
  releaseCheckinCode(@Param('id', ParseIntPipe) id: number) {
    return this.reservationAutomationService.releaseCheckinCode(id);
  }
}
