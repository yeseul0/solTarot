// 타로 카드 데이터 정의 (현재는 getCardNameByIndex() 함수로 대체됨)
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

// FULL_DECK은 현재 fallback용으로만 사용됨
// 실제 카드 데이터는 아래 함수들로 관리
export const FULL_DECK: TarotCard[] = [];

// 인덱스(0-77)를 카드 이미지 경로로 변환하는 함수
export const getCardImagePath = (index: number): string => {
  if (index < 22) {
    // 메이저 아르카나 (0-21) -> m 0.jpg ~ m 21.jpg
    return `/src/assets/WaiteTarot/m ${index}.jpg`;
  } else if (index < 36) {
    // 완드 (22-35) -> w 1.jpg ~ w 10.jpg, w p.jpg, w n.jpg, w q.jpg, w k.jpg
    const cardNum = index - 21;
    if (cardNum <= 10) {
      return `/src/assets/WaiteTarot/w ${cardNum}.jpg`;
    } else {
      const courtCards = ['p', 'n', 'q', 'k']; // Page, Knight, Queen, King
      return `/src/assets/WaiteTarot/w ${courtCards[cardNum - 11]}.jpg`;
    }
  } else if (index < 50) {
    // 컵 (36-49) -> c 1.jpg ~ c 10.jpg, c p.jpg, c n.jpg, c q.jpg, c k.jpg
    const cardNum = index - 35;
    if (cardNum <= 10) {
      return `/src/assets/WaiteTarot/c ${cardNum}.jpg`;
    } else {
      const courtCards = ['p', 'n', 'q', 'k'];
      return `/src/assets/WaiteTarot/c ${courtCards[cardNum - 11]}.jpg`;
    }
  } else if (index < 64) {
    // 소드 (50-63) -> s 1.jpg ~ s 10.jpg, s p.jpg, s n.jpg, s q.jpg, s k.jpg
    const cardNum = index - 49;
    if (cardNum <= 10) {
      return `/src/assets/WaiteTarot/s ${cardNum}.jpg`;
    } else {
      const courtCards = ['p', 'n', 'q', 'k'];
      return `/src/assets/WaiteTarot/s ${courtCards[cardNum - 11]}.jpg`;
    }
  } else {
    // 펜타클 (64-77) -> p 1.jpg ~ p 10.jpg, p p.jpg, p n.jpg, p q.jpg, p k.jpg
    const cardNum = index - 63;
    if (cardNum <= 10) {
      return `/src/assets/WaiteTarot/p ${cardNum}.jpg`;
    } else {
      const courtCards = ['p', 'n', 'q', 'k'];
      return `/src/assets/WaiteTarot/p ${courtCards[cardNum - 11]}.jpg`;
    }
  }
};

// 인덱스를 백엔드용 카드 이름으로 변환하는 함수 (the-fool, the-magician 형태)
export const getCardNameByIndex = (index: number): string => {
  if (index < 22) {
    // 메이저 아르카나 (0-21)
    const majorNames = [
      "the-fool", "the-magician", "the-high-priestess", "the-empress", "the-emperor",
      "the-hierophant", "the-lovers", "the-chariot", "strength", "the-hermit",
      "wheel-of-fortune", "justice", "the-hanged-man", "death", "temperance",
      "the-devil", "the-tower", "the-star", "the-moon", "the-sun",
      "judgement", "the-world"
    ];
    return majorNames[index];
  } else if (index < 36) {
    // 완드 (22-35)
    const cardNum = index - 21;
    if (cardNum <= 10) {
      return `${cardNum}-of-wands`;
    } else {
      const courts = ['page-of-wands', 'knight-of-wands', 'queen-of-wands', 'king-of-wands'];
      return courts[cardNum - 11];
    }
  } else if (index < 50) {
    // 컵 (36-49)
    const cardNum = index - 35;
    if (cardNum <= 10) {
      return `${cardNum}-of-cups`;
    } else {
      const courts = ['page-of-cups', 'knight-of-cups', 'queen-of-cups', 'king-of-cups'];
      return courts[cardNum - 11];
    }
  } else if (index < 64) {
    // 소드 (50-63)
    const cardNum = index - 49;
    if (cardNum <= 10) {
      return `${cardNum}-of-swords`;
    } else {
      const courts = ['page-of-swords', 'knight-of-swords', 'queen-of-swords', 'king-of-swords'];
      return courts[cardNum - 11];
    }
  } else {
    // 펜타클 (64-77)
    const cardNum = index - 63;
    if (cardNum <= 10) {
      return `${cardNum}-of-pentacles`;
    } else {
      const courts = ['page-of-pentacles', 'knight-of-pentacles', 'queen-of-pentacles', 'king-of-pentacles'];
      return courts[cardNum - 11];
    }
  }

  // 혹시 모를 경우를 위한 기본값
  console.warn(`알 수 없는 카드 인덱스: ${index}`);
  return "the-fool"; // 기본값
};

// 백엔드 카드명을 프론트엔드 인덱스로 변환하는 함수 (역변환)
export const getCardIndexByName = (cardName: string): number => {
  // 안전장치: cardName이 없으면 기본값 반환
  if (!cardName || typeof cardName !== 'string') {
    console.warn(`잘못된 카드명: ${cardName}`);
    return 0; // 기본값으로 the-fool 반환
  }

  // 메이저 아르카나
  const majorNames = [
    "the-fool", "the-magician", "the-high-priestess", "the-empress", "the-emperor",
    "the-hierophant", "the-lovers", "the-chariot", "strength", "the-hermit",
    "wheel-of-fortune", "justice", "the-hanged-man", "death", "temperance",
    "the-devil", "the-tower", "the-star", "the-moon", "the-sun",
    "judgement", "the-world"
  ];

  const majorIndex = majorNames.indexOf(cardName);
  if (majorIndex !== -1) return majorIndex;

  // 마이너 아르카나
  if (cardName.includes('-of-wands')) {
    const match = cardName.match(/(\d+|page|knight|queen|king)-of-wands/);
    if (match) {
      const card = match[1];
      if (!isNaN(Number(card))) {
        return 21 + Number(card); // 22-31
      } else {
        const courts = ['page', 'knight', 'queen', 'king'];
        return 32 + courts.indexOf(card); // 32-35
      }
    }
  }

  if (cardName.includes('-of-cups')) {
    const match = cardName.match(/(\d+|page|knight|queen|king)-of-cups/);
    if (match) {
      const card = match[1];
      if (!isNaN(Number(card))) {
        return 35 + Number(card); // 36-45
      } else {
        const courts = ['page', 'knight', 'queen', 'king'];
        return 46 + courts.indexOf(card); // 46-49
      }
    }
  }

  if (cardName.includes('-of-swords')) {
    const match = cardName.match(/(\d+|page|knight|queen|king)-of-swords/);
    if (match) {
      const card = match[1];
      if (!isNaN(Number(card))) {
        return 49 + Number(card); // 50-59
      } else {
        const courts = ['page', 'knight', 'queen', 'king'];
        return 60 + courts.indexOf(card); // 60-63
      }
    }
  }

  if (cardName.includes('-of-pentacles')) {
    const match = cardName.match(/(\d+|page|knight|queen|king)-of-pentacles/);
    if (match) {
      const card = match[1];
      if (!isNaN(Number(card))) {
        return 63 + Number(card); // 64-73
      } else {
        const courts = ['page', 'knight', 'queen', 'king'];
        return 74 + courts.indexOf(card); // 74-77
      }
    }
  }

  console.warn(`알 수 없는 카드명: ${cardName}`);
  return 0; // 기본값으로 the-fool 반환
};