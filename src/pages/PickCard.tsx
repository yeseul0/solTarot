import React, { useState, useEffect } from "react";
import TarotCard from "../components/Card/Card";
import { getCardFullName } from "../data/cardMeanings";
import { SpreadType } from "../data/spreadTypes";
import { useLocation } from "react-router-dom";

// 78장 타로덱 생성 + 이미지 매핑
const createTarotDeck = () => {
  const cards = [];
  
  // 메이저 아르카나 (0-21) - 22장
  for (let i = 0; i <= 21; i++) {
    cards.push({
      id: i + 1,
      name: `Major ${i}`,
      image: `/src/assets/WaiteTarot/m ${i}.jpg`,
      korName: `메이저 ${i}`,
    });
  }
  
  // 마이너 아르카나 각 수트별 14장씩 (1-10, n, p, q, k)
  const suits = ['w', 'c', 's', 'p'];
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'n', 'p', 'q', 'k'];
  
  suits.forEach((suit, suitIndex) => {
    numbers.forEach((num, numIndex) => {
      cards.push({
        id: 22 + suitIndex * 14 + numIndex + 1,
        name: `${suit.toUpperCase()} ${num}`,
        image: `/src/assets/WaiteTarot/${suit} ${num}.jpg`,
        korName: `${suit.toUpperCase()} ${num}`,
      });
    });
  });
  
  return cards;
};

const TAROT_DECK = createTarotDeck();

const PickCard: React.FC = () => {
  const location = useLocation();

  // 기존 상태들
  const [picked, setPicked] = useState<number[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [revealed, setRevealed] = useState<number>(0);

  // Welcome 페이지에서 전달받은 스프레드 정보 사용
  const [selectedSpread, setSelectedSpread] = useState<SpreadType | null>(
    location.state?.selectedSpread || null
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);  // 각 질문별로 선택된 카드들
  const [currentPickedCard, setCurrentPickedCard] = useState<number | null>(null);  // 현재 단계에서 선택한 카드
  
  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    if (confirmed && revealed<3) {
        const timer = setTimeout(() => setRevealed(revealed+1), 700);
        return () => clearTimeout(timer);
    }
    if (confirmed && revealed ===3 ) {
        //fetchFortune();
    }
  }, [confirmed, revealed]);

  // 스프레드 타입 선택 함수
  const selectSpread = (spread: SpreadType) => {
    setSelectedSpread(spread);
    setCurrentQuestionIndex(0);
    setSelectedCards([]);
    setCurrentPickedCard(null);
  };

  // 단계별 카드 선택 함수 - 각 질문마다 한 장씩만 선택
  const pickCardForQuestion = (idx: number) => {
    if (currentPickedCard === idx) {
      // 이미 선택된 카드를 다시 클릭하면 선택 취소
      setCurrentPickedCard(null);
    } else if (!selectedCards.includes(idx)) {
      // 이미 다른 단계에서 선택된 카드가 아니면 선택
      setCurrentPickedCard(idx);
    }
  };

  // 현재 질문에 대한 카드 선택 확정 후 다음 단계로
  const confirmCurrentCard = () => {
    if (currentPickedCard !== null) {
      const newSelectedCards = [...selectedCards, currentPickedCard];
      setSelectedCards(newSelectedCards);

      if (currentQuestionIndex < 2) {
        // 아직 더 선택할 카드가 있으면 다음 질문으로
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentPickedCard(null);
      } else {
        // 3장 모두 선택 완료 - 결과 화면으로
        setPicked(newSelectedCards);  // 기존 picked 상태에 저장
        setAnimatingOut(true);
        setTimeout(() => {
          setConfirmed(true);
          setAnimatingOut(false);
        }, 800);
      }
    }
  };



  const resetPick = () => {
    // 모든 상태 초기화
    setPicked([]);
    setConfirmed(false);
    setRevealed(0);
    setSelectedSpread(null);
    setCurrentQuestionIndex(0);
    setSelectedCards([]);
    setCurrentPickedCard(null);
  };

  // 부채꼴 각도 계산 - 모바일에서는 2줄로
  const total = TAROT_DECK.length;
  const halfTotal = Math.ceil(total / 2);
  
  // 모바일: 2줄, 데스크톱: 1줄
  const getCardPosition = (index: number) => {
    if (isMobile) {
      // 모바일: 2줄로 배치 - 화면 중앙에 위치
      const isTopRow = index < halfTotal;
      const rowIndex = isTopRow ? index : index - halfTotal;
      const rowTotal = isTopRow ? halfTotal : total - halfTotal;
      
      // 아래쪽 줄을 훨씬 더 넓게 펼치기 (거의 직선)
      const startAngle = isTopRow ? -45 : -70;  // 위는 적당히, 아래는 매우 넓게
      const endAngle = isTopRow ? 45 : 70;      // 위는 적당히, 아래는 매우 넓게
      
      const step = (endAngle - startAngle) / (rowTotal - 1);
      const angle = startAngle + rowIndex * step;
      // 위쪽 줄 내리고, 두 줄 간격 유지
      const yOffset = isTopRow ? -220 : -90;
      
      return { angle, yOffset };
    } else {
      // 데스크톱: 기존 1줄 배치
      const startAngle = -60;
      const endAngle = 60;
      const step = (endAngle - startAngle) / (total - 1);
      const angle = startAngle + index * step;
      
      return { angle, yOffset: -300 };
    }
  };

  return (
    <div style={styles.container}>
      {/* 스프레드 선택 화면 - Welcome 페이지 디자인과 통일 */}
      {!selectedSpread ? (
        <div style={styles.spreadSelectionContainer}>
          <h1 style={styles.mainTitle}>오늘 당신이 알곳 싶은 운명의 비밀은 무엇인가요?</h1>
          <div style={styles.spreadCardsWrapper}>
            {spreadTypes.map((spread) => (
              <div
                key={spread.key}
                style={styles.spreadCard}
                onClick={() => selectSpread(spread)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
              >
                <h3 style={styles.spreadTitle}>{spread.name}</h3>
                <p style={styles.spreadDescription}>{spread.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : !confirmed ? (
        // 단계별 카드 선택 화면
        <>
          <div style={{...styles.guide, ...(isMobile ? styles.guideMobile : {})}}>
            {selectedSpread.questions[currentQuestionIndex]}
          </div>

          {TAROT_DECK.map((card, i) => {
            const { angle, yOffset } = getCardPosition(i);
            const isAlreadySelected = selectedCards.includes(i);
            const isCurrentPicked = currentPickedCard === i;

            return (
              <TarotCard
                key={card.id}
                cardImage={card.image}
                cardName={getCardFullName(card.image)}
                picked={isCurrentPicked || isAlreadySelected}
                hovered={hovered === i && !isAlreadySelected}
                isFlipped={false}
                onPick={() => !isAlreadySelected && pickCardForQuestion(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={
                  animatingOut
                    ? cardStyles.animateOut(isCurrentPicked || isAlreadySelected)
                    : (isCurrentPicked || isAlreadySelected)
                      ? cardStyles.pickedResponsive(angle, yOffset, isMobile)
                      : cardStyles.defaultResponsive(angle, yOffset, hovered === i && !isAlreadySelected, isMobile)
                }
              />
            );
          })}

          {/* 현재 카드 선택 완료 버튼 */}
          {currentPickedCard !== null && (
            <button
              style={{...styles.resetBtn, ...(isMobile ? styles.btnMobile : {})}}
              onClick={confirmCurrentCard}
            >
              {currentQuestionIndex < 2 ? '다음 카드 선택' : '결과 확인'}
            </button>
          )}
        </>
      ) : (
        // 결과 화면
        <div style={cardStyles.resultContainer}>
          {picked.map((i) => {
            const card = TAROT_DECK[i];
            return (
              <TarotCard
                key={card.id}
                cardImage={card.image}
                cardName={getCardFullName(card.image)}
                picked={true}
                hovered={false}
                isFlipped={true}  // 자동으로 뒤집기
                style={cardStyles.result}
              />
            );
          })}
        </div>
      )}

      {/* 결과 화면에서만 다시 뽑기 버튼 표시 */}
      {confirmed && (
        <button style={{...styles.resetBtn, ...(isMobile ? styles.btnMobile : {})}} onClick={resetPick}>
          다시 뽑기
        </button>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "linear-gradient(135deg, #800000 0%, #b22222 100%)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    overflow: "hidden",
  },
  // 스프레드 선택 화면 스타일 - Welcome 페이지와 통일
  spreadSelectionContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    padding: "20px",
  },
  mainTitle: {
    color: "#fff",
    fontSize: window.innerWidth <= 768 ? 28 : 36,
    fontWeight: "bold",
    marginBottom: 50,
    textShadow: "0 2px 12px rgba(0,0,0,0.5)",
    textAlign: "center",
    maxWidth: "90%",
    lineHeight: 1.4,
  },
  spreadCardsWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
  },
  spreadCard: {
    background: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    padding: "25px 30px",
    width: "100%",
    maxWidth: 450,
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  spreadTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#8B4513",
    textAlign: "center",
  },
  spreadDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 1.5,
    textAlign: "center",
  },
  guide: {
    position: "absolute",
    top: 48,
    left: "50%",
    transform: "translateX(-50%)",
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textShadow: "0 1px 8px rgb(255, 255, 255)",
    zIndex: 1000,
    textAlign: "center",
    width: "90%",
  },
  guideMobile: {
    fontSize: 18,
    top: 24,
  },
  confirmBtn: {
    position: "absolute",
    bottom: 100,
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: 18,
    padding: "10px 32px",
    borderRadius: 24,
    background: "#fffbe6",
    border: "2px solid rgb(255, 255, 255)",
    cursor: "pointer",
    fontWeight: "bold",
    zIndex: 1000,
  },
  resetBtn: {
    position: "absolute",
    bottom: 40,
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: 18,
    padding: "10px 32px",
    borderRadius: 24,
    background: "#fffbe6",
    border: "2px solid rgb(255, 255, 255)",
    cursor: "pointer",
    fontWeight: "bold",
    zIndex: 1000,
  },
  btnMobile: {
    fontSize: 16,
    padding: "8px 24px",
    bottom: 20,
  },
};

const cardStyles = {
  // 카드 모으기 애니메이션 - 선택된 카드는 유지, 나머지는 사라짐
  animateOut: (isPicked: boolean): React.CSSProperties => ({
    position: "absolute",
    left: "50%",
    top: "50%",
    width: isPicked ? 120 : 0,  // 선택된 카드는 크기 유지
    height: isPicked ? 180 : 0,
    opacity: isPicked ? 1 : 0,  // 선택된 카드는 보이게
    transform: isPicked 
      ? "translate(-50%, -50%) scale(1.1)"  // 선택된 카드는 중앙으로 이동
      : "translate(-50%, -50%) scale(0)",   // 나머지는 사라짐
    transition: "all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)",
    zIndex: isPicked ? 1000 : 1,
  }),
  // 반응형 기본 카드
  defaultResponsive: (angle: number, yOffset: number, hovered: boolean, isMobile: boolean): React.CSSProperties => ({
    position: "absolute",
    left: "50%",
    bottom: isMobile ? "35%" : "20%",
    width: isMobile ? 80 : 120,
    height: isMobile ? 120 : 180,
    marginLeft: isMobile ? -40 : -60,
    background: "#000",
    border: "none",
    borderRadius: isMobile ? 8 : 10,
    boxShadow: hovered
      ? "0 8px 32px #b22222"
      : "2px 4px 10px rgb(81, 9, 9)",
    transform: `rotate(${angle}deg) translateY(${yOffset}px)`,
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    zIndex: 1,
  }),
  // 반응형 뽑힌 카드
  pickedResponsive: (angle: number, yOffset: number, isMobile: boolean): React.CSSProperties => ({
    position: "absolute",
    left: "50%",
    bottom: isMobile ? "35%" : "20%",
    width: isMobile ? 80 : 120,
    height: isMobile ? 120 : 180,
    marginLeft: isMobile ? -40 : -60,
    background: "#000",
    border: "none",
    borderRadius: isMobile ? 8 : 10,
    boxShadow: "0 8px 32px #b22222",
    transform: `rotate(${angle}deg) translateY(${isMobile ? yOffset + 40 : -80}px) scale(1.15)`,
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "default",
    zIndex: 100,
  }),
  // 결과 3장 컨테이너
  resultContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    gap: window.innerWidth <= 768 ? 15 : 25,
    flexWrap: "nowrap",
    padding: "20px",
    boxSizing: "border-box",
  } as React.CSSProperties,
  // 결과 3장 카드
  result: {
    position: "static",
    width: window.innerWidth <= 768 ? 100 : 140,
    height: window.innerWidth <= 768 ? 150 : 210,
    background: "transparent",
    border: "none",
    borderRadius: 10,
    transition: "transform 0.2s, box-shadow 0.2s",
    zIndex: 1,
  } as React.CSSProperties,
};

export default PickCard;
