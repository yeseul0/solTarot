// tarot/services/ai-interpretation.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { DrawnCard } from '../entities/tarot_reading.entity';

@Injectable()
export class AIInterpretationService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateInterpretation(
    drawnCards: DrawnCard[],
    spreadType: string,
  ): Promise<string> {

    // 🎴 카드 정보를 텍스트로 변환
    const cardsText = drawnCards.map((card, index) => {
      const position = this.getPositionName(spreadType, card.position);
      const direction = card.isReversed ? '역방향' : '정방향';
      return `${position}: ${card.cardName} (${direction})`; // 예시) 과거: the-fool (정방향)
    }).join('\n');

    // 🤖 ChatGPT 프롬프트
    const spreadDescription = this.getSpreadPrompt(spreadType);
    const prompt = `
        당신은 전문 타로 리더입니다. 다음 타로 카드 결과를 해석해주세요.

        ${spreadDescription}

        뽑힌 카드들:
        ${cardsText}

        각 카드의 position에 맞는 의미로 해석하고, 반드시 다음 JSON 형식으로만 답변해주세요:

        {
          "fullMessage": "전체적인 메시지",
          "cards": [
            {
              "position": "카드 위치 (예: 과거, 나, 현재 상황)",
              "cardName": "카드 이름 (예: The Fool, Ace of Cups)",
              "direction": "정방향 또는 역방향",
              "interpretation": "이 카드의 상세한 해석"
            }
          ],
          "conclusion": "조언 및 결론"
        }

        따뜻하고 희망적인 톤으로 작성하되, JSON 형식을 엄격히 지켜주세요.
        `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 친근하고 지혜로운 타로 리더입니다. 항상 솔직하고 진중하며, 실제로 사람에게 도움이 되는 조언을 제공합니다.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || '해석을 생성할 수 없습니다.';

      // JSON 파싱 시도
      try {
        const parsed = JSON.parse(content);
        return JSON.stringify(parsed); // 유효한 JSON인지 확인 후 다시 문자열로 반환
      } catch (parseError) {
        console.error('JSON 파싱 에러:', parseError);
        return content; // JSON이 아니면 원본 텍스트 반환
      }
    } catch (error) {
      console.error('OpenAI API 에러:', error);
      return '현재 AI 해석 서비스에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
    }
  }

  private getPositionName(spreadType: string, position: number): string {
    const positionMaps = {
      '시간흐름': ['과거', '현재', '미래'],
      '인간관계': ['나', '상대방', '관계의 결과'],
      '고민': ['현재 상황', '해결책', '최종 결과']
    };

    return positionMaps[spreadType]?.[position - 1] || `위치 ${position}`;
  }

  private getSpreadPrompt(spreadType: string): string {
    const promptMaps = {
      '시간흐름': `
        이것은 시간의 흐름을 보는 3장 스프레드입니다:
        - 1번째 카드 (과거): 지나간 상황이나 과거의 영향
        - 2번째 카드 (현재): 현재의 상황과 에너지
        - 3번째 카드 (미래): 앞으로 다가올 가능성과 방향`,

      '인간관계': `
        이것은 인간관계를 분석하는 3장 스프레드입니다:
        - 1번째 카드 (나): 당신의 마음가짐과 상태
        - 2번째 카드 (상대방): 상대방의 마음가짐과 상태
        - 3번째 카드 (관계의 결과): 이 관계가 나아갈 방향과 결과`,

      '고민': `
        이것은 고민 해결을 위한 3장 스프레드입니다:
        - 1번째 카드 (현재 상황): 고민의 핵심과 현재 처해진 상황
        - 2번째 카드 (해결책): 문제 해결을 위한 조언과 방법
        - 3번째 카드 (최종 결과): 해결책을 따랐을 때의 결과와 전망`,
    };

    return promptMaps[spreadType] || `3장 카드 스프레드입니다.`;
  }
}
