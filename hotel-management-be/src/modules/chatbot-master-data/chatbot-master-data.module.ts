import { Module } from '@nestjs/common';
import { ChatbotMasterDataController } from './chatbot-master-data.controller';
import { ChatbotMasterDataService } from './chatbot-master-data.service';

@Module({
  controllers: [ChatbotMasterDataController],
  providers: [ChatbotMasterDataService],
})
export class ChatbotMasterDataModule {}
