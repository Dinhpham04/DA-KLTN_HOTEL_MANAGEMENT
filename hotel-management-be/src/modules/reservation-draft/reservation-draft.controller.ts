import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, Roles, RolesGuard } from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { StaffType } from '@common/enums/index';
import { ReservationDraftService } from './reservation-draft.service';
import { CreateReservationDraftDto } from './dto';

@ApiTags('Reservation Draft')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reservation-draft')
export class ReservationDraftController {
  constructor(private readonly reservationDraftService: ReservationDraftService) {}

  @Post()
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Tạo đặt phòng tạm (draft) - giữ chỗ tạm thời' })
  create(
    @Body() dto: CreateReservationDraftDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.reservationDraftService.create(dto, user.staffId);
  }
}
