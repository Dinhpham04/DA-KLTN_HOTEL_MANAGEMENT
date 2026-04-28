import { Module } from '@nestjs/common';
import { WhiteboardController } from './whiteboard.controller';
import { WhiteboardService } from './whiteboard.service';
import { WhiteboardRepository } from './whiteboard.repository';

@Module({
  controllers: [WhiteboardController],
  providers: [WhiteboardService, WhiteboardRepository],
  exports: [WhiteboardService],
})
export class WhiteboardModule {}
