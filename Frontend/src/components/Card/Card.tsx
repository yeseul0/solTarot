// Card.tsx
import React from "react";
import coverImg from "../../assets/coverImg.jpeg";

interface TarotCardProps {
  cardImage?: string;  // 실제 타로 카드 이미지
  cardName?: string;   // 카드 이름
  style: React.CSSProperties;
  picked: boolean;
  hovered: boolean;
  isFlipped?: boolean;
  isReversed?: boolean;  // 역방향 카드인지 여부
  onPick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const TarotCard: React.FC<TarotCardProps> = ({
  cardImage,
  cardName,
  style,
  picked,
  hovered,
  isFlipped = false,
  isReversed = false,
  onPick,
  onMouseEnter,
  onMouseLeave,
}) => {
  // 3D 뒤집기를 위한 컨테이너 스타일
  const containerStyle: React.CSSProperties = {
    ...style,
    perspective: "1000px",
  };

  // 카드 wrapper 스타일 (완전히 즉시 뒤집기)
  const wrapperStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    position: "relative",
    transformStyle: "preserve-3d",
    transition: "none", // 모든 애니메이션 제거
    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
  };

  // 카드 공통 스타일
  const faceStyle: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 10,
    backfaceVisibility: "hidden",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  // 카드 뒷면 (커버)
  const backStyle: React.CSSProperties = {
    ...faceStyle,
    backgroundImage: `url(${coverImg})`,
    transform: "rotateY(0deg)",
  };

  // 카드 앞면 (실제 카드)
  const frontStyle: React.CSSProperties = {
    ...faceStyle,
    transform: "rotateY(180deg)",
    backgroundColor: "#1a1a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // 카드 이미지 스타일 (역방향일 때 180도 회전, 즉시 적용)
  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    borderRadius: 8,
    transform: isReversed ? "rotate(180deg)" : "rotate(0deg)",
    transition: "none", // 이미지 회전 애니메이션도 제거
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
      <div
        onClick={onPick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={containerStyle}
      >
        <div style={wrapperStyle}>
          <div style={backStyle} />
          <div style={frontStyle}>
            {cardImage && (
              <img
                src={cardImage}
                alt={`${cardName || "Tarot Card"}${isReversed ? " (역방향)" : ""}`}
                style={imageStyle}
              />
            )}
          </div>
        </div>
      </div>
      {isFlipped && cardName && (
        <div style={{
          background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 20%, #2d1b69 50%, #1a0a2e 80%, #0f0f1f 100%)", // 남색/보라색 우주 그라데이션
          color: "#ffffff",
          padding: "10px 18px",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: "600",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)", // 더 어두운 그림자 + 은은한 하이라이트
          border: "1px solid rgba(100, 70, 150, 0.3)", // 보라색 톤 테두리
          minWidth: "120px",
          opacity: 0,
          animation: "fadeIn 0.5s ease-out 1.0s forwards",
          backdropFilter: "blur(10px)", // 배경 블러 효과
          position: "relative",
          overflow: "hidden",
        }}>
          {/* 우주 별빛 효과 */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 1px, transparent 2px), radial-gradient(circle at 80% 60%, rgba(135,206,235,0.2) 1px, transparent 2px), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.05) 1px, transparent 2px)",
            pointerEvents: "none",
          }} />
          <span style={{ position: "relative", zIndex: 1 }}>
            {cardName}
          </span>
        </div>
      )}
    </div>
  );
};

export default TarotCard;
