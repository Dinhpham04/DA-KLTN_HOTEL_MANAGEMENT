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

import { CurrentUser, RolesGuard } from '@common/index';

import { CleaningShiftService } from './cleaning-shift.service';
import {
  CleaningShiftFilterDto,
  CopyCleaningDetailDto,
  CreateCleanDetailNoteDto,
  CreateCleaningDetailDto,
  UpdateCleanDetailNoteDto,
  UpdateCleaningDetailDto,
  UpdateCleaningDetailType1Dto,
  UpdateCleaningDetailType2Dto,
  UpdateCleaningDetailType3Dto,
  UpdateCleaningStatusDto,
  UpdateCleansDto,
  UpdateMainStaffDto,
  UpsertCleansDto,
} from './dto';

import type { CurrentStaff } from '@common/decorators/current-user.decorator';

@ApiTags('Cleaning Shifts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller()
export class CleaningShiftController {
  constructor(private readonly service: CleaningShiftService) {}

  // ─── Cleans header ───────────────────────────────────

  @Get('cleaning-shifts')
  @ApiOperation({ summary: 'List cleaning shift header + nested details for a date+facility' })
  findAll(@Query() filter: CleaningShiftFilterDto) {
    return this.service.findAll(filter);
  }

  @Post('cleaning-shifts')
  @ApiOperation({ summary: 'Upsert cleaning shift header (idempotent by facility+date)' })
  upsertCleans(@Body() dto: UpsertCleansDto, @CurrentUser() user: CurrentStaff) {
    return this.service.upsertCleans(dto, user.staffId);
  }

  @Patch('cleaning-shifts/:cleanId')
  @ApiOperation({ summary: 'Update cleaning shift header (note / rest time)' })
  updateCleans(
    @Param('cleanId', ParseIntPipe) cleanId: number,
    @Body() dto: UpdateCleansDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.updateCleans(cleanId, dto, user.staffId);
  }

  // ─── Cleaning details ────────────────────────────────

  @Post('cleaning-shifts/:cleanId/details')
  @ApiOperation({ summary: 'Create a cleaning detail row' })
  createDetail(
    @Param('cleanId', ParseIntPipe) cleanId: number,
    @Body() dto: CreateCleaningDetailDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.createDetail(cleanId, dto, user.staffId);
  }

  @Get('cleaning-shifts/details/:id')
  @ApiOperation({ summary: 'Get a single cleaning detail by ID' })
  findDetailById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findDetailById(id);
  }

  @Patch('cleaning-shifts/details/:id')
  @ApiOperation({ summary: 'Update a cleaning detail (generic)' })
  updateDetail(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCleaningDetailDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.updateDetail(id, dto, user.staffId);
  }

  @Patch('cleaning-shifts/details/:id/type1')
  @ApiOperation({ summary: 'Update Type 1 (room cleaning) specific fields' })
  updateDetailType1(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCleaningDetailType1Dto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.updateDetailType1(id, dto, user.staffId);
  }

  @Patch('cleaning-shifts/details/:id/type2')
  @ApiOperation({ summary: 'Update Type 2 (common area) specific fields' })
  updateDetailType2(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCleaningDetailType2Dto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.updateDetailType2(id, dto, user.staffId);
  }

  @Patch('cleaning-shifts/details/:id/type3')
  @ApiOperation({ summary: 'Update Type 3 (key/safety) — guards smart-lock pin state' })
  updateDetailType3(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCleaningDetailType3Dto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.updateDetailType3(id, dto, user.staffId);
  }

  @Patch('cleaning-shifts/details/:id/status')
  @ApiOperation({ summary: 'Transition cleaning status (1..7)' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCleaningStatusDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.updateStatus(id, dto, user.staffId);
  }

  @Patch('cleaning-shifts/details/:id/main-staff')
  @ApiOperation({ summary: 'Reassign main staff' })
  updateMainStaff(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMainStaffDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.updateMainStaff(id, dto, user.staffId);
  }

  @Post('cleaning-shifts/details/:id/copy')
  @ApiOperation({ summary: 'Copy a cleaning detail to another date' })
  copyDetail(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CopyCleaningDetailDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.copyDetail(id, dto, user.staffId);
  }

  @Delete('cleaning-shifts/details/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a cleaning detail' })
  deleteDetail(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.deleteDetail(id, user.staffId);
  }

  // ─── Notes ───────────────────────────────────────────

  @Get('cleaning-shifts/details/:id/notes')
  @ApiOperation({ summary: 'List notes for a cleaning detail' })
  findNotes(@Param('id', ParseIntPipe) id: number) {
    return this.service.findNotes(id);
  }

  @Post('cleaning-shifts/details/:id/notes')
  @ApiOperation({ summary: 'Add a note to a cleaning detail' })
  addNote(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCleanDetailNoteDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.addNote(id, dto, user.staffId);
  }

  @Patch('cleaning-shifts/notes/:noteId')
  @ApiOperation({ summary: 'Update a note' })
  updateNote(
    @Param('noteId', ParseIntPipe) noteId: number,
    @Body() dto: UpdateCleanDetailNoteDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.updateNote(noteId, dto, user.staffId);
  }

  @Delete('cleaning-shifts/notes/:noteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a note' })
  removeNote(
    @Param('noteId', ParseIntPipe) noteId: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.removeNote(noteId, user.staffId);
  }
}
