import { ApiProperty } from '@nestjs/swagger';
import { DrawnCard } from 'src/entities/tarot_reading.entity';

export class GenerateNftImageDto {
  @ApiProperty({
    description: '타로 리딩 ID (imageCid, jsonCid 업데이트용)',
    example: 1,
  })
  readingId: number;

  @ApiProperty({
    description: '스프레드 타입',
    example: 'loveFortune',
  })
  spreadType: string;

  @ApiProperty({
    description: '뽑힌 카드들의 정보',
    example: [
      {
        cardName: 'the-fool',
        position: 1,
        isReversed: false,
      },
      {
        cardName: 'the-magician',
        position: 2,
        isReversed: true,
      },
      {
        cardName: 'the-high-priestess',
        position: 3,
        isReversed: false,
      },
    ],
  })
  drawnCards: DrawnCard[];

  @ApiProperty({
    description: 'AI 해석 결과 (JSON 문자열)',
    example: '{"fullMessage": "현재 연애 에너지가 새로운 시작을 알리고 있습니다...", "cards": [...], "conclusion": "용기를 내어 새로운 사랑에 마음을 열어보세요..."}',
  })
  aiInterpretation: string;
}