import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn} from 'typeorm';
import { User } from './user.entity';

// 🃏 카드 정보 인터페이스
export interface DrawnCard {
  cardName: string; // 'the-fool'
  position: number; // 1, 2, 3
  isReversed: boolean; // 역방향 여부
}

@Entity('tarot_readings')
export class TarotReading {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 44 })
  walletAddress: string; // FK (Solana 주소는 44자)

  @Column({ length: 50 })
  spreadType: string; // 'three-card', 'celtic-cross', 'single-card'

  @Column({ type: 'json' })
  drawnCards: DrawnCard[]; // 뽑힌 카드들 (순서, 역방향 포함)

  @Column({ type: 'text' })
  aiInterpretation: string; // AI가 생성한 해석

  @Column({ nullable: true, length: 100 })
  imageCid?: string; // Pinata IPFS CID

  @Column({ nullable: true, length: 100 })
  mintAddress?: string; // NFT 민트 주소 (민팅 후)

  @Column({ type: 'boolean', default: false })
  isMinted: boolean; // NFT로 민팅되었는지 여부

  @CreateDateColumn()
  createdAt: Date;

  // 🔗 관계: 여러 리딩은 한 유저에 속함
  @ManyToOne(() => User, (user) => user.readings)
  @JoinColumn({ name: 'walletAddress' })
  user: User;
}
