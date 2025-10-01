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
import axios, { spread } from 'axios';

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

  // 🔄 리딩에 imageCid와 jsonCid 업데이트
  async updateReadingCids(readingId: number, imageCid: string, jsonCid: string): Promise<TarotReading> {
    const reading = await this.tarotReadingRepository.findOne({
      where: { id: readingId },
    });

    if (!reading) {
      throw new Error(`리딩 ID ${readingId}를 찾을 수 없습니다.`);
    }

    // CID 업데이트
    reading.imageCid = imageCid;
    reading.jsonCid = jsonCid;

    return this.tarotReadingRepository.save(reading);
  }

  // 🎯 NFT 민팅 완료 처리 (새로 추가!)
  async updateReadingNftMinting(
    readingId: number,
    mintAddress: string,
    tokenAddress: string,
    signature: string
  ): Promise<TarotReading> {
    console.log('🪙 NFT 민팅 완료 처리 시작:', { readingId, mintAddress, tokenAddress, signature });

    const reading = await this.tarotReadingRepository.findOne({
      where: { id: readingId },
    });

    if (!reading) {
      throw new Error(`리딩 ID ${readingId}를 찾을 수 없습니다.`);
    }

    // NFT 정보 업데이트
    reading.mintAddress = mintAddress;
    reading.tokenAddress = tokenAddress;
    reading.signature = signature;
    reading.isMinted = true; // 민팅 완료 표시!

    const updatedReading = await this.tarotReadingRepository.save(reading);
    console.log('✅ NFT 민팅 정보 DB 업데이트 완료:', {
      id: updatedReading.id,
      mintAddress: updatedReading.mintAddress,
      tokenAddress: updatedReading.tokenAddress,
      signature: updatedReading.signature,
      isMinted: updatedReading.isMinted,
    });

    return updatedReading;
  }

  // 🎨 NFT 이미지 생성 및 AI 해석 JSON 모두 Pinata 업로드
  async generateAndUploadNFTImage(data: GenerateNftImageDto) {
    try {
      console.log('🚀 NFT 생성 파이프라인 시작 (이미지 + AI 해석 JSON)');

      // 1. AI 이미지 생성
      console.log('1️⃣ AI 이미지 생성 중...');
      const generatedImageUrl = await this.aiInterpretationService.generateTarotImage(data);
      console.log('✅ AI 이미지 생성 완료:', generatedImageUrl);

      // 2. 이미지 다운로드
      console.log('2️⃣ 이미지 다운로드 중...');
      const imageBuffer = await this.downloadImage(generatedImageUrl);
      console.log('✅ 이미지 다운로드 완료:', `${imageBuffer.length} bytes`);

      // 3. 이미지 Pinata 업로드
      console.log('3️⃣ 이미지 Pinata 업로드 중...');
      const imageCid = await this.uploadToPinata(imageBuffer);
      console.log('✅ 이미지 Pinata 업로드 완료, CID:', imageCid);

      // 4. 이미지 URL로 NFT 메타데이터 JSON 생성 및 Pinata 업로드
      console.log('4️⃣ NFT 메타데이터 JSON 생성 및 Pinata 업로드 중...');
      const gatewayUrl = this.configService.getOrThrow<string>('GATEWAY_URL');
      const imageUrl = `https://${gatewayUrl}/ipfs/${imageCid}`;
      console.log('🖼️ 이미지 URL 생성:', imageUrl);

      const aiInterpretationCid = await this.uploadNFTMetadataToPinata(
        data.aiInterpretation,
        data,
        imageUrl,
      );
      console.log('✅ NFT 메타데이터 JSON Pinata 업로드 완료, CID:', aiInterpretationCid);

      // 5. 데이터베이스에 CID 업데이트
      console.log('5️⃣ 데이터베이스에 CID 업데이트 중...');
      const updatedReading = await this.updateReadingCids(
        data.readingId,
        imageCid,
        aiInterpretationCid,
      );
      console.log('✅ 데이터베이스 CID 업데이트 완료:', {
        readingId: updatedReading.id,
        imageCid: updatedReading.imageCid,
        jsonCid: updatedReading.jsonCid,
      });

      const result = {
        imageCid,
        aiInterpretationCid,
        imageUrl: `https://${gatewayUrl}/ipfs/${imageCid}`,
        aiInterpretationUrl: `https://${gatewayUrl}/ipfs/${aiInterpretationCid}`,
        updatedReading: {
          id: updatedReading.id,
          imageCid: updatedReading.imageCid,
          jsonCid: updatedReading.jsonCid,
        },
      };

      console.log('🎉 NFT 생성 파이프라인 완료 (이미지 + AI 해석 + DB 업데이트):', result);
      return result;

    } catch (error) {
      console.error('❌ NFT 생성 파이프라인 실패:', error);
      throw new Error(`NFT 생성 실패: ${error.message}`);
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
      console.log('📤 Pinata 이미지 업로드 시작...');

      const uint8Array = new Uint8Array(imageBuffer);
      const fileObj = new File([uint8Array], 'tarot-reading.png', {
        type: 'image/png',
      });

      // Pinata SDK로 간단 업로드!
      const result = await this.pinata.upload.file(fileObj);

      console.log('✅ Pinata 이미지 업로드 완료:', result.IpfsHash);
      console.log('🌐 IPFS URL:', `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);

      return result.IpfsHash;

    } catch (error: any) {
      console.error('❌ Pinata 이미지 업로드 실패:', error);
      throw new Error(`Pinata 이미지 업로드 실패: ${error.message}`);
    }
  }

  // 🔥 새로 추가: NFT 메타데이터 JSON을 Pinata에 업로드 (이미지 URL 포함)
  private async uploadNFTMetadataToPinata(
    interpretation: string,
    cardData: any,
    imageUrl: string,
  ): Promise<string> {
    try {
      console.log('📤 Pinata NFT 메타데이터 JSON 업로드 시작...');
      console.log('🖼️ 포함할 이미지 URL:', imageUrl);

      // 🎨 AI 해석 텍스트 파싱 (JSON 문자열을 객체로 변환)
      let parsedInterpretation;
      try {
        parsedInterpretation = JSON.parse(interpretation);
      } catch (error) {
        console.warn('⚠️ AI 해석 JSON 파싱 실패, 원본 텍스트 사용:', error);
        parsedInterpretation = { fullMessage: interpretation, conclusion: '' };
      }

      // 🌟 시드 카드들 추출 (카드 이름만)
      const seedCards = cardData.drawnCards.map(card => card.cardName).join(', ');

      // 📅 운명 탄생일 (현재 날짜)
      const birthDate = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // 🎯 상징 텍스트 (fullMessage + conclusion 조합)
      const symbolText = parsedInterpretation.conclusion
        ? `${parsedInterpretation.conclusion}`
        : interpretation;

      // 🔮 카드별 키워드 추출 (AI 해석에서)
      let cardKeywords = [];
      try {
        if (parsedInterpretation.cards && Array.isArray(parsedInterpretation.cards)) {
          cardKeywords = parsedInterpretation.cards.map((card, index) => {
            // 키워드가 있으면 사용, 없으면 기본값
            return card.keyword || card.keywords || `운명${index + 1}`;
          });
        } else {
          // AI 해석에 카드별 키워드가 없으면 기본 키워드 사용
          cardKeywords = cardData.drawnCards.map((_, index) => `운명${index + 1}`);
        }
      } catch (error) {
        console.warn('⚠️ 카드 키워드 추출 실패:', error);
        cardKeywords = cardData.drawnCards.map((_, index) => `운명${index + 1}`);
      }

      // 📖 Description 구성 (줄바꿈을 \n으로 명시적으로 처리)
      const description = `${cardKeywords[0] || '운명1'} · ${cardKeywords[1] || '운명2'} · ${cardKeywords[2] || '운명3'}\n\n상징: "${symbolText}"\n\n시드: ${seedCards}\n운명 탄생: ${birthDate}`;

      // NFT 메타데이터 표준에 맞는 JSON 구성
      const nftMetadata = {
        // name: `타로 리딩 NFT - ${cardData.spreadType}`,
        name: parsedInterpretation.name
          ? `${parsedInterpretation.name} - ${cardData.spreadType}`
          : `Sol Tarot Reading - ${cardData.spreadType}`,
        symbol: 'FATE',
        image: imageUrl, // 🔥 imageCid로 만든 이미지 URL!
        description: description,
        // 추가 메타데이터
        spreadType: cardData.spreadType,
        cards: cardData.drawnCards,
        interpretation: interpretation,
        timestamp: new Date().toISOString(),
        version: "1.0",
        // 컬렉션 정보 추가
        collection: {
          name: "FATE",
          family: "Sol Tarot NFT Collection",
        },
      };

      console.log('🎨 생성된 NFT 메타데이터:', JSON.stringify(nftMetadata, null, 2));

      // JSON을 문자열로 변환
      const jsonString = JSON.stringify(nftMetadata, null, 2);
      const jsonBlob = new Blob([jsonString], { type: 'application/json' });
      const fileObj = new File([jsonBlob], 'tarot-nft-metadata.json', {
        type: 'application/json',
      });

      // Pinata SDK로 JSON 업로드
      const result = await this.pinata.upload.file(fileObj);

      console.log('✅ Pinata NFT 메타데이터 JSON 업로드 완료:', result.IpfsHash);
      console.log('🌐 IPFS URL:', `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);

      return result.IpfsHash;

    } catch (error: any) {
      console.error('❌ Pinata NFT 메타데이터 JSON 업로드 실패:', error);
      throw new Error(`Pinata NFT 메타데이터 JSON 업로드 실패: ${error.message}`);
    }
  }
}
