import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles, CurrentUser } from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { StaffType } from '@common/enums/index';
import { IdentificationService } from './identification.service';
import { CreateIdentificationDto, UpdateIdentificationDto } from './dto';

@ApiTags('Identification')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller()
export class IdentificationController {
  constructor(private readonly identificationService: IdentificationService) {}

  @Get('clients/:clientId/identifications')
  @ApiOperation({ summary: 'List identifications for a client' })
  findByClientId(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.identificationService.findByClientId(clientId);
  }

  @Get('identifications/:id')
  @ApiOperation({ summary: 'Get identification by ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.identificationService.findById(id);
  }

  @Post('clients/:clientId/identifications')
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Create a new identification for a client' })
  create(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Body() dto: CreateIdentificationDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.identificationService.create(clientId, dto, user.staffId);
  }

  @Patch('identifications/:id')
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Update identification' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIdentificationDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.identificationService.update(id, dto, user.staffId);
  }

  @Delete('identifications/:id')
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete an identification' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.identificationService.remove(id, user.staffId);
  }
}
