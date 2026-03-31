import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles, CurrentUser } from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { StaffType } from '@common/enums/index';
import { RentService } from './rent.service';
import { RentFilterDto, BulkUpdateRentDto } from './dto';

@ApiTags('Rents')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('rents')
export class RentController {
  constructor(private readonly rentService: RentService) { }

  @Get('list')
  @ApiOperation({ summary: 'Get rent list grouped by room type' })
  findRentList(@Query() filter: RentFilterDto) {
    return this.rentService.findRentList(filter);
  }

  @Put('not-deposited')
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Bulk update non-deposit rents' })
  bulkUpdateNotDeposited(
    @Body() dto: BulkUpdateRentDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.rentService.bulkUpdateNotDeposited(dto, user.staffId);
  }

  @Put('deposited')
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Bulk update deposit rents' })
  bulkUpdateDeposited(
    @Body() dto: BulkUpdateRentDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.rentService.bulkUpdateDeposited(dto, user.staffId);
  }
}
