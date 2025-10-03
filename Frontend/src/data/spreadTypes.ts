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
  "현재 연애 고민을 생각하면서 첫 번째 카드를 뽑아줘",
  "이번엔 앞으로의 연애 운이 어떻게 될지 볼게",
  "마지막으로 이 연애가 잘되려면 어떻게 해야하는지를 볼게"
];

const crushSomethingQuestions = [
  "그 사람에 대한 마음을 떠올리면서 첫 번째 카드를 뽑아줘",
  "이번엔 그 사람이 나를 어떻게 생각하는지 확인해볼게",
  "마지막으로 우리 사이가 발전할 수 있을지 알아볼게"
];

const relationshipCompatibilityQuestions = [
  "지금 내 마음 상태를 생각하면서 첫 번째 카드를 뽑아줘",
  "이번엔 그 사람의 마음을 들여다볼게",
  "마지막으로 우리가 잘 맞을지 궁합을 확인해볼게"
];

const breakupReunionQuestions = [
  "지금 상황과 내 감정을 생각하면서 첫 번째 카드를 뽑아줘",
  "이번엔 그 사람과의 과거를 돌아볼게",
  "마지막으로 앞으로 어떻게 될지 운명을 확인해볼게"
];

// 금전 & 커리어
const moneyFortuneQuestions = [
  "현재 돈 걱정을 생각하면서 첫 번째 카드를 뽑아줘",
  "이번엔 돈이 들어올 기회가 있는지 확인해볼게",
  "마지막으로 돈 관리를 어떻게 해야 할지 조언을 받아볼게"
];

const careerChoiceQuestions = [
  "진로 고민을 떠올리면서 첫 번째 카드를 뽑아줘",
  "이번엔 내 능력과 적성이 어떤지 알아볼게",
  "마지막으로 어떤 선택이 좋을지 답을 찾아볼게"
];

const careerGrowthQuestions = [
  "현재 직장 상황을 생각하면서 첫 번째 카드를 뽑아줘",
  "이번엔 성장할 기회가 있는지 살펴볼게",
  "마지막으로 어떻게 발전해야 할지 방향을 확인해볼게"
];

const wealthFlowQuestions = [
  "현재 재물 운을 생각하면서 첫 번째 카드를 뽑아줘",
  "이번엔 돈이 어디서 들어올지 경로를 확인해볼게",
  "마지막으로 돈을 늘리는 방법을 알아볼게"
];

// 건강 & 자기관리
const healthFortuneQuestions = [
  "현재 건강 상태를 생각하면서 첫 번째 카드를 뽑아줘",
  "이번엔 몸과 마음의 균형 상태를 확인해볼게",
  "마지막으로 건강을 어떻게 관리해야 할지 조언을 받아볼게"
];

const energyStateQuestions = [
  "요즘 에너지 상태를 생각하면서 첫 번째 카드를 뽑아줘",
  "이번엔 왜 피곤한지 원인을 찾아볼게",
  "마지막으로 에너지를 어떻게 충전할지 방법을 알아볼게"
];

const lifestyleAdviceQuestions = [
  "현재 생활 패턴을 생각하면서 첫 번째 카드를 뽑아줘",
  "이번엔 뭘 바꿔야 할지 포인트를 확인해볼게",
  "마지막으로 더 나은 생활을 위한 조언을 받아볼게"
];

const mentalStabilityQuestions = [
  "지금 마음 상태를 생각하면서 첫 번째 카드를 뽑아줘",
  "이번엔 스트레스와 걱정의 원인을 살펴볼게",
  "마지막으로 마음의 평화를 찾는 방법을 알아볼게"
];

// 종합 운세
const todayMonthFortuneQuestions = [
  "오늘/이번 달 운세가 궁금하면서 첫 번째 카드를 뽑아줘",
  "이번엔 주의할 점이 뭔지 확인해볼게",
  "마지막으로 좋은 결과를 얻는 방법을 알아볼게"
];

const overallFlowQuestions = [
  "요즘 인생의 흐름을 생각하면서 첫 번째 카드를 뽑아줘",
  "이번엔 앞으로 어떤 변화가 있을지 살펴볼게",
  "마지막으로 흐름을 잘 타는 방법을 확인해볼게"
];

const opportunityChallengeQuestions = [
  "다가올 기회를 생각하면서 첫 번째 카드를 뽑아줘",
  "이번엔 어떤 어려움이 있을지 미리 확인해볼게",
  "마지막으로 성공하는 전략을 알아볼게"
];

const lifeTurningPointQuestions = [
  "지금 내 인생을 돌아보면서 첫 번째 카드를 뽑아줘",
  "이번엔 변화의 신호가 있는지 확인해볼게",
  "마지막으로 새로운 시작을 위한 메시지를 받아볼게"
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
