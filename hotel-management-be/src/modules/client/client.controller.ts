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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiPagination,
  CurrentUser,
  JwtOrInternalAutomationGuard,
  Roles,
  RolesGuard,
} from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { StaffType } from '@common/enums/index';
import { ClientService } from './client.service';
import { CreateClientDto, UpdateClientDto, ClientFilterDto } from './dto';

@ApiTags('Client')
@ApiBearerAuth()
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  @UseGuards(JwtOrInternalAutomationGuard, RolesGuard)
  @ApiOperation({ summary: 'List clients with filtering and pagination' })
  @ApiPagination()
  findAll(@Query() filter: ClientFilterDto) {
    return this.clientService.findAll(filter);
  }

  @Get(':id')
  @UseGuards(JwtOrInternalAutomationGuard, RolesGuard)
  @ApiOperation({ summary: 'Get client detail by ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(StaffType.ADMIN, StaffType.MANAGER, StaffType.STAFF)
  @ApiOperation({ summary: 'Create a new client' })
  create(@Body() dto: CreateClientDto, @CurrentUser() user: CurrentStaff) {
    return this.clientService.create(dto, user.staffId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a client' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentStaff) {
    return this.clientService.remove(id, user.staffId);
  }
}
