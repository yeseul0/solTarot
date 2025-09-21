// tarot/tarot.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { TarotReading } from '../entities/tarot_reading.entity';
import { AIInterpretationService } from '../ai/ai.service';

@Injectable()
export class TarotService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TarotReading)
    private tarotReadingRepository: Repository<TarotReading>,
    private aiInterpretationService: AIInterpretationService,
  ) {}

  // 👤 User 존재 확인 및 생성
  async ensureUserExists(walletAddress: string): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { walletAddress },
    });

    if (!user) {
      user = this.userRepository.create({ walletAddress });
      await this.userRepository.save(user);
    }

    return user;
  }

  // 🤖 AI 해석과 이미지 생성
  async generateAIInterpretation(drawnCards: any[], spreadType: string): Promise<string> {
    return this.aiInterpretationService.generateInterpretation(drawnCards, spreadType);
  }

  // 💾 타로 리딩 저장
  async saveReading(data: {
    walletAddress: string;
    spreadType: string;
    drawnCards: any[];
    aiInterpretation: string;
  }): Promise<TarotReading> {
    const reading = this.tarotReadingRepository.create(data);
    return this.tarotReadingRepository.save(reading);
  }

  // 📜 지갑별 리딩 조회
  async getReadingsByWallet(walletAddress: string): Promise<TarotReading[]> {
    return this.tarotReadingRepository.find({
      where: { walletAddress },
      order: { createdAt: 'DESC' },
    });
  }

  // 🎴 특정 리딩 조회
  async getReadingById(id: number): Promise<TarotReading> {
    return this.tarotReadingRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }
}
