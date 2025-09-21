import { DrawnCard } from 'src/entities/tarot_reading.entity';

export class CreateReadingDto {
  walletAddress: string; // "0x1234...abcd"
  spreadType: string; // "three-card", "single-card"
  drawnCards: DrawnCard[]; // 프론트에서 뽑은 카드 정보
}
