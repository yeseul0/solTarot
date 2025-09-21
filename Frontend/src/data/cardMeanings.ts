// 타로 카드 전체 이름 매핑
export const cardMeanings = {
  // 메이저 아르카나
  "m 0": "The Fool",
  "m 1": "The Magician",
  "m 2": "The High Priestess",
  "m 3": "The Empress",
  "m 4": "The Emperor",
  "m 5": "The Hierophant",
  "m 6": "The Lovers",
  "m 7": "The Chariot",
  "m 8": "Strength",
  "m 9": "The Hermit",
  "m 10": "Wheel of Fortune",
  "m 11": "Justice",
  "m 12": "The Hanged Man",
  "m 13": "Death",
  "m 14": "Temperance",
  "m 15": "The Devil",
  "m 16": "The Tower",
  "m 17": "The Star",
  "m 18": "The Moon",
  "m 19": "The Sun",
  "m 20": "Judgement",
  "m 21": "The World",

  // 마이너 아르카나 - Wands
  "w 1": "Ace of Wands",
  "w 2": "Two of Wands",
  "w 3": "Three of Wands",
  "w 4": "Four of Wands",
  "w 5": "Five of Wands",
  "w 6": "Six of Wands",
  "w 7": "Seven of Wands",
  "w 8": "Eight of Wands",
  "w 9": "Nine of Wands",
  "w 10": "Ten of Wands",
  "w n": "Knight of Wands",
  "w p": "Page of Wands",
  "w q": "Queen of Wands",
  "w k": "King of Wands",

  // 마이너 아르카나 - Cups
  "c 1": "Ace of Cups",
  "c 2": "Two of Cups",
  "c 3": "Three of Cups",
  "c 4": "Four of Cups",
  "c 5": "Five of Cups",
  "c 6": "Six of Cups",
  "c 7": "Seven of Cups",
  "c 8": "Eight of Cups",
  "c 9": "Nine of Cups",
  "c 10": "Ten of Cups",
  "c n": "Knight of Cups",
  "c p": "Page of Cups",
  "c q": "Queen of Cups",
  "c k": "King of Cups",

  // 마이너 아르카나 - Swords
  "s 1": "Ace of Swords",
  "s 2": "Two of Swords",
  "s 3": "Three of Swords",
  "s 4": "Four of Swords",
  "s 5": "Five of Swords",
  "s 6": "Six of Swords",
  "s 7": "Seven of Swords",
  "s 8": "Eight of Swords",
  "s 9": "Nine of Swords",
  "s 10": "Ten of Swords",
  "s n": "Knight of Swords",
  "s p": "Page of Swords",
  "s q": "Queen of Swords",
  "s k": "King of Swords",

  // 마이너 아르카나 - Pentacles
  "p 1": "Ace of Pentacles",
  "p 2": "Two of Pentacles",
  "p 3": "Three of Pentacles",
  "p 4": "Four of Pentacles",
  "p 5": "Five of Pentacles",
  "p 6": "Six of Pentacles",
  "p 7": "Seven of Pentacles",
  "p 8": "Eight of Pentacles",
  "p 9": "Nine of Pentacles",
  "p 10": "Ten of Pentacles",
  "p n": "Knight of Pentacles",
  "p p": "Page of Pentacles",
  "p q": "Queen of Pentacles",
  "p k": "King of Pentacles",
};

export const getCardFullName = (filename: string): string => {
  // 파일명에서 카드 키 추출 (예: "/src/assets/WaiteTarot/m 0.jpg" → "m 0")
  const match = filename.match(/([mwcsp] (?:\d+|[npqk]))/);
  if (match) {
    const key = match[1];
    return cardMeanings[key as keyof typeof cardMeanings] || key;
  }
  return filename;
};