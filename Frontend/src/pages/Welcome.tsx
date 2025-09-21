import React, { useState, useEffect } from "react";
import bgImg from "../assets/main.jpeg";
import { spreadTypes, SpreadType } from "../data/spreadTypes";
import { useNavigate } from "react-router-dom";

interface WelcomeProps {
    onConnect: () => void;
}



const Welcome: React.FC<WelcomeProps> = ({ onConnect }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [showSpreadSelection, setShowSpreadSelection] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    const handleConnect = async () => {
        await onConnect();
        setShowSpreadSelection(true);
    };

    const selectSpread = (spread: SpreadType) => {
        // 스프레드를 선택하면 PickCard 페이지로 이동하며 스프레드 정보 전달
        navigate('/pick', { state: { selectedSpread: spread } });
    };

    return (
        <div style={styles.bg}>
            <div style={styles.overlay}>
                {!showSpreadSelection ? (
                    // 초기 화면
                    <div style={getContainerStyle(isMobile)}>
                        <h1 style={getTitleStyle(isMobile)}>Sol Tarot</h1>
                        <div style={getSubtitleStyle(isMobile)}>Let the Tarot reveal your fate today!</div>
                        <button style={getButtonStyle(isMobile)} onClick={handleConnect}>
                            🔮 입장하기 (지갑 연결)
                        </button>
                    </div>
                ) : (
                    // 스프레드 선택 화면 (모달만 바뀔)
                    <div style={getSpreadContainerStyle(isMobile)}>
                        <h2 style={getSpreadTitleStyle(isMobile)}>
                            오늘 당신이 알고 싶은 운명의 비밀은 무엇인가요?
                        </h2>
                        <div style={styles.spreadCardsWrapper}>
                            {spreadTypes.map((spread) => (
                                <div
                                    key={spread.key}
                                    style={getSpreadCardStyle(isMobile)}
                                    onClick={() => selectSpread(spread)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.03)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
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
                )}
            </div>
        </div>
    );
};

export default Welcome;

// 동적 스타일 함수들
const getContainerStyle = (isMobile: boolean): React.CSSProperties => ({
    background: "rgba(255, 255, 255, 0.3)",
    borderRadius: isMobile ? 20 : 32,
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
    padding: isMobile ? "24px 20px" : "48px",
    minWidth: isMobile ? "280px" : "380px",
    width: isMobile ? "90%" : "auto",
    maxWidth: isMobile ? "350px" : "none",
    textAlign: "center" as const,
});

const getTitleStyle = (isMobile: boolean): React.CSSProperties => ({
    fontSize: isMobile ? 28 : 38,
    marginBottom: 8,
    letterSpacing: 2,
    fontWeight: 700,
    color: "#1e1440",
    textShadow: "0 2px 8px #fffbe6",
});

const getSubtitleStyle = (isMobile: boolean): React.CSSProperties => ({
    color: "#ff9800",
    marginBottom: 24,
    fontSize: isMobile ? 16 : 18,
    fontWeight: 500,
    textShadow: "0 0.5px 0px #fffbe6",
});

const getButtonStyle = (isMobile: boolean): React.CSSProperties => ({
    fontSize: isMobile ? 16 : 20,
    padding: isMobile ? "12px 24px" : "16px 40px",
    borderRadius: 24,
    background: "linear-gradient(90deg, #ffecb3 60%, #ffe0b2 100%)",
    border: "2px solid #ff9800",
    cursor: "pointer",
    marginTop: isMobile ? 24 : 40,
    boxShadow: "0 2px 8px #fffbe6",
    fontWeight: 600,
    color: "#7c4d00",
});

// 스프레드 선택 화면 스타일 함수들
const getSpreadContainerStyle = (isMobile: boolean): React.CSSProperties => ({
    background: "rgba(255, 255, 255, 0.3)",
    borderRadius: isMobile ? 20 : 32,
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
    padding: isMobile ? "24px 20px" : "48px",
    minWidth: isMobile ? "280px" : "500px",
    width: isMobile ? "90%" : "auto",
    maxWidth: isMobile ? "350px" : "600px",
    textAlign: "center" as const,
});

const getSpreadTitleStyle = (isMobile: boolean): React.CSSProperties => ({
    fontSize: isMobile ? 20 : 24,
    marginBottom: 30,
    fontWeight: 600,
    color: "#1e1440",
    textShadow: "0 2px 8px #fffbe6",
    lineHeight: 1.4,
});

const getSpreadCardStyle = (isMobile: boolean): React.CSSProperties => ({
    background: "rgba(255, 255, 255, 0.85)",
    borderRadius: 16,
    padding: isMobile ? "16px 20px" : "20px 28px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginBottom: 12,
});

const styles: { [key: string]: React.CSSProperties } = {
    bg: {
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    overlay: {
        minHeight: "100vh",
        width: "100%",
        background: "rgba(30,20,50,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        boxSizing: "border-box",
    },
    spreadCardsWrapper: {
        display: "flex",
        flexDirection: "column",
        gap: 0,
        width: "100%",
    },
    spreadTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#8B4513",
    },
    spreadDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 1.4,
    },
};
