// tarot/tarot.controller.ts
import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { TarotService } from './tarot.service';
import { CreateReadingDto } from './dto/create-reading.dto';

@Controller('tarot')
export class TarotController {
  constructor(private readonly tarotService: TarotService) {}

  // 🔮 타로 리딩 생성 + AI 해석
  @Post('reading')
  async createReading(@Body() createReadingDto: CreateReadingDto) {
    const { walletAddress, spreadType, drawnCards } = createReadingDto;

    // 1. User 확인 또는 생성
    await this.tarotService.ensureUserExists(walletAddress);

    // 2. ChatGPT API로 AI 해석 생성
    const aiInterpretation = await this.tarotService.generateAIInterpretation(
      drawnCards,
      spreadType,
    );

    // 3. TarotReading 저장
    const reading = await this.tarotService.saveReading({
      walletAddress,
      spreadType,
      drawnCards,
      aiInterpretation,
    });

    return reading;
  }

  // 📜 내 타로 기록 조회
  @Get('readings/:walletAddress')
  async getMyReadings(@Param('walletAddress') walletAddress: string) {
    return this.tarotService.getReadingsByWallet(walletAddress);
  }

  // 🎴 특정 리딩 상세 조회
  @Get('reading/:id')
  async getReadingDetail(@Param('id') id: number) {
    return this.tarotService.getReadingById(id);
  }
}
