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
    backgroundImage: cardImage ? `url(${cardImage})` : `url(${coverImg})`,
    transform: "rotateY(180deg)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    padding: "10px",
  };

  return (
    <div
      onClick={onPick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={containerStyle}
    >
      <div style={wrapperStyle}>
        <div style={backStyle} />
        <div style={frontStyle}>
          {isFlipped && cardName && (
            <div style={{
              background: "rgba(0,0,0,0.7)",
              color: "#fff",
              padding: "5px 10px",
              borderRadius: 5,
              fontSize: 12,
              fontWeight: "bold",
            }}>
              {cardName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TarotCard;
