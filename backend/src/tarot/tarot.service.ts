// tarot/tarot.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { TarotReading, DrawnCard } from '../entities/tarot_reading.entity';
import { AIInterpretationService } from '../ai/ai.service';
import { GenerateNftImageDto } from './dto/generate-nft-image.dto';
import { PinataSDK } from 'pinata-web3';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TarotService {
  private pinata: PinataSDK;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TarotReading)
    private tarotReadingRepository: Repository<TarotReading>,
    private aiInterpretationService: AIInterpretationService,
    private configService: ConfigService,
  ) {
      // 🔥 Pinata SDK 초기화
      const pinataJwt = this.configService.getOrThrow<string>('PINATA_JWT');
      const pinataGateway = this.configService.getOrThrow<string>('GATEWAY_URL');

      this.pinata = new PinataSDK({
      pinataJwt,
      pinataGateway,
      });
    }

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

  // 🤖 AI 해석 생성
  async generateAIInterpretation(
    drawnCards: DrawnCard[],
    spreadKey: string,
  ): Promise<string> {
    return this.aiInterpretationService.generateInterpretation(
      drawnCards,
      spreadKey,
    );
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

  // 🎨 NFT 이미지 생성 및 Pinata 업로드
  async generateAndUploadNFTImage(data: GenerateNftImageDto) {
    try {
      console.log('🚀 NFT 이미지 생성 파이프라인 시작');

      // 1. AI 이미지 생성
      console.log('1️⃣ AI 이미지 생성 중...');
      const imageUrl = await this.aiInterpretationService.generateTarotImage(data);
      console.log('✅ AI 이미지 생성 완료:', imageUrl);

      // 2. 이미지 다운로드
      console.log('2️⃣ 이미지 다운로드 중...');
      const imageBuffer = await this.downloadImage(imageUrl);
      console.log('✅ 이미지 다운로드 완료:', `${imageBuffer.length} bytes`);

      // 3. Pinata 업로드
      console.log('3️⃣ Pinata 업로드 중...');
      const cid = await this.uploadToPinata(imageBuffer);
      console.log('✅ Pinata 업로드 완료, CID:', cid);

      const gatewayUrl = this.configService.getOrThrow<string>('GATEWAY_URL');
      const result = {
        cid,
        imageUrl: `${gatewayUrl}/ipfs/${cid}`,
      };

      console.log('🎉 NFT 생성 파이프라인 완료:', result);
      return result;

    } catch (error) {
      console.error('❌ NFT 생성 파이프라인 실패:', error);
      throw new Error(`NFT 이미지 생성 실패: ${error.message}`);
    }
  }

  private async downloadImage(url: string): Promise<Buffer> {
    try {
      console.log('📥 이미지 다운로드 시작:', url);

      // HTTP GET 요청으로 이미지 다운로드
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30초 타임아웃
      });

      if (response.status !== 200) {
        throw new Error(`이미지 다운로드 실패: HTTP ${response.status}`);
      }

      // Buffer로 변환
      const imageBuffer = Buffer.from(response.data);
      console.log('✅ 이미지 다운로드 완료:', `${imageBuffer.length} bytes`);
      return imageBuffer;
    } catch (error) {
      console.error('❌ 이미지 다운로드 실패:', error);
      throw new Error(`이미지 다운로드 실패: ${error.message}`);
    }
  }

  private async uploadToPinata(imageBuffer: Buffer): Promise<string> {
    try {
      console.log('📤 Pinata 업로드 시작...');

      const uint8Array = new Uint8Array(imageBuffer);
      const fileObj = new File([uint8Array], 'tarot-reading.png', {
        type: 'image/png',
      });

      // Pinata SDK로 간단 업로드!
      const result = await this.pinata.upload.file(fileObj);

      console.log('✅ Pinata 업로드 완료:', result.IpfsHash);
      console.log('🌐 IPFS URL:', `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);

      return result.IpfsHash;

    } catch (error: any) {
      console.error('❌ Pinata 업로드 실패:', error);
      throw new Error(`Pinata 업로드 실패: ${error.message}`);
    }
  }
}
