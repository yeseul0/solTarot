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
    spreadKey: string,
  ): Promise<string> {

    // 🎴 카드 정보를 텍스트로 변환
    const cardsText = drawnCards.map((card, index) => {
      const position = this.getPositionName(spreadKey, card.position);
      const direction = card.isReversed ? '역방향' : '정방향';
      return `${position}: ${card.cardName} (${direction})`; // 예시) 현재 연애 에너지: the-fool (정방향)
    }).join('\n');

    // 🤖 ChatGPT 프롬프트
    const spreadDescription = this.getSpreadPrompt(spreadKey);
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
              "position": "카드 위치 (예: 현재, 기회, 조심)",
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
      console.error('🚨 OpenAI API 에러:', error);
      console.error('🔍 에러 상세:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type
      });
      return '현재 AI 해석 서비스에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
    }
  }

  private getPositionName(spreadKey: string, position: number): string {
    const positionMaps = {
      // 연애 & 관계
      'loveFortune': ['현재 연애 에너지', '연애 기회', '연애 조언'],
      'crushSomething': ['나의 마음', '상대방의 마음', '관계 발전'],
      'relationshipCompatibility': ['나의 상태', '상대방', '궁합 결과'],
      'breakupReunion': ['현재 상황', '과거 관계', '미래 방향'],

      // 금전 & 커리어
      'moneyFortune': ['현재 금전 상황', '돈의 흐름', '재정 조언'],
      'careerChoice': ['진로 고민', '나의 적성', '최적 선택'],
      'careerGrowth': ['현재 커리어', '성장 기회', '발전 전략'],
      'wealthFlow': ['재물 에너지', '수입 경로', '증대 방법'],

      // 건강 & 자기관리
      'healthFortune': ['현재 건강', '몸마음 균형', '건강 조언'],
      'energyState': ['에너지 레벨', '소모 원인', '충전 방법'],
      'lifestyleAdvice': ['현재 생활', '개선점', '생활 조언'],
      'mentalStability': ['마음 상태', '스트레스', '정신적 평화'],

      // 종합 운세
      'todayMonthFortune': ['전반적 흐름', '기회와 주의점', '성공 조언'],
      'overallFlow': ['현재 흐름', '앞으로의 변화', '흐름 활용법'],
      'opportunityChallenge': ['다가올 기회', '맞닥뜨릴 도전', '성공 전략'],
      'lifeTurningPoint': ['현재 위치', '전환점 신호', '새로운 시작']
    };

    return positionMaps[spreadKey]?.[position - 1] || `위치 ${position}`;
  }

  private getSpreadPrompt(spreadKey: string): string {
    const promptMaps = {
      // 연애 & 관계
      'loveFortune': `
        이것은 연애운을 보는 3장 스프레드입니다:
        - 1번째 카드 (현재 연애 에너지): 현재 당신의 연애 에너지와 매력 상태
        - 2번째 카드 (연애 기회): 앞으로 다가올 연애 기회와 만남의 가능성
        - 3번째 카드 (연애 조언): 연애 성취를 위한 우주의 조언과 방향`,

      'crushSomething': `
        이것은 짝사랑/썸 상황을 분석하는 3장 스프레드입니다:
        - 1번째 카드 (나의 마음): 상대방에 대한 당신의 진짜 마음과 감정
        - 2번째 카드 (상대방의 마음): 상대방이 당신을 어떻게 생각하고 있는지
        - 3번째 카드 (관계 발전): 이 관계가 발전할 가능성과 앞으로의 방향`,

      'relationshipCompatibility': `
        이것은 관계 궁합을 보는 3장 스프레드입니다:
        - 1번째 카드 (나의 상태): 이 관계에서 당신의 현재 상태와 에너지
        - 2번째 카드 (상대방): 상대방의 성향과 이 관계에 대한 태도
        - 3번째 카드 (궁합 결과): 두 사람의 궁합도와 관계의 조화로운 발전 방향`,

      'breakupReunion': `
        이것은 헤어짐/재회 상황을 보는 3장 스프레드입니다:
        - 1번째 카드 (현재 상황): 현재 이별 상황과 당신의 감정 상태
        - 2번째 카드 (과거 관계): 과거 관계의 의미와 남은 인연의 끈
        - 3번째 카드 (미래 방향): 재회 가능성과 앞으로 나아갈 관계의 방향`,

      // 금전 & 커리어
      'moneyFortune': `
        이것은 금전운을 보는 3장 스프레드입니다:
        - 1번째 카드 (현재 금전 상황): 현재 재정 상태와 돈에 대한 에너지
        - 2번째 카드 (돈의 흐름): 돈이 들어오고 나가는 흐름과 기회
        - 3번째 카드 (재정 조언): 더 나은 재정 관리를 위한 우주의 조언`,

      'careerChoice': `
        이것은 직업/진로 선택을 위한 3장 스프레드입니다:
        - 1번째 카드 (진로 고민): 현재 직업이나 진로에 대한 고민의 핵심
        - 2번째 카드 (나의 적성): 당신의 진짜 능력과 적성, 타고난 재능
        - 3번째 카드 (최적 선택): 가장 적합한 진로 방향과 선택을 위한 조언`,

      'careerGrowth': `
        이것은 커리어 성장을 보는 3장 스프레드입니다:
        - 1번째 카드 (현재 커리어): 현재 직업적 위치와 성장 상태
        - 2번째 카드 (성장 기회): 다가올 성장 기회와 도전의 순간
        - 3번째 카드 (발전 전략): 커리어 발전을 위한 구체적인 전략과 방법`,

      'wealthFlow': `
        이것은 재물 흐름을 보는 3장 스프레드입니다:
        - 1번째 카드 (재물 에너지): 현재 당신 주변의 재물 에너지와 상태
        - 2번째 카드 (수입 경로): 돈이 들어올 수 있는 경로와 방법
        - 3번째 카드 (증대 방법): 재물을 늘리고 부를 축적하는 방법`,

      // 건강 & 자기관리
      'healthFortune': `
        이것은 건강운을 보는 3장 스프레드입니다:
        - 1번째 카드 (현재 건강): 현재 신체적, 정신적 건강 상태
        - 2번째 카드 (몸마음 균형): 몸과 마음의 균형 상태와 에너지 흐름
        - 3번째 카드 (건강 조언): 더 건강한 삶을 위한 우주의 조언`,

      'energyState': `
        이것은 에너지 상태를 보는 3장 스프레드입니다:
        - 1번째 카드 (에너지 레벨): 현재 당신의 전반적인 에너지 수준
        - 2번째 카드 (소모 원인): 에너지를 소모시키는 주요 원인들
        - 3번째 카드 (충전 방법): 에너지를 회복하고 충전하는 최적의 방법`,

      'lifestyleAdvice': `
        이것은 생활 습관 조언을 위한 3장 스프레드입니다:
        - 1번째 카드 (현재 생활): 현재 생활 패턴과 습관의 상태
        - 2번째 카드 (개선점): 변화가 필요한 부분과 개선할 점들
        - 3번째 카드 (생활 조언): 더 나은 생활을 위한 구체적인 실천 방법`,

      'mentalStability': `
        이것은 정신적 안정을 위한 3장 스프레드입니다:
        - 1번째 카드 (마음 상태): 현재 정신적, 감정적 상태
        - 2번째 카드 (스트레스): 스트레스와 불안의 원인들
        - 3번째 카드 (정신적 평화): 마음의 평화를 찾는 방법과 조언`,

      // 종합 운세
      'todayMonthFortune': `
        이것은 오늘/이번 달 운세를 보는 3장 스프레드입니다:
        - 1번째 카드 (전반적 흐름): 오늘/이번 달의 전반적인 운세 흐름
        - 2번째 카드 (기회와 주의점): 놓치지 말아야 할 기회와 주의할 점
        - 3번째 카드 (성공 조언): 최고의 결과를 얻기 위한 행동 지침`,

      'overallFlow': `
        이것은 전반적인 흐름을 보는 3장 스프레드입니다:
        - 1번째 카드 (현재 흐름): 현재 인생의 전반적인 흐름과 방향
        - 2번째 카드 (앞으로의 변화): 다가올 변화와 새로운 국면
        - 3번째 카드 (흐름 활용법): 이 흐름을 최대한 활용하는 방법`,

      'opportunityChallenge': `
        이것은 기회와 도전을 보는 3장 스프레드입니다:
        - 1번째 카드 (다가올 기회): 앞으로 찾아올 좋은 기회들
        - 2번째 카드 (맞닥뜨릴 도전): 극복해야 할 도전과 시련들
        - 3번째 카드 (성공 전략): 기회를 잡고 도전을 극복하는 전략`,

      'lifeTurningPoint': `
        이것은 인생 전환점 메시지를 위한 3장 스프레드입니다:
        - 1번째 카드 (현재 위치): 현재 인생에서 당신이 서 있는 위치
        - 2번째 카드 (전환점 신호): 변화의 신호와 전환점의 징조들
        - 3번째 카드 (새로운 시작): 새로운 시작을 위한 우주의 메시지와 방향`
    };

    return promptMaps[spreadKey] || `
      이것은 3장 카드 스프레드입니다:
      - 1번째 카드: 현재 상황
      - 2번째 카드: 영향 요소
      - 3번째 카드: 결과와 조언`;
  }

}
