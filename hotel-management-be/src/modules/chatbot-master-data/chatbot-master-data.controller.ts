import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InternalAutomationGuard } from '@common/guards/internal-automation.guard';
import { ChatbotMasterDataService } from './chatbot-master-data.service';
import { ChatbotMasterDataQueryDto } from './dto';

@ApiTags('Internal - Chatbot Master Data')
@ApiBearerAuth()
@UseGuards(InternalAutomationGuard)
@Controller('internal/chatbot')
export class ChatbotMasterDataController {
  constructor(private readonly service: ChatbotMasterDataService) {}

  @Get('master-data')
  @ApiOperation({ summary: 'Get aggregated hotel master data for chatbot lookup' })
  getMasterData(@Query() query: ChatbotMasterDataQueryDto) {
    return this.service.getMasterData(query);
  }

  @Get('facilities')
  @ApiOperation({ summary: 'Get facilities with room, room type, and facility summaries' })
  getFacilities(@Query() query: ChatbotMasterDataQueryDto) {
    return this.service.getFacilities(query);
  }

  @Get('facilities/:id')
  @ApiOperation({ summary: 'Get one facility with room, room type, and facility summaries' })
  getFacilityDetail(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ChatbotMasterDataQueryDto,
  ) {
    return this.service.getFacilityDetail(id, query);
  }

  @Get('room-types')
  @ApiOperation({ summary: 'Get room types with room class, room, facility, and rent context' })
  getRoomTypes(@Query() query: ChatbotMasterDataQueryDto) {
    return this.service.getRoomTypes(query);
  }

  @Get('room-types/:id')
  @ApiOperation({ summary: 'Get one room type with room class, room, facility, and rent context' })
  getRoomTypeDetail(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ChatbotMasterDataQueryDto,
  ) {
    return this.service.getRoomTypeDetail(id, query);
  }

  @Get('room-classes')
  @ApiOperation({ summary: 'Get room classes with room type summaries' })
  getRoomClasses(@Query() query: ChatbotMasterDataQueryDto) {
    return this.service.getRoomClasses(query);
  }

  @Get('room-classes/:id')
  @ApiOperation({ summary: 'Get one room class with room type summaries' })
  getRoomClassDetail(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ChatbotMasterDataQueryDto,
  ) {
    return this.service.getRoomClassDetail(id, query);
  }

  @Get('pricing/request-types')
  @ApiOperation({ summary: 'Get pricing request types with optional service prices' })
  getRequestTypes(@Query() query: ChatbotMasterDataQueryDto) {
    return this.service.getRequestTypes(query);
  }

  @Get('rents/list')
  @ApiOperation({ summary: 'Get rent list with room type and stay type context' })
  getRents(@Query() query: ChatbotMasterDataQueryDto) {
    return this.service.getRents(query);
  }
}
