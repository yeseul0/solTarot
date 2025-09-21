import { Entity, PrimaryColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { TarotReading } from './tarot_reading.entity';

@Entity('users')
export class User {
  @PrimaryColumn({ length: 42 })
  walletAddress: string; // PK로 사용

  @CreateDateColumn()
  createdAt: Date;

  // 🔗 관계: 한 유저는 여러 타로 리딩을 가질 수 있음
  @OneToMany(() => TarotReading, (reading) => reading.user)
  readings: TarotReading[];
}
