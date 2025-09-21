// 타로 카드 데이터 정의
export interface TarotCard {
  id: number;
  name: string;
  korName: string;
  arcana: 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';
  number: string | number;
  image: string;
  keywords: string[];
  meaning: {
    upright: string;
    reversed: string;
  };
}

// 이미지 import 함수
const getCardImage = (prefix: string, num: string | number): string => {
  return `/src/assets/WaiteTarot/${prefix} ${num}.jpg`;
};

// 메이저 아르카나 (0-21)
const majorArcana: TarotCard[] = [
  { id: 1, name: "The Fool", korName: "바보", arcana: "major", number: 0, 
    image: getCardImage("m", 0), keywords: ["시작", "순수", "모험"],
    meaning: { upright: "새로운 시작, 순수함, 자발성", reversed: "무모함, 위험, 어리석음" }},
  { id: 2, name: "The Magician", korName: "마법사", arcana: "major", number: 1,
    image: getCardImage("m", 1), keywords: ["의지", "창조", "능력"],
    meaning: { upright: "의지력, 창조성, 자신감", reversed: "속임수, 환상, 재능 낭비" }},
  { id: 3, name: "The High Priestess", korName: "여사제", arcana: "major", number: 2,
    image: getCardImage("m", 2), keywords: ["직관", "신비", "지혜"],
    meaning: { upright: "직관, 무의식, 신비", reversed: "숨겨진 동기, 혼란, 표면적 지식" }},
  // ... 나머지 메이저 아르카나 추가
];

// 완드 (Wands) - 불의 원소, 열정과 창의성
const wands: TarotCard[] = [
  { id: 23, name: "Ace of Wands", korName: "완드 에이스", arcana: "wands", number: 1,
    image: getCardImage("w", 1), keywords: ["영감", "시작", "성장"],
    meaning: { upright: "새로운 기회, 영감, 성장", reversed: "지연, 좌절, 창의력 부족" }},
  { id: 24, name: "Two of Wands", korName: "완드 2", arcana: "wands", number: 2,
    image: getCardImage("w", 2), keywords: ["계획", "진보", "결정"],
    meaning: { upright: "미래 계획, 진보, 장기 목표", reversed: "계획 부족, 두려움, 조직 부족" }},
  // ... 나머지 완드 카드 추가
];

// 컵 (Cups) - 물의 원소, 감정과 관계
const cups: TarotCard[] = [
  { id: 37, name: "Ace of Cups", korName: "컵 에이스", arcana: "cups", number: 1,
    image: getCardImage("c", 1), keywords: ["사랑", "감정", "직관"],
    meaning: { upright: "새로운 사랑, 감정적 시작, 창의성", reversed: "감정 억압, 공허함, 상실" }},
  // ... 나머지 컵 카드 추가
];

// 소드 (Swords) - 공기의 원소, 사고와 소통
const swords: TarotCard[] = [
  { id: 51, name: "Ace of Swords", korName: "소드 에이스", arcana: "swords", number: 1,
    image: getCardImage("s", 1), keywords: ["명확성", "돌파구", "진실"],
    meaning: { upright: "정신적 명확성, 돌파구, 새로운 아이디어", reversed: "혼란, 잘못된 생각, 정신적 갈등" }},
  // ... 나머지 소드 카드 추가
];

// 펜타클 (Pentacles) - 땅의 원소, 물질과 실용성
const pentacles: TarotCard[] = [
  { id: 65, name: "Ace of Pentacles", korName: "펜타클 에이스", arcana: "pentacles", number: 1,
    image: getCardImage("p", 1), keywords: ["번영", "기회", "안정"],
    meaning: { upright: "새로운 재정적 기회, 번영, 안정", reversed: "기회 상실, 계획 실패, 탐욕" }},
  // ... 나머지 펜타클 카드 추가
];

// 전체 덱 (78장)
export const FULL_DECK: TarotCard[] = [
  ...majorArcana,
  ...wands,
  ...cups,
  ...swords,
  ...pentacles
];

// 카드 ID로 찾기
export const getCardById = (id: number): TarotCard | undefined => {
  return FULL_DECK.find(card => card.id === id);
};

// 랜덤 카드 뽑기
export const getRandomCards = (count: number): TarotCard[] => {
  const shuffled = [...FULL_DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};