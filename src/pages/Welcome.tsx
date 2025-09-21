import React, { useState, useEffect } from "react";
import bgImg from "../assets/main.jpeg";

interface WelcomeProps {
    onConnect: () => void;
}



const Welcome: React.FC<WelcomeProps> = ({ onConnect }) => {
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    return (
        <div style={styles.bg}>
            <div style={styles.overlay}>
                <div style={getContainerStyle(isMobile)}>
                    <h1 style={getTitleStyle(isMobile)}>Sol Tarot</h1>
                    <div style={getSubtitleStyle(isMobile)}>Let the Tarot reveal your fate today!</div>
                    <button style={getButtonStyle(isMobile)} onClick={onConnect}>
                        🔮 입장하기 (지갑 연결)
                    </button>
                </div>
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
};
