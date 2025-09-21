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
  onPick,
  onMouseEnter,
  onMouseLeave,
}) => {
  // 3D 뒤집기를 위한 컨테이너 스타일
  const containerStyle: React.CSSProperties = {
    ...style,
    perspective: "1000px",
  };

  // 카드 wrapper 스타일 (뒤집기 애니메이션)
  const wrapperStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    position: "relative",
    transformStyle: "preserve-3d",
    transition: "transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)",
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

  // 카드 이미지 스타일
  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    borderRadius: 8,
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
                alt={cardName || "Tarot Card"}
                style={imageStyle}
              />
            )}
          </div>
        </div>
      </div>
      {isFlipped && cardName && (
        <div style={{
          background: "rgba(139, 69, 19, 0.9)",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: 8,
          fontSize: 16,
          fontWeight: "bold",
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          minWidth: "120px",
        }}>
          {cardName}
        </div>
      )}
    </div>
  );
};

export default TarotCard;
