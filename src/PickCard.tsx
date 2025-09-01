import React, { useState, useEffect } from "react";
import { Card } from "./data.types";
import TarotCard from "./components/Card";

const TAROT_DECK: Card[] = Array.from({ length: 78 }, (_, i) => ({
  id: i + 1,
  name: `타로카드 ${i + 1}`,
}));

const PickCard: React.FC = () => {
  const [picked, setPicked] = useState<number[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState<boolean>(false);
  
  const [revealed, setRevealed] = useState<number>(0);
  
  useEffect(() => {
    if (confirmed && revealed<3) {
        const timer = setTimeout(() => setRevealed(revealed+1), 700);
        return () => clearTimeout(timer);
    }
    if (confirmed && revealed ===3 ) {
        //fetchFortune();
    }
  }, [confirmed, revealed]);

  // 카드 뽑기
  const pickCard = (idx: number) => {
    if (picked.includes(idx)) {
      setPicked(picked.filter((i) => i !== idx));
    } else if (picked.length < 3) {
      setPicked([...picked, idx]);
    }
  };

  const confirmPick = () => {
    setConfirmed(true);
    console.log(picked);
  };

  const resetPick = () => {
    setPicked([]);
    setConfirmed(false);
  };

  // 부채꼴 각도 계산
  const total = TAROT_DECK.length;
  const startAngle = -60;
  const endAngle = 60;
  const step = (endAngle - startAngle) / (total - 1);

  return (
    <div style={styles.container}>
      {/* 카드 배치 */}
      {!confirmed ? (
        TAROT_DECK.map((card, i) => (
          <TarotCard
            key={card.id}
            card={card}
            picked={picked.includes(i)}
            hovered={hovered === i}
            isFlipped={false}
            onPick={() => pickCard(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={
              picked.includes(i)
                ? cardStyles.picked(startAngle + i * step)
                : cardStyles.default(startAngle + i * step, hovered === i)
            }
          />
        ))
      ) : (
        <div style={cardStyles.resultContainer}>
          {picked.map(i, idx => (
            <TarotCard
              key={TAROT_DECK[i].id}
              card={TAROT_DECK[i]}
              picked={true}
              hovered={false}
              isFlipped={idx < revealed}
              style={cardStyles.result}
            />
          ))}
        </div>
      )}

      {/* 선택 안내 */}
      <div style={styles.guide}>
        {picked.length < 3
          ? "카드를 3장 선택하세요"
          : !confirmed
            ? "선택 완료 버튼을 눌러주세요."
            : "다시 뽑기 버튼을 누르세요."}
      </div>
      {/* 다시 뽑기/선택완료 버튼 */}
      {picked.length === 3 && !confirmed && (
        <button style={styles.resetBtn} onClick={confirmPick}>
          선택완료
        </button>
      )}
      {confirmed && (
        <button style={styles.resetBtn} onClick={resetPick}>
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
};

const cardStyles = {
  // 부채꼴 기본 카드
  default: (angle: number, hovered: boolean): React.CSSProperties => ({
    position: "absolute",
    left: "50%",
    bottom: 100,
    width: 120,
    height: 180,
    marginLeft: -60,
    background: "#000",
    border: "none",
    borderRadius: 10,
    boxShadow: hovered
      ? "0 8px 32px #b22222"
      : "2px 4px 10px rgb(81, 9, 9)",
    transform: `rotate(${angle}deg) translateY(-350px)`,
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    zIndex: 1,
  }),
  // 뽑힌 카드(부채꼴에서)
  picked: (angle: number): React.CSSProperties => ({
    position: "absolute",
    left: "50%",
    bottom: 100,
    width: 120,
    height: 180,
    marginLeft: -60,
    background: "#000",
    border: "none",
    borderRadius: 10,
    boxShadow: "0 8px 32px #b22222",
    transform: `rotate(${angle}deg) translateY(-100px) scale(1.15)`,
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
    gap: 32,
  } as React.CSSProperties,
  // 결과 3장 카드
  result: {
    position: "static",
    width: 120,
    height: 180,
    background: "#000",
    border: "none",
    borderRadius: 10,
    boxShadow: "0 8px 32px #b22222",
    transition: "transform 0.2s, box-shadow 0.2s",
    zIndex: 1,
  } as React.CSSProperties,
};

export default PickCard;
