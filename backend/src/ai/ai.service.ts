// tarot/services/ai-interpretation.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { DrawnCard } from '../entities/tarot_reading.entity';
import { GenerateNftImageDto } from '../tarot/dto/generate-nft-image.dto';

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
              "interpretation": "이 카드의 상세한 해석",
              "keyword": "강렬하고 임팩트있는 2-3글자 핵심키워드 (예: 파괴적변화, 숨겨진진실, 운명적만남)"
            }
          ],
          "conclusion": "조언 및 결론"
        }

        따뜻하고 희망적인 톤으로 작성하되, JSON 형식을 엄격히 지켜주세요.

        키워드 작성 가이드:
        - 2-4글자의 강렬하고 임팩트 있는 단어 사용
        - 일반적이고 뻔한 단어 피하기 (예: 행복, 사랑, 성공 등)
        - 카드의 핵심 에너지를 압축한 독특한 표현 사용
        - 예시: 파괴적각성, 숨겨진진실, 운명적전환, 강렬한직감, 위험한도전
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

      // JSON 파싱 시도 with 정제 로직
      try {
        // 1. ```json ``` 블록 제거
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        }
        if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        // 2. JSON 찾기 (중괄호로 시작하는 부분만 추출)
        const jsonStart = cleanContent.indexOf('{');
        const jsonEnd = cleanContent.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
        }

        console.log('🔧 정제된 AI 응답:', cleanContent);

        const parsed = JSON.parse(cleanContent);
        console.log('✅ JSON 파싱 성공:', parsed);
        return JSON.stringify(parsed); // 유효한 JSON인지 확인 후 다시 문자열로 반환
      } catch (parseError) {
        console.error('❌ JSON 파싱 에러:', parseError);
        console.error('🔍 원본 content:', content);
        console.error('🔍 정제 시도 후:', cleanContent);

        // JSON 파싱 실패시 기본 JSON 구조 반환
        return JSON.stringify({
          fullMessage: content,
          cards: [],
          conclusion: "AI 응답 파싱에 실패했습니다. 다시 시도해주세요."
        });
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
        - 3번째 카드 (새로운 시작): 새로운 시작을 위한 우주의 메시지와 방향`,
    };

    return promptMaps[spreadKey] || `
      이것은 3장 카드 스프레드입니다:
      - 1번째 카드: 현재 상황
      - 2번째 카드: 영향 요소
      - 3번째 카드: 결과와 조언`;
  }

  // 📝 타로 운명의 그림을 위한 프롬프트 생성
  private createTarotImagePrompt(data: GenerateNftImageDto): string {
    const { spreadType, drawnCards, aiInterpretation } = data;

    // AI 해석 파싱
    let interpretation: any = {};
    try {
      interpretation = JSON.parse(aiInterpretation);
    } catch (error) {
      console.warn('AI 해석 파싱 실패, 기본값 사용');
      interpretation = {
        fullMessage: '신비로운 운명의 메시지가 당신을 기다립니다',
        cards: [
          {
            position: "현재 상황",
            cardName: "운명의 카드",
            direction: "정방향",
            interpretation: "새로운 시작과 가능성을 의미합니다",
            keyword: "운명적각성"
          },
          {
            position: "영향 요소",
            cardName: "신비의 카드",
            direction: "정방향",
            interpretation: "숨겨진 기회가 다가오고 있습니다",
            keyword: "비밀스런기회"
          },
          {
            position: "결과와 조언",
            cardName: "희망의 카드",
            direction: "정방향",
            interpretation: "긍정적인 변화가 기다리고 있습니다",
            keyword: "찬란한전환"
          }
        ],
        conclusion: '새로운 가능성이 열리고 있습니다',
      };
    }

    // 카테고리별 매핑 함수
    const getCategoryFromSpread = (spreadType: string) => {
      if (['loveFortune', 'crushSomething', 'relationshipCompatibility', 'breakupReunion'].includes(spreadType)) {
        return 'love';
      }
      if (['moneyFortune', 'careerChoice', 'careerGrowth', 'wealthFlow'].includes(spreadType)) {
        return 'career';
      }
      if (['healthFortune', 'energyState', 'lifestyleAdvice', 'mentalStability'].includes(spreadType)) {
        return 'health';
      }
      return 'general'; // todayMonthFortune, overallFlow, opportunityChallenge, lifeTurningPoint
    };

    // 카테고리별 테마 설정
    const themeConfig = {
      love: {
        theme: '사랑과 관계',
        colors: 'romantic pink, rose gold, soft red, pearl white',
        atmosphere: 'romantic and dreamy with hearts and roses floating',
        energy: 'love energy with cupid arrows and romantic symbols',
      },
      career: {
        theme: '성공과 번영',
        colors: 'golden yellow, emerald green, rich bronze, royal purple',
        atmosphere: 'prosperous and ambitious with coins, gems, and achievement symbols',
        energy: 'success energy with golden light, crowns, and victory laurels',
      },
      health: {
        theme: '건강과 치유',
        colors: 'healing blue, pure white, gentle green, silver',
        atmosphere: 'peaceful and healing with nature elements and wellness symbols',
        energy: 'healing energy with light rays and harmony symbols'
      },
      general: {
        theme: '종합운세',
        colors: 'cosmic purple, starlight silver, mystical blue, rainbow',
        atmosphere: 'mystical and all-encompassing with universal symbols',
        energy: 'universal energy with cosmic elements and sacred geometry'
      }
    };

    const category = getCategoryFromSpread(spreadType);
    const config = themeConfig[category];

    // 메인 프롬프트 생성
    const prompt = `
      You are a cute magical rabbit artist! Draw a mystical artwork that represents this tarot reading result in your adorable watercolor illustration style:

      Tarot Reading Context:
      - Theme: "${config.theme}"
      - Overall Message: "${interpretation.fullMessage || '운명의 신비로운 메시지'}"
      
      - Individual Card Meanings: "
        ${interpretation.cards ? interpretation.cards.map((card, index) =>
        `- ${card.position}: ${card.cardName} (${card.direction}) - ${card.interpretation} [Key: ${card.keyword || 'mystic'}]`
        ).join('\n  ') : ''}"
      - Final Advice: "${interpretation.conclusion || '새로운 가능성과 희망'}"
      - Overall Energy: ${config.energy}

      Main Scene:
      - atmosphere ${config.atmosphere}
      
      Art Style Requirements:
      - **Cute watercolor illustration style**
      - Soft, dreamy, kawaii aesthetic
      - Pastel colors and gentle brush strokes
      - Whimsical and enchanting atmosphere
      - Hand-drawn illustration feel
      - Magical elements with cute charm
  
      Create a mystical scene that represents the tarot reading's meaning, but in an adorable, storybook illustration style that matches the magical rabbit artist's aesthetic.

      🚫 CRITICAL RESTRICTIONS 🚫:
      - DO NOT draw tarot cards, card shapes, rectangular frames, or playing card layouts
      - DO NOT show three separate card-like objects
      - Instead create ONE unified magical landscape/scene that represents the combined meaning
      - Think of it as a mystical storybook illustration, not a card reading display

      Instructions:
      - **FOCUS HEAVILY on the [Key: xxx] keywords from each reading position - these are the core essence to visualize**
      - Create ONE unified mystical scene that represents the complete reading's meaning
      - Transform each keyword into powerful visual metaphors and symbols within a single composition
      - Incorporate symbolic elements from the interpretations as part of a cohesive artistic scene
      - Use mystical and spiritual imagery that matches the reading's energy
      - DO NOT show individual tarot cards - instead show the abstract concepts and energies they represent

      Visual Style:
      - Ultra-detailed digital art in the style of premium fantasy illustration
      - Rich color palette: ${config.colors}
      - ${config.energy}
      - Ornate decorative borders with intricate mystical patterns
      - Sacred geometry and cosmic mandala background
      - Dramatic lighting with divine rays emanating from mystical focal points

      Mystical Elements:
      - Floating magical symbols and ancient runes throughout the scene
      - Ethereal mist and sparkles of light
      - Celestial background with stars and nebulae
      - Golden threads of fate weaving through the composition
      - Abstract energy patterns representing the three reading positions

      Technical Requirements:
      - 1024x1024 resolution
      - High definition, suitable for NFT artwork
      - Balanced composition with focal point on the three cards
      - Professional digital art quality with rich details and textures

      The overall feeling should be: Mystical, powerful, beautiful, and filled with the energy of destiny and divine guidance.
      `.trim();

    return prompt;
  }

  // 🎨 AI 이미지 생성
  async generateTarotImage(data: GenerateNftImageDto): Promise<string> {
    try {
      console.log('🎨 타로 운명의 그림 생성 시작...');
      console.log('📊 받은 데이터:', JSON.stringify(data, null, 2));

      // 1. 프롬프트 생성
      const prompt = this.createTarotImagePrompt(data);
      console.log('📝 생성된 프롬프트:', prompt);

      // 2. DALL-E 3 API 호출
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural",
      });

      // 3. 생성된 이미지 URL 확인
      const imageUrl = response.data[0]?.url;

      if (!imageUrl) {
        throw new Error('DALL-E에서 이미지 URL을 받지 못했습니다.');
      }

      console.log('✅ 타로 운명의 그림 생성 완료!');
      console.log('🖼️ 이미지 URL:', imageUrl);

      return imageUrl;
    } catch (error) {
      console.error('❌ 타로 이미지 생성 실패:', error);

      // OpenAI API 에러별 상세 처리
      if (error.status === 400) {
        throw new Error(`프롬프트 오류: ${error.message}`);
      } else if (error.status === 401) {
        throw new Error('OpenAI API 키가 유효하지 않습니다.');
      } else if (error.status === 429) {
        throw new Error('API 사용량 한도 초과. 잠시 후 다시 시도해주세요.');
      } else if (error.status >= 500) {
        throw new Error('OpenAI 서버 오류. 잠시 후 다시 시도해주세요.');
      }
      throw new Error(`타로 이미지 생성 실패: ${error.message}`);
    }
  }
}
