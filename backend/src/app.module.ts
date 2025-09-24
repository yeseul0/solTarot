import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from './entities/user.entity';
import { TarotReading } from './entities/tarot_reading.entity';
import { AIModule } from './ai/ai.module';
import { TarotModule } from './tarot/tarot.module';

@Module({
  imports: [
    //환경변수 로드
    ConfigModule.forRoot({
      isGlobal: true, // 어디서든지 import 없이 사용 가능
      envFilePath: '.env', // 환경 변수 파일 경로
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT') || 3306,
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, TarotReading],
        synchronize: true, // 개발 환경에서만 사용, 실제 운영 환경에서는 false로 설정
        logging: true, // 쿼리 로깅 활성화
      }),
      inject: [ConfigService],
    }),
    AIModule,
    TarotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
