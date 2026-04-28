import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@common/index';
import { ParkingStatusService } from './parking-status.service';
import { ParkingStatusFilterDto } from './dto';

@ApiTags('Parking Status')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('parking-status')
export class ParkingStatusController {
  constructor(private readonly parkingStatusService: ParkingStatusService) {}

  @Get()
  @ApiOperation({
    summary: 'Get parking status overview by facility',
    description:
      'Returns facilities with their parking slots and current reservations. ' +
      'Use type=1 for both, type=2 for car parking only, type=3 for bicycle parking only.',
  })
  getParkingStatus(@Query() filter: ParkingStatusFilterDto) {
    return this.parkingStatusService.getParkingStatus(filter);
  }
}
