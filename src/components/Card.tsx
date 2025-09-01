// Card.tsx
import React from "react";
import { Card as CardType } from "../data.types";
import coverImg from "../assets/coverImg.jpeg";

interface TarotCardProps {
  card: CardType;
  style: React.CSSProperties;
  picked: boolean;
  hovered: boolean;
  isFlipped?: boolean;
  onPick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const TarotCard: React.FC<TarotCardProps> = ({
  card,
  style,
  picked,
  hovered,
  isFlipped = false,
  onPick,
  onMouseEnter,
  onMouseLeave,
}) => (
  <div
    onClick={onPick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    style={style}
    className="tarot-card"
  >
    <div style={innerStyles.cardFace}>
      {/* 카드 이름 등 표시하고 싶으면 여기에 */}
    </div>
  </div>
);

const innerStyles = {
  cardFace: {
    width: "100%",
    height: "100%",
    backgroundImage: `url(${coverImg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: 18,
    color: "#fff",
    cursor: "pointer",
    textShadow: "0 2px 8px #000",
    userSelect: "none",
  } as React.CSSProperties,
};

export default TarotCard;
