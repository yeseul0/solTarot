import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIInterpretationService } from './ai.service';

@Module({
  imports: [ConfigModule],
  providers: [AIInterpretationService],
  exports: [AIInterpretationService],
})
export class AIModule {}
