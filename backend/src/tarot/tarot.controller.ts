// tarot/tarot.controller.ts
import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { TarotService } from './tarot.service';
import { CreateReadingDto } from './dto/create-reading.dto';

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
}
