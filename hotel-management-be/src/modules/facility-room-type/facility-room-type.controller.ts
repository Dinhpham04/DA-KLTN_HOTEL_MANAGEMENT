import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles, CurrentUser } from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { StaffType } from '@common/enums/index';
import { FacilityRoomTypeService } from './facility-room-type.service';
import { UpsertFacilityRoomTypeDto } from './dto';

@ApiTags('FacilityRoomType')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('facility-room-types')
export class FacilityRoomTypeController {
  constructor(private readonly service: FacilityRoomTypeService) { }

  @Get()
  @ApiOperation({ summary: 'Get facility-room type acreage matrix' })
  getMatrix() {
    return this.service.getMatrix();
  }

  @Post()
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upsert facility-room type acreage matrix' })
  upsertMatrix(
    @Body() dto: UpsertFacilityRoomTypeDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.service.upsertMatrix(dto, user.staffId);
  }
}
