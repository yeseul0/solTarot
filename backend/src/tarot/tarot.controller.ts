// tarot/tarot.controller.ts
import { Controller, Post, Get, Body, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { TarotService } from './tarot.service';
import { CreateReadingDto } from './dto/create-reading.dto';
import { GenerateNftImageDto } from './dto/generate-nft-image.dto';

@ApiTags('tarot')
@Controller('tarot')
export class TarotController {
  constructor(private readonly tarotService: TarotService) {}

  // 🔮 타로 리딩 생성 + AI 해석
  @Post('reading')
  @ApiOperation({
    summary: '타로 리딩 생성',
    description: '뽑힌 카드 정보를 받아서 AI 해석을 생성하고 데이터베이스에 저장합니다.',
  })
  @ApiBody({ type: CreateReadingDto })
  @ApiResponse({
    status: 201,
    description: '타로 리딩이 성공적으로 생성되었습니다.',
    example: {
      id: 1,
      walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      spreadType: 'loveFortune',
      drawnCards: [
        { cardName: 'the-fool', position: 1, isReversed: false },
        { cardName: 'the-magician', position: 2, isReversed: true },
        { cardName: 'the-high-priestess', position: 3, isReversed: false },
      ],
      aiInterpretation: '{"fullMessage": "현재 연애 에너지가 새로운 시작을 알리고 있습니다...", "cards": [...], "conclusion": "용기를 내어 새로운 사랑에 마음을 열어보세요..."}',
      isMinted: false,
      createdAt: '2024-09-22T03:00:00.000Z',
      updatedAt: '2024-09-22T03:00:00.000Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
  })
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
  @ApiOperation({
    summary: '내 타로 기록 조회',
    description: '특정 지갑 주소의 모든 타로 리딩 기록을 조회합니다.',
  })
  @ApiParam({
    name: 'walletAddress',
    description: '지갑 주소',
    example: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  })
  @ApiResponse({
    status: 200,
    description: '타로 리딩 목록',
    example: [
      {
        id: 1,
        spreadType: 'loveFortune',
        createdAt: '2024-09-22T03:00:00.000Z',
        drawnCards: [
          { cardName: 'the-fool', position: 1, isReversed: false },
          { cardName: 'two-of-cups', position: 2, isReversed: false },
          { cardName: 'the-lovers', position: 3, isReversed: true },
        ],
        aiInterpretation:
          '{"fullMessage": "새로운 연애의 시작이 보입니다...", "conclusion": "진실한 마음으로 다가가세요"}',
        isMinted: false,
      },
      {
        id: 2,
        spreadType: 'moneyFortune',
        createdAt: '2024-09-21T15:30:00.000Z',
        drawnCards: [
          { cardName: 'ace-of-pentacles', position: 1, isReversed: false },
          { cardName: 'ten-of-pentacles', position: 2, isReversed: false },
          { cardName: 'the-star', position: 3, isReversed: false },
        ],
        aiInterpretation:
          '{"fullMessage": "금전적 안정과 성공의 기운이 강합니다...", "conclusion": "현재의 노력이 곧 결실을 맺을 것입니다"}',
        isMinted: true,
      },
    ],
  })
  async getMyReadings(@Param('walletAddress') walletAddress: string) {
    return this.tarotService.getReadingsByWallet(walletAddress);
  }

  // 🎴 특정 리딩 상세 조회
  @Get('reading/:id')
  @ApiOperation({
    summary: '특정 타로 리딩 상세 조회',
    description: 'ID로 특정 타로 리딩의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '타로 리딩 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '타로 리딩 상세 정보',
    example: {
      id: 1,
      walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      spreadType: 'healthFortune',
      drawnCards: [
        { cardName: 'the-fool', position: 1, isReversed: false },
        { cardName: 'the-magician', position: 2, isReversed: true },
        { cardName: 'the-high-priestess', position: 3, isReversed: false },
      ],
      aiInterpretation:
        '{"fullMessage": "현재 건강 상태가 새로운 전환점에 있습니다...", "cards": [...], "conclusion": "몸과 마음의 균형을 맞추는 것이 중요합니다"}',
      isMinted: false,
      createdAt: '2024-09-22T03:00:00.000Z',
      updatedAt: '2024-09-22T03:00:00.000Z',
    },
  })
  @ApiResponse({
    status: 404,
    description: '타로 리딩을 찾을 수 없습니다.',
  })
  async getReadingDetail(@Param('id') id: number) {
    return this.tarotService.getReadingById(id);
  }

  // 🎨 NFT 이미지 생성 및 Pinata 업로드
  @Post('nft/generate-image')
  @ApiOperation({
    summary: 'NFT 이미지 생성',
    description: '타로 리딩 결과를 바탕으로 AI 이미지를 생성하고 Pinata에 업로드하여 CID를 반환합니다.',
  })
  @ApiBody({ type: GenerateNftImageDto })
  @ApiResponse({
    status: 201,
    description: 'NFT 이미지가 성공적으로 생성되고 Pinata에 업로드되었습니다.',
    example: {
      success: true,
      imageCid: 'QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      aiInterpretationCid: 'QmYyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
      imageUrl: 'https://gateway.pinata.cloud/ipfs/QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      aiInterpretationUrl: 'https://gateway.pinata.cloud/ipfs/QmYyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
      message: 'NFT 이미지와 AI 해석 JSON이 성공적으로 생성되고 데이터베이스에 저장되었습니다.',
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류 (AI 이미지 생성 실패, Pinata 업로드 실패 등)',
  })
  async generateNFTImage(@Body() data: GenerateNftImageDto) {
    try {
      // 타로 리딩 데이터를 바탕으로 AI 이미지 생성 및 Pinata 업로드
      const result = await this.tarotService.generateAndUploadNFTImage(data);

      return {
        success: true,
        imageCid: result.imageCid,
        aiInterpretationCid: result.aiInterpretationCid,
        imageUrl: result.imageUrl,
        aiInterpretationUrl: result.aiInterpretationUrl,
        updatedReading: result.updatedReading,
        message: 'NFT 이미지와 AI 해석 JSON이 성공적으로 생성되고 데이터베이스에 저장되었습니다.',
      };
    } catch (error) {
      throw new Error(`NFT 이미지 생성 실패: ${error.message}`);
    }
  }

  // 🪙 NFT 민팅 완료 처리 (새로 추가!)
  @Patch('reading/:id/nft-minting')
  @ApiOperation({
    summary: 'NFT 민팅 완료 처리',
    description: 'NFT 민팅이 완료된 후 민트 주소, 토큰 주소, 서명 정보를 데이터베이스에 업데이트합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '타로 리딩 ID',
    example: 1,
  })
  @ApiBody({
    description: 'NFT 민팅 완료 정보',
    schema: {
      type: 'object',
      properties: {
        mintAddress: {
          type: 'string',
          description: 'NFT 민트 주소',
          example: '7eDZ3HhU6Gg1hDdVrnS3V98oHN4fWCfGEnum7FxXjoVK',
        },
        tokenAddress: {
          type: 'string',
          description: 'Associated Token Account 주소',
          example: 'BQWWFhzBdw2vKKBUX17NHeFbCoFQHfRARpdztPE2YDr',
        },
        signature: {
          type: 'string',
          description: '트랜잭션 서명',
          example: 'SenvQQgYRR45KWKkAj6YhffBN578RUYizYzL48pg8mcUn6xRXmHkF2dvnJFFDD5n47CgAaubC5DdD84AqsQp1eP',
        },
      },
      required: ['mintAddress', 'tokenAddress', 'signature'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'NFT 민팅 정보가 성공적으로 업데이트되었습니다.',
    example: {
      success: true,
      message: 'NFT 민팅 정보가 성공적으로 업데이트되었습니다.',
      updatedReading: {
        id: 1,
        mintAddress: '7eDZ3HhU6Gg1hDdVrnS3V98oHN4fWCfGEnum7FxXjoVK',
        tokenAddress: 'BQWWFhzBdw2vKKBUX17NHeFbCoFQHfRARpdztPE2YDr',
        signature: 'SenvQQgYRR45KWKkAj6YhffBN578RUYizYzL48pg8mcUn6xRXmHkF2dvnJFFDD5n47CgAaubC5DdD84AqsQp1eP',
        isMinted: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 404,
    description: '타로 리딩을 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
  })
  async updateNftMinting(
    @Param('id') readingId: number,
    @Body() body: {
      mintAddress: string;
      tokenAddress: string;
      signature: string;
    }
  ) {
    try {
      const { mintAddress, tokenAddress, signature } = body;

      // NFT 민팅 정보를 데이터베이스에 업데이트
      const updatedReading = await this.tarotService.updateReadingNftMinting(
        readingId,
        mintAddress,
        tokenAddress,
        signature,
      );

      return {
        success: true,
        message: 'NFT 민팅 정보가 성공적으로 업데이트되었습니다.',
        updatedReading: {
          id: updatedReading.id,
          mintAddress: updatedReading.mintAddress,
          tokenAddress: updatedReading.tokenAddress,
          signature: updatedReading.signature,
          isMinted: updatedReading.isMinted,
        },
      };
    } catch (error) {
      throw new Error(`NFT 민팅 정보 업데이트 실패: ${error.message}`);
    }
  }
}
