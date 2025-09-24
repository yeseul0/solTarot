import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🌐 CORS 설정 - 프론트엔드에서 API 호출을 위해 필요
  app.enableCors({
    origin: [
      'http://localhost:3000', // 로컬 프론트엔드
      'http://localhost:3001', // 로컬 개발
      'http://localhost:5173', // fe
      // 배포시 실제 도메인 추가 예정
    ],
    credentials: true, // 쿠키/인증 정보 포함 허용
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // 📚 Swagger API 문서 설정
  const config = new DocumentBuilder()
    .setTitle('Sol Tarot API')
    .setDescription('Solana 기반 타로 NFT 플랫폼 API 문서')
    .setVersion('1.0')
    .addTag('tarot', '타로 카드 리딩 관련 API')
    .addTag('ai', 'AI 해석 관련 API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 3001; // 포트 3001로 변경 (프론트와 겹치지 않도록)
  await app.listen(port);

  console.log(`🚀 Backend Server: http://localhost:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/api-docs`);
}
bootstrap();
