// AIInterpretationBox.tsx
import React from "react";

interface AIInterpretationBoxProps {
  isLoading: boolean;
  apiError: string | null;
  aiInterpretation: string;
  isMobile: boolean;
  onRetry: () => void;
}

// 백엔드 응답 데이터 구조
interface CardInterpretation {
  position: string;
  cardName: string;
  direction: string;
  interpretation: string;
}

interface AIInterpretationData {
  fullMessage: string;
  cards: CardInterpretation[];
  conclusion: string;
}

// JSON 파싱 함수
const parseAIInterpretation = (jsonString: string): AIInterpretationData | null => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI 해석 JSON 파싱 오류:", error);
    return null;
  }
};

const AIInterpretationBox: React.FC<AIInterpretationBoxProps> = ({
  isLoading,
  apiError,
  aiInterpretation,
  isMobile,
  onRetry,
}) => {
  // AI 해석 데이터 파싱
  const interpretationData = aiInterpretation ? parseAIInterpretation(aiInterpretation) : null;

  return (
    <div style={{
      ...styles.interpretationContainer,
      ...(isMobile ? styles.interpretationContainerMobile : {}),
      // 가운데에서 뿅 생기기
      opacity: 0,
      animation: "fadeIn 0.3s ease-out forwards"
    }}>
      {isLoading ? (
        <div style={styles.loadingContainer}>
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

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={styles.loadingSpinner}>🔮</div>
            <p style={styles.loadingText}>AI가 카드를 해석하고 있습니다...</p>
          </div>
        </div>
      ) : apiError ? (
        <div style={styles.errorContainer}>
          <h3 style={styles.errorTitle}>⚠️ 오류가 발생했습니다</h3>
          <p style={styles.errorText}>{apiError}</p>
          <button
            style={styles.retryBtn}
            onClick={onRetry}
          >
            다시 시도
          </button>
        </div>
      ) : interpretationData ? (
        <div style={styles.interpretationBox}>
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

          <div style={{ position: "relative", zIndex: 1 }}>
            <h3 style={styles.interpretationTitle}>🔮 AI 타로 해석</h3>

          {/* 전체 메시지 */}
          <div style={styles.fullMessageSection}>
            <p style={styles.fullMessageText}>{interpretationData.fullMessage}</p>
          </div>

          {/* 카드별 해석 */}
          <div style={styles.cardsSection}>
            {interpretationData.cards.map((card, index) => (
              <div key={index} style={{
                ...styles.cardInterpretationItem,
                animationDelay: `${index * 0.2}s`
              }}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardPosition}>{card.position}</span>
                  <span style={styles.cardName}>{card.cardName}</span>
                  <span style={styles.cardDirection}>({card.direction})</span>
                </div>
                <p style={styles.cardInterpretationText}>{card.interpretation}</p>
              </div>
            ))}
          </div>

          {/* 결론 */}
          <div style={styles.conclusionSection}>
            <h4 style={styles.conclusionTitle}>✨ 총결론</h4>
            <p style={styles.conclusionText}>{interpretationData.conclusion}</p>
          </div>
          </div>
        </div>
      ) : aiInterpretation ? (
        // JSON 파싱 실패시 기존 방식으로 표시
        <div style={styles.interpretationBox}>
          <h3 style={styles.interpretationTitle}>🔮 AI 타로 해석</h3>
          <div style={styles.interpretationText}>
            {aiInterpretation.split('\n').map((line, index) => (
              <p key={index} style={styles.interpretationParagraph}>
                {line}
              </p>
            ))}
          </div>
        </div>
      ) : (
        // 초기 상태 - 빈 박스로 레이아웃 고정
        <div style={{
          ...styles.interpretationBox,
          minHeight: "200px", // 다른 상자들과 동일한 높이
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.6
        }}>
          {/* 우주 별빛 효과 */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05) 1px, transparent 2px), radial-gradient(circle at 80% 60%, rgba(135,206,235,0.1) 1px, transparent 2px), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.03) 1px, transparent 2px)",
            pointerEvents: "none",
          }} />

          <p style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: 16,
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)"
          }}>
            AI가 카드를 해석할 준비가 되었습니다
          </p>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  // AI 해석 결과 컨테이너 - 카드 아래에 위치 (다시뽑기 버튼과 겹치지 않게 위쪽에)
  interpretationContainer: {
    position: "absolute",
    bottom: 140, // 110 → 140으로 위로 올림 (카드와 가깝게)
    left: "50%",
    transform: "translateX(-50%)",
    width: "85%",
    maxWidth: 700,
    maxHeight: "35vh", // 30vh → 35vh로 늘림 (공간 활용)
    overflowY: "auto",
    zIndex: 1000,
  } as React.CSSProperties,
  interpretationContainerMobile: {
    width: "90%",
    bottom: 160, // 120 → 160으로 위로 올림 (카드와 가깝게)
    maxHeight: "30vh", // 25vh → 30vh로 늘림
  } as React.CSSProperties,
  // 로딩 상태 - 결과 상자와 동일한 우주 테마
  loadingContainer: {
    background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 20%, #2d1b69 50%, #1a0a2e 80%, #0f0f1f 100%)",
    borderRadius: 15,
    padding: 20,
    textAlign: "center",
    border: "1px solid rgba(100, 70, 150, 0.3)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
    position: "relative",
    overflow: "hidden",
    minHeight: "200px", // 결과 상자와 비슷한 높이로 통일
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
  loadingSpinner: {
    fontSize: 32,
    marginBottom: 10,
    display: "inline-block",
    transform: "rotate(0deg)",
    animation: "spin 2s linear infinite",
  } as React.CSSProperties,
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    margin: 0,
  } as React.CSSProperties,
  // 에러 상태 - 우주 테마 유지하되 빨간색 톤 추가
  errorContainer: {
    background: "linear-gradient(135deg, #1a0a0a 0%, #2e1a1a 20%, #691b2d 50%, #2e1a1a 80%, #1f0f0f 100%)",
    borderRadius: 15,
    padding: 20,
    textAlign: "center",
    border: "1px solid rgba(150, 70, 100, 0.3)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 20px rgba(139, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
    position: "relative",
    overflow: "hidden",
    minHeight: "200px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
  errorTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    margin: "0 0 10px 0",
  } as React.CSSProperties,
  errorText: {
    color: "#FFCCCC",
    fontSize: 14,
    margin: "0 0 15px 0",
  } as React.CSSProperties,
  retryBtn: {
    background: "#FFFFFF",
    color: "#8B0000",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 14,
    fontWeight: "bold",
    cursor: "pointer",
  } as React.CSSProperties,
  // AI 해석 결과 - 우주 테마로 변경
  interpretationBox: {
    background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 20%, #2d1b69 50%, #1a0a2e 80%, #0f0f1f 100%)",
    borderRadius: 15,
    padding: 20,
    border: "1px solid rgba(100, 70, 150, 0.3)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
    position: "relative",
    overflow: "hidden",
  } as React.CSSProperties,
  interpretationTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    margin: "0 0 15px 0",
    textAlign: "center",
    textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
  } as React.CSSProperties,
  interpretationText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 1.6,
    textAlign: "left",
  } as React.CSSProperties,
  interpretationParagraph: {
    margin: "0 0 10px 0",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
  } as React.CSSProperties,

  // 전체 메시지 섹션
  fullMessageSection: {
    marginBottom: 20,
    padding: "15px 0",
    borderBottom: "1px solid rgba(100, 70, 150, 0.2)",
    position: "relative",
  } as React.CSSProperties,

  fullMessageText: {
    color: "#E8E3FF",
    fontSize: 16,
    lineHeight: 1.6,
    margin: 0,
    textAlign: "center",
    fontWeight: "500",
    textShadow: "0 1px 3px rgba(0, 0, 0, 0.4)",
  } as React.CSSProperties,

  // 카드별 해석 섹션
  cardsSection: {
    marginBottom: 20,
  } as React.CSSProperties,

  cardInterpretationItem: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(100, 70, 150, 0.2)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    opacity: 0,
    animation: "fadeIn 0.6s ease-out forwards",
    backdropFilter: "blur(5px)",
  } as React.CSSProperties,

  cardHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
    flexWrap: "wrap",
  } as React.CSSProperties,

  cardPosition: {
    background: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #4c1d95 100%)",
    color: "#FFFFFF",
    padding: "4px 10px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "600",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  } as React.CSSProperties,

  cardName: {
    color: "#F0E6FF",
    fontSize: 14,
    fontWeight: "600",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.4)",
  } as React.CSSProperties,

  cardDirection: {
    color: "#B8A3D9",
    fontSize: 13,
    fontStyle: "italic",
  } as React.CSSProperties,

  cardInterpretationText: {
    color: "#E0D4F7",
    fontSize: 14,
    lineHeight: 1.6,
    margin: 0,
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
  } as React.CSSProperties,

  // 결론 섹션
  conclusionSection: {
    borderTop: "1px solid rgba(100, 70, 150, 0.2)",
    paddingTop: 15,
    textAlign: "center",
    position: "relative",
  } as React.CSSProperties,

  conclusionTitle: {
    color: "#F8F4FF",
    fontSize: 16,
    fontWeight: "600",
    margin: "0 0 10px 0",
    textShadow: "0 1px 3px rgba(0, 0, 0, 0.4)",
  } as React.CSSProperties,

  conclusionText: {
    color: "#E8E3FF",
    fontSize: 15,
    lineHeight: 1.7,
    margin: 0,
    fontWeight: "500",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
  } as React.CSSProperties,
};

export default AIInterpretationBox;