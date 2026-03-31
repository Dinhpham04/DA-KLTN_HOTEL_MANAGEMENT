import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@common/index';
import { StayTypeService } from './stay-type.service';

@ApiTags('StayType')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('stay-types')
export class StayTypeController {
  constructor(private readonly stayTypeService: StayTypeService) { }

  @Get()
  @ApiOperation({ summary: 'List active stay types' })
  findAll() {
    return this.stayTypeService.findAll();
  }
}
