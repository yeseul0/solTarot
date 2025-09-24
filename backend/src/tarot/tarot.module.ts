import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarotController } from './tarot.controller';
import { TarotService } from './tarot.service';
import { User } from '../entities/user.entity';
import { TarotReading } from '../entities/tarot_reading.entity';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, TarotReading]),
    AIModule,
  ],
  controllers: [TarotController],
  providers: [TarotService],
  exports: [TarotService],
})
export class TarotModule {}