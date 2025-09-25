import React, { useState, useEffect } from "react";
import TarotCard from "../components/Card/Card";
import AIInterpretationBox from "../components/AIInterpretationBox/AIInterpretationBox";
import { SpreadType, spreadTypes } from "../data/spreadTypes";
import {
  FULL_DECK,
  TarotCard as TarotCardData,
  getCardImagePath,
  getCardNameByIndex,
  getCardIndexByName
} from "../data/tarotData";
import { useLocation, useNavigate } from "react-router-dom";

// 백엔드 API 타입 정의 (백엔드 스펙에 맞게 수정)
interface DrawnCard {
  cardName: string;  // 'the-fool' 형태의 카드 이름
  position: number;  // 1, 2, 3 (1부터 시작)
  isReversed: boolean;
}

interface CreateReadingRequest {
  walletAddress: string;
  spreadType: string;
  drawnCards: DrawnCard[];
}

interface CreateReadingResponse {
  id: number;
  walletAddress: string;
  spreadType: string;
  drawnCards: DrawnCard[];
  aiInterpretation: string;
  imageCid?: string;
  mintAddress?: string;
  isMinted: boolean;
  createdAt: string;
}


// 카드 정보와 방향 정보를 함께 관리하는 인터페이스
interface DrawnCardInfo {
  card: TarotCardData;
  isReversed: boolean;
  position: number; // 1, 2, 3
}

// Fisher-Yates 셔플 알고리즘
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

interface PickCardProps {
  wallet?: any; // wallet prop 추가 (현재는 사용하지 않지만 호환성을 위해)
}

const PickCard: React.FC<PickCardProps> = ({ wallet }) => {
  const location = useLocation();
  const navigate = useNavigate();

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
  const [selectedCards, setSelectedCards] = useState<DrawnCardInfo[]>([]);  // 각 질문별로 선택된 카드들 (방향 정보 포함)
  const [currentPickedCard, setCurrentPickedCard] = useState<number | null>(null);  // 현재 단계에서 선택한 카드
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);  // 선택된 카드들의 인덱스

  // 섞인 카드 덱
  const [shuffledDeck, setShuffledDeck] = useState<number[]>([]);

  // API 관련 상태
  const [aiInterpretation, setAiInterpretation] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // 카드 애니메이션 단계 관리
  const [showAIBox, setShowAIBox] = useState<boolean>(false);
  const [showAIContent, setShowAIContent] = useState<boolean>(false);

  // 컴포넌트 마운트시 카드 덱 섞기
  useEffect(() => {
    try {
      const initialDeck = Array.from({ length: 78 }, (_, i) => i);
      const shuffled = shuffleArray(initialDeck);
      setShuffledDeck(shuffled);
      console.log("🔀 카드 덱이 랜덤하게 섞였습니다!");
      console.log("섞인 순서:", shuffled.slice(0, 10), "...");
    } catch (error) {
      console.error("카드 덱 섞기 중 오류:", error);
      // 실패시 기본 순서로 설정
      setShuffledDeck(Array.from({ length: 78 }, (_, i) => i));
    }
  }, []);

  // 백엔드 API 호출 함수
  const fetchFortune = async () => {
    if (!wallet.address || !selectedSpread || selectedCards.length === 0) {
      setApiError("지갑 주소, 스프레드 타입, 또는 선택된 카드가 없습니다.");
      return;
    }

    console.log("🚀 API 호출 시작");
    console.log("📊 FULL_DECK 길이:", FULL_DECK.length);
    console.log("📊 FULL_DECK 내용 확인:");
    console.log("   - FULL_DECK[0]:", FULL_DECK[0]);
    console.log("   - FULL_DECK[22]:", FULL_DECK[22]);
    console.log("   - FULL_DECK[50]:", FULL_DECK[50]);
    console.log("📋 selectedIndexes:", selectedIndexes);
    console.log("📋 selectedCards:", selectedCards);
    console.log("🃏 각 카드 상세:");
    selectedIndexes.forEach((cardIndex, index) => {
      console.log(`   카드 ${index + 1}:`, {
        cardIndex: cardIndex,
        cardName: selectedCards[index]?.card?.name || 'UNDEFINED',
        isReversed: selectedCards[index]?.isReversed || false,
        position: selectedCards[index]?.position || index + 1
      });
    });

    // 만약 selectedIndexes가 비어있으면 중단
    if (selectedIndexes.length === 0) {
      setApiError("선택된 카드가 없습니다.");
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      // 프론트엔드 데이터를 백엔드 형식으로 변환
      const drawnCards: DrawnCard[] = selectedIndexes.map((cardIndex, index) => {
        console.log(`🃏 카드 ${index + 1} 변환 - 인덱스: ${cardIndex}, 역방향: ${selectedCards[index]?.isReversed}`);
        const cardName = getCardNameByIndex(cardIndex);
        console.log(`   -> 카드명: ${cardName}`);

        return {
          cardName: cardName, // 백엔드용 카드 이름 (the-fool 형태)
          position: index + 1, // 1, 2, 3으로 변환 (백엔드는 1부터 시작)
          isReversed: selectedCards[index]?.isReversed || false
        };
      });

      const requestData: CreateReadingRequest = {
        walletAddress: wallet.address,
        spreadType: selectedSpread.key,
        drawnCards
      };

      console.log("🚀 백엔드 API 호출 시작:", requestData);

      // 백엔드 API 호출
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tarot/reading`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
      }

      const result: CreateReadingResponse = await response.json();
      console.log("✅ API 응답 성공:", result);
      console.log("📋 받은 카드 정보:", result.drawnCards);

      // 백엔드에서 올바른 카드 정보가 와도 기존 카드 상태 유지 (UI 안정성)
      console.log("🎯 백엔드 응답 완료 - 기존 카드 상태 유지하여 UI 안정화");

      setAiInterpretation(result.aiInterpretation);

    } catch (error) {
      console.error("❌ API 호출 오류:", error);
      setApiError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

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
        const timer = setTimeout(() => setRevealed(revealed+1), 300); // 500ms → 300ms (더 빠르게)
        return () => clearTimeout(timer);
    }
    // 3장의 카드가 모두 공개되면 위로 이동, 그 후 AI 박스 표시
    if (confirmed && revealed === 3 && !showAIBox) {
        console.log("🎯 카드 애니메이션 완료 - 카드 위로 이동 중...");
        // AI 박스를 더 늦게 표시
        const timer = setTimeout(() => {
            console.log("📦 카드 위로 이동 시작");
            setShowAIBox(true);
            // 0.2초 후에 AI 내용 표시
            setTimeout(() => {
                console.log("📦 AI 해석 박스 내용 표시");
                setShowAIContent(true);
            }, 200);
        }, 1200); // 카드 이름 완성 후 바로 위로 이동 시작 (1.5초 + 여유 0.1초)
        return () => clearTimeout(timer);
    }
  }, [confirmed, revealed, showAIBox]);

  // "결과 확인" 버튼 클릭 시 즉시 API 호출 시작
  useEffect(() => {
    if (confirmed && !isLoading && !aiInterpretation) {
        console.log("🚀 결과 확인 버튼 클릭됨 - 즉시 AI 해석 시작!");
        fetchFortune();
    }
  }, [confirmed]);

  // 스프레드 타입 선택 함수
  const selectSpread = (spread: SpreadType) => {
    setSelectedSpread(spread);
    setCurrentQuestionIndex(0);
    setSelectedCards([]);
    setCurrentPickedCard(null);
    setSelectedIndexes([]);
  };

  // 단계별 카드 선택 함수 - 각 질문마다 한 장씩만 선택
  const pickCardForQuestion = (idx: number) => {
    if (currentPickedCard === idx) {
      // 이미 선택된 카드를 다시 클릭하면 선택 취소
      setCurrentPickedCard(null);
    } else if (!selectedIndexes.includes(idx)) {
      // 이미 다른 단계에서 선택된 카드가 아니면 선택
      setCurrentPickedCard(idx);
    }
  };

  // 현재 질문에 대한 카드 선택 확정 후 다음 단계로
  const confirmCurrentCard = () => {
    if (currentPickedCard !== null) {
      // 🎲 랜덤으로 정/역방향 결정 (50% 확률)
      const isReversed = Math.random() < 0.5;

      // 선택된 카드 정보 생성
      const selectedCard = FULL_DECK[currentPickedCard] || {
        id: currentPickedCard + 1,
        name: getCardNameByIndex(currentPickedCard),
        korName: getCardNameByIndex(currentPickedCard),
        arcana: 'major' as const,
        number: currentPickedCard + 1,
        image: getCardImagePath(currentPickedCard),
        keywords: ['신비', '운명', '선택'],
        meaning: {
          upright: '긍정적인 변화와 새로운 시작',
          reversed: '주의가 필요한 상황, 내면의 성찰'
        }
      };


      const newCardInfo: DrawnCardInfo = {
        card: selectedCard,
        isReversed: isReversed,
        position: currentQuestionIndex + 1
      };

      const newSelectedCards = [...selectedCards, newCardInfo];
      const newSelectedIndexes = [...selectedIndexes, currentPickedCard];
      setSelectedCards(newSelectedCards);
      setSelectedIndexes(newSelectedIndexes);

      if (currentQuestionIndex < 2) {
        // 아직 더 선택할 카드가 있으면 다음 질문으로
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentPickedCard(null);
      } else {
        // 3장 모두 선택 완료 - 결과 화면으로
        setPicked(newSelectedCards.map((_, index) => index));  // 기존 picked 상태에 저장 (호환성)
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
    setSelectedIndexes([]);
    // AI 관련 상태 초기화
    setAiInterpretation("");
    setIsLoading(false);
    setApiError(null);
    // 애니메이션 상태 초기화
    setShowAIBox(false);
    setShowAIContent(false);
  };

  // 부채꼴 각도 계산 - 모바일에서는 2줄로
  const total = 78;  // 원래대로 78장 고정
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
          <h1 style={styles.mainTitle}>오늘 당신이 알고 싶은 운명의 비밀은 무엇인가요?</h1>
          <div style={styles.spreadCardsWrapper}>
            {spreadTypes.map((spread: SpreadType) => (
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
          <div style={{...styles.questionContainer, ...(isMobile ? styles.questionContainerMobile : {})}}>
            <div style={styles.questionBox}>
              <div style={styles.questionTitle}>
                {`${currentQuestionIndex + 1}번째 질문`}
              </div>
              <div style={styles.questionText}>
                {selectedSpread.questions[currentQuestionIndex]}
              </div>
            </div>
          </div>

          {shuffledDeck.length > 0 && shuffledDeck.map((cardIndex, positionIndex) => {
            const { angle, yOffset } = getCardPosition(positionIndex);
            const isAlreadySelected = selectedIndexes.includes(cardIndex);
            const isCurrentPicked = currentPickedCard === cardIndex;

            return (
              <TarotCard
                key={`${cardIndex}-${positionIndex}`}
                cardImage={getCardImagePath(cardIndex)}
                cardName={getCardNameByIndex(cardIndex)}
                picked={isCurrentPicked || isAlreadySelected}
                hovered={hovered === cardIndex && !isAlreadySelected}
                isFlipped={false}
                onPick={() => !isAlreadySelected && pickCardForQuestion(cardIndex)}
                onMouseEnter={() => setHovered(cardIndex)}
                onMouseLeave={() => setHovered(null)}
                style={
                  animatingOut
                    ? cardStyles.animateOut(isCurrentPicked || isAlreadySelected)
                    : (isCurrentPicked || isAlreadySelected)
                      ? cardStyles.pickedResponsive(angle, yOffset, isMobile)
                      : cardStyles.defaultResponsive(angle, yOffset, hovered === cardIndex && !isAlreadySelected, isMobile)
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
        <>
          <div style={{
            ...cardStyles.resultContainer,
            // AI 박스가 표시되면 카드를 위로 이동 (레이아웃 고정)
            ...(showAIBox ? {
              ...cardStyles.resultContainerMoved,
              transition: "all 0.8s ease-out" // 위로 이동할 때만 애니메이션
            } : {
              transition: "none" // 초기 렌더링에서는 애니메이션 없음
            })
          }}>
            {selectedCards.map((cardInfo, index) => {
              return (
                <TarotCard
                  key={`${cardInfo.card.id}-${index}`}
                  cardImage={cardInfo.card.image}
                  cardName={cardInfo.card.name || cardInfo.card.korName}
                  picked={true}
                  hovered={false}
                  isFlipped={true}  // 자동으로 뒤집기
                  isReversed={cardInfo.isReversed}  // 역방향 정보 전달
                  style={{
                    ...cardStyles.result,
                    // 카드 애니메이션은 처음에만 실행, AI 결과 로딩/표시 시에는 재실행하지 않음
                    ...(revealed >= 3 ? {
                      opacity: 1 // 이미 완료된 카드들은 애니메이션 없이 바로 표시
                    } : {
                      opacity: 0, // 처음에는 투명
                      animation: `fadeIn 0.6s ease-out ${index * 0.2}s forwards` // 순차적으로 페이드인 (더 빠르게)
                    })
                  }}
                />
              );
            })}
          </div>

          {/* AI 해석 결과 영역 - 카드 이동 시작 0.2초 후 표시 */}
          {showAIContent && (
            <AIInterpretationBox
              isLoading={isLoading}
              apiError={apiError}
              aiInterpretation={aiInterpretation}
              isMobile={isMobile}
              onRetry={fetchFortune}
            />
          )}
        </>
      )}

      {/* AI 해석이 완료된 후 두 개의 버튼 표시 */}
      {confirmed && showAIContent && !isLoading && (
        <div style={{...styles.buttonContainer, ...(isMobile ? styles.buttonContainerMobile : {})}}>
          <button
            style={{...styles.actionBtn, ...styles.nftBtn, ...(isMobile ? styles.btnMobile : {})}}
            onClick={() => {
              // NFT 발행 기능 구현 예정
              console.log("NFT 발행 클릭됨");
              alert("NFT 발행 기능은 곧 추가될 예정입니다!");
            }}
          >
            NFT발행
            <div style={styles.btnSubtext}>타로 리딩을 봉인하여 운명을 각인 시키세요!</div>
          </button>
          <button
            style={{...styles.actionBtn, ...styles.homeBtn, ...(isMobile ? styles.btnMobile : {})}}
            onClick={() => navigate('/')}
          >
            홈으로 가기
          </button>
        </div>
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
  // 새로운 질문 컨테이너 디자인
  questionContainer: {
    position: "absolute",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    width: "90%",
    maxWidth: 500,
  },
  questionContainerMobile: {
    top: 15,
    width: "95%",
    maxWidth: 350,
  },
  questionBox: {
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(15px)",
    WebkitBackdropFilter: "blur(15px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    padding: window.innerWidth <= 768 ? "15px 20px" : "18px 25px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
  },
  questionTitle: {
    color: "#FFFFFF",
    fontSize: window.innerWidth <= 768 ? 14 : 16,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.9,
    letterSpacing: "0.5px",
  },
  questionText: {
    color: "#FFFFFF",
    fontSize: window.innerWidth <= 768 ? 16 : 20,
    fontWeight: "500",
    lineHeight: 1.3,
    textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
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
  // 버튼 컨테이너 스타일
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 15,
    zIndex: 1000,
  },
  buttonContainerMobile: {
    bottom: 20,
    flexDirection: "column",
    gap: 12,
    alignItems: "center",
  },
  // 공통 액션 버튼 스타일
  actionBtn: {
    fontSize: 16,
    padding: "12px 20px",
    borderRadius: 20,
    border: "2px solid rgb(255, 255, 255)",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    minWidth: 140,
    textAlign: "center",
    position: "relative",
  },
  // NFT 발행 버튼 (메인 액션)
  nftBtn: {
    background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
    color: "#8B4513",
    boxShadow: "0 4px 15px rgba(255, 215, 0, 0.3)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: 200,
    padding: "12px 16px",
  },
  // 홈으로 가기 버튼 (보조 액션)
  homeBtn: {
    background: "rgba(255, 255, 255, 0.9)",
    color: "#8B4513",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },
  // NFT 버튼 서브텍스트
  btnSubtext: {
    fontSize: 11,
    fontWeight: "normal",
    opacity: 0.8,
    marginTop: 4,
    lineHeight: 1.2,
    textAlign: "center",
  },
};

const cardStyles = {
  // 카드 모으기 애니메이션 - 선택된 카드는 유지, 나머지는 사라짐 (부드러운 모으기)
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
    transition: "all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)", // 부드러운 모으기 애니메이션 복원
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
  // 결과 3장 컨테이너 - 초기 위치 (화면 중앙)
  resultContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", // 전체 높이 사용
    gap: window.innerWidth <= 768 ? 10 : 25, // 모바일 갭 줄임 (15 → 10)
    flexWrap: "nowrap",
    padding: window.innerWidth <= 768 ? "10px" : "20px", // 모바일 패딩 줄임
    boxSizing: "border-box",
    // transition은 위에서 조건부로 추가됨
  } as React.CSSProperties,

  // 결과 3장 컨테이너 - 위로 이동한 상태
  resultContainerMoved: {
    height: "65vh", // 높이를 덜 줄임 (원래대로)
    paddingTop: "8vh", // 위쪽 여백 추가 (원래대로)
    transform: "translateY(-8vh)", // 위로 살짝만 이동 (원래대로)
  } as React.CSSProperties,
  // 결과 3장 카드
  result: {
    position: "static",
    width: window.innerWidth <= 768 ? 90 : 140, // 모바일 너비 줄임 (100 → 90)
    height: window.innerWidth <= 768 ? 135 : 210, // 모바일 높이도 비례해서 줄임 (150 → 135)
    background: "transparent",
    border: "none",
    borderRadius: 10,
    transition: "transform 0.2s, box-shadow 0.2s",
    zIndex: 1,
  } as React.CSSProperties,
};

export default PickCard;