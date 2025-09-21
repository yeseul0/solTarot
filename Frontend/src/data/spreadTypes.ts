// 타로 스프레드 타입 정의
export interface SpreadType {
  key: string;
  name: string;
  description: string;
  questions: string[];
}

// 과거·현재·미래 스프레드 질문
const pastPresentFutureQuestions = [
  "과거를 돌아보며 첫 번째 카드를 뽑아주세요",
  "현재 상황에 집중하며 두 번째 카드를 뽑아주세요",
  "미래에 대한 기대를 담아 세 번째 카드를 뽑아주세요"
];

// 연애·인간관계 스프레드 질문
const loveRelationshipQuestions = [
  "자신에 대해 생각하며 첫 번째 카드를 뽑아주세요",
  "상대방을 떠올리며 두 번째 카드를 뽑아주세요",
  "둘의 관계에 집중하며 세 번째 카드를 뽑아주세요"
];

// 고민·해결책 스프레드 질문
const worryAdviceQuestions = [
  "현재 고민거리를 떠올리며 첫 번째 카드를 뽑아주세요",
  "해결책을 구하는 마음으로 두 번째 카드를 뽑아주세요",
  "결과에 대한 궁금증을 담아 세 번째 카드를 뽑아주세요"
];

// 스프레드 타입 목록
export const spreadTypes: SpreadType[] = [
  {
    key: "pastPresentFuture",
    name: "과거·현재·미래",
    description: "시간의 흐름으로 보는 운세",
    questions: pastPresentFutureQuestions
  },
  {
    key: "loveRelationship",
    name: "연애·인간관계",
    description: "나와 상대방의 마음과 관계",
    questions: loveRelationshipQuestions
  },
  {
    key: "worryAdvice",
    name: "고민·해결책",
    description: "문제 상황과 조언, 결과",
    questions: worryAdviceQuestions
  }
];