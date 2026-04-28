import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@common/index';
import { WhiteboardService } from './whiteboard.service';
import { WhiteboardFilterDto, WhiteboardResponseDto } from './dto';

@ApiTags('Whiteboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('whiteboard')
export class WhiteboardController {
  constructor(private readonly whiteboardService: WhiteboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Get usage situation grouped by facility',
    description:
      'Returns paginated facilities with their rooms and overlapping reservations ' +
      'in the requested period. Supports filtering by facility, room class, room number, ' +
      'service type (parking/bicycle/pet/box), and clean status (in-use only for now).',
  })
  findAll(@Query() filter: WhiteboardFilterDto): Promise<WhiteboardResponseDto> {
    return this.whiteboardService.findAll(filter);
  }
}
