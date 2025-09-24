// 타로 스프레드 타입 정의
export interface SpreadType {
  key: string;
  name: string;
  description: string;
  questions: string[];
  categoryKey: string; // Category의 key를 참조
}

// 연애 & 관계
const loveFortuneQuestions = [
  "현재 연애 에너지를 느끼며 첫 번째 카드를 뽑아주세요",
  "앞으로의 연애 기회에 집중하며 두 번째 카드를 뽑아주세요",
  "연애 성취를 위한 조언을 구하며 세 번째 카드를 뽑아주세요"
];

const crushSomethingQuestions = [
  "상대방에 대한 마음을 떠올리며 첫 번째 카드를 뽑아주세요",
  "상대방의 마음을 궁금해하며 두 번째 카드를 뽑아주세요",
  "관계 발전 가능성을 생각하며 세 번째 카드를 뽑아주세요"
];

const relationshipCompatibilityQuestions = [
  "나의 현재 상태를 생각하며 첫 번째 카드를 뽑아주세요",
  "상대방을 떠올리며 두 번째 카드를 뽑아주세요",
  "우리의 궁합과 관계 방향을 생각하며 세 번째 카드를 뽑아주세요"
];

const breakupReunionQuestions = [
  "현재 상황과 감정을 떠올리며 첫 번째 카드를 뽑아주세요",
  "상대방과의 과거를 생각하며 두 번째 카드를 뽑아주세요",
  "앞으로의 관계 방향을 궁금해하며 세 번째 카드를 뽑아주세요"
];

// 금전 & 커리어
const moneyFortuneQuestions = [
  "현재 금전 상황을 생각하며 첫 번째 카드를 뽑아주세요",
  "돈의 흐름과 기회를 떠올리며 두 번째 카드를 뽑아주세요",
  "재정 관리 조언을 구하며 세 번째 카드를 뽑아주세요"
];

const careerChoiceQuestions = [
  "현재 직업/진로 고민을 떠올리며 첫 번째 카드를 뽑아주세요",
  "나의 능력과 적성을 생각하며 두 번째 카드를 뽑아주세요",
  "최적의 선택을 위한 조언을 구하며 세 번째 카드를 뽑아주세요"
];

const careerGrowthQuestions = [
  "현재 커리어 상태를 돌아보며 첫 번째 카드를 뽑아주세요",
  "성장 기회와 도전을 생각하며 두 번째 카드를 뽑아주세요",
  "발전 방향과 전략을 구하며 세 번째 카드를 뽑아주세요"
];

const wealthFlowQuestions = [
  "현재 재물 에너지를 느끼며 첫 번째 카드를 뽑아주세요",
  "돈이 들어오는 경로를 생각하며 두 번째 카드를 뽑아주세요",
  "재물 증대 방법을 구하며 세 번째 카드를 뽑아주세요"
];

// 건강 & 자기관리
const healthFortuneQuestions = [
  "현재 건강 상태를 느끼며 첫 번째 카드를 뽑아주세요",
  "몸과 마음의 균형을 생각하며 두 번째 카드를 뽑아주세요",
  "건강 관리 조언을 구하며 세 번째 카드를 뽑아주세요"
];

const energyStateQuestions = [
  "현재 에너지 레벨을 느끼며 첫 번째 카드를 뽑아주세요",
  "에너지 소모 원인을 생각하며 두 번째 카드를 뽑아주세요",
  "에너지 충전 방법을 구하며 세 번째 카드를 뽑아주세요"
];

const lifestyleAdviceQuestions = [
  "현재 생활 패턴을 돌아보며 첫 번째 카드를 뽑아주세요",
  "개선이 필요한 부분을 생각하며 두 번째 카드를 뽑아주세요",
  "더 나은 생활을 위한 조언을 구하며 세 번째 카드를 뽑아주세요"
];

const mentalStabilityQuestions = [
  "현재 마음 상태를 느끼며 첫 번째 카드를 뽑아주세요",
  "스트레스와 걱정을 떠올리며 두 번째 카드를 뽑아주세요",
  "정신적 평화를 위한 조언을 구하며 세 번째 카드를 뽑아주세요"
];

// 종합 운세
const todayMonthFortuneQuestions = [
  "오늘/이번 달의 전반적인 흐름을 생각하며 첫 번째 카드를 뽑아주세요",
  "주의할 점과 기회를 떠올리며 두 번째 카드를 뽑아주세요",
  "최고의 결과를 위한 조언을 구하며 세 번째 카드를 뽑아주세요"
];

const overallFlowQuestions = [
  "현재 인생의 흐름을 느끼며 첫 번째 카드를 뽑아주세요",
  "앞으로의 변화를 생각하며 두 번째 카드를 뽑아주세요",
  "흐름을 타는 방법을 구하며 세 번째 카드를 뽑아주세요"
];

const opportunityChallengeQuestions = [
  "다가오는 기회를 생각하며 첫 번째 카드를 뽑아주세요",
  "맞닥뜨릴 도전을 떠올리며 두 번째 카드를 뽑아주세요",
  "성공을 위한 전략을 구하며 세 번째 카드를 뽑아주세요"
];

const lifeTurningPointQuestions = [
  "현재 인생의 위치를 돌아보며 첫 번째 카드를 뽑아주세요",
  "전환점의 신호를 느끼며 두 번째 카드를 뽑아주세요",
  "새로운 시작을 위한 메시지를 구하며 세 번째 카드를 뽑아주세요"
];

// 스프레드 타입 목록
export const spreadTypes: SpreadType[] = [
  // 연애 & 관계
  {
    key: "loveFortune",
    name: "연애운",
    description: "현재와 미래의 연애 흐름",
    questions: loveFortuneQuestions,
    categoryKey: "love"
  },
  {
    key: "crushSomething",
    name: "짝사랑 / 썸 상황",
    description: "상대방의 마음과 관계 발전 가능성",
    questions: crushSomethingQuestions,
    categoryKey: "love"
  },
  {
    key: "relationshipCompatibility",
    name: "관계 궁합",
    description: "연애, 우정, 인연의 궁합도",
    questions: relationshipCompatibilityQuestions,
    categoryKey: "love"
  },
  {
    key: "breakupReunion",
    name: "헤어짐 / 재회",
    description: "이별 상황과 재회 가능성",
    questions: breakupReunionQuestions,
    categoryKey: "love"
  },

  // 금전 & 커리어
  {
    key: "moneyFortune",
    name: "금전운",
    description: "재정 상황과 돈의 흐름",
    questions: moneyFortuneQuestions,
    categoryKey: "money"
  },
  {
    key: "careerChoice",
    name: "직업 / 진로 선택",
    description: "최적의 직업과 진로 방향",
    questions: careerChoiceQuestions,
    categoryKey: "money"
  },
  {
    key: "careerGrowth",
    name: "커리어 성장",
    description: "직업적 발전과 성장 전략",
    questions: careerGrowthQuestions,
    categoryKey: "money"
  },
  {
    key: "wealthFlow",
    name: "재물 흐름",
    description: "돈이 들어오는 경로와 증대 방법",
    questions: wealthFlowQuestions,
    categoryKey: "money"
  },

  // 건강 & 자기관리
  {
    key: "healthFortune",
    name: "건강운",
    description: "신체적, 정신적 건강 상태",
    questions: healthFortuneQuestions,
    categoryKey: "health"
  },
  {
    key: "energyState",
    name: "에너지 상태",
    description: "현재 에너지 레벨과 충전 방법",
    questions: energyStateQuestions,
    categoryKey: "health"
  },
  {
    key: "lifestyleAdvice",
    name: "생활 습관 조언",
    description: "더 나은 생활을 위한 개선점",
    questions: lifestyleAdviceQuestions,
    categoryKey: "health"
  },
  {
    key: "mentalStability",
    name: "정신적 안정",
    description: "마음의 평화와 스트레스 관리",
    questions: mentalStabilityQuestions,
    categoryKey: "health"
  },

  // 종합 운세
  {
    key: "todayMonthFortune",
    name: "오늘/이번 달 운세",
    description: "단기간의 전반적인 운세 흐름",
    questions: todayMonthFortuneQuestions,
    categoryKey: "overall"
  },
  {
    key: "overallFlow",
    name: "전반적인 흐름",
    description: "인생의 큰 흐름과 방향성",
    questions: overallFlowQuestions,
    categoryKey: "overall"
  },
  {
    key: "opportunityChallenge",
    name: "기회와 도전",
    description: "다가올 기회와 극복할 도전",
    questions: opportunityChallengeQuestions,
    categoryKey: "overall"
  },
  {
    key: "lifeTurningPoint",
    name: "인생 전환점 메시지",
    description: "새로운 시작을 위한 우주의 메시지",
    questions: lifeTurningPointQuestions,
    categoryKey: "overall"
  }
];

// 카테고리 정의
export interface Category {
  key: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const categories: Category[] = [
  {
    key: "love",
    name: "연애 & 관계",
    icon: "💕",
    description: "사랑, 인간관계, 궁합에 관한 운세",
    color: "from-pink-500 to-red-500"
  },
  {
    key: "money",
    name: "금전 & 커리어",
    icon: "💰",
    description: "재정, 직업, 성공에 관한 운세",
    color: "from-yellow-500 to-orange-500"
  },
  {
    key: "health",
    name: "건강 & 자기관리",
    icon: "🌱",
    description: "건강, 에너지, 생활습관에 관한 운세",
    color: "from-green-500 to-emerald-500"
  },
  {
    key: "overall",
    name: "종합 운세",
    icon: "✨",
    description: "전반적인 흐름과 기회에 관한 운세",
    color: "from-purple-500 to-indigo-500"
  }
];

// 카테고리별 스프레드 타입 조회 함수
export const getSpreadTypesByCategory = (categoryKey: string): SpreadType[] => {
  return spreadTypes.filter(spread => spread.categoryKey === categoryKey);
};

// 카테고리 정보 조회 함수
export const getCategoryByKey = (categoryKey: string): Category | undefined => {
  return categories.find(category => category.key === categoryKey);
};
