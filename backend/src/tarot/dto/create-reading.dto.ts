import { ApiProperty } from '@nestjs/swagger';
import { DrawnCard } from 'src/entities/tarot_reading.entity';

export class CreateReadingDto {
  @ApiProperty({
    description: '사용자 지갑 주소',
    example: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  })
  walletAddress: string;

  @ApiProperty({
    description: '스프레드 타입 (키값)',
    example: 'loveFortune',
    enum: [
      // 연애 & 관계
      'loveFortune',
      'crushSomething',
      'relationshipCompatibility',
      'breakupReunion',
      // 금전 & 커리어
      'moneyFortune',
      'careerChoice',
      'careerGrowth',
      'wealthFlow',
      // 건강 & 자기관리
      'healthFortune',
      'energyState',
      'lifestyleAdvice',
      'mentalStability',
      // 종합 운세
      'todayMonthFortune',
      'overallFlow',
      'opportunityChallenge',
      'lifeTurningPoint',
    ],
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
}
