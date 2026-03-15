import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
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
import { RolesGuard, Roles, CurrentUser, ApiPagination } from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { StaffType } from '@common/enums/index';
import { ClientService } from './client.service';
import {
  CreateClientDto,
  UpdateClientDto,
  ClientFilterDto,
} from './dto';

@ApiTags('Client')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) { }

  @Get()
  @ApiOperation({ summary: 'List clients with filtering and pagination' })
  @ApiPagination()
  findAll(@Query() filter: ClientFilterDto) {
    return this.clientService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client detail by ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.findById(id);
  }

  @Post()
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Create a new client' })
  create(
    @Body() dto: CreateClientDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.clientService.create(dto, user.staffId);
  }

  @Patch(':id')
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Update client information' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClientDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.clientService.update(id, dto, user.staffId);
  }

  @Delete(':id')
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a client' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.clientService.remove(id, user.staffId);
  }
}
