import React from "react";
import bgImg from "./assets/main.jpeg";

interface WelcomeProps {
    onConnect: () => void;
}



const Welcome: React.FC<WelcomeProps> = ({ onConnect }) => {
    return (
        <div style={styles.bg}>
            <div style={styles.overlay}>
                <div style={styles.container}>
                    <h1 style={styles.title}>Sol Tarot</h1>
                    <div style={styles.subtitle}>Let the Tarot reveal your fate today!</div>
                    <button style={styles.button} onClick={onConnect}>
                        🔮 입장하기 (지갑 연결)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Welcome;

const styles: { [key: string]: React.CSSProperties } = {
    bg: {
        minHeight: "100vh",
        width: "100vw",
        backgroundImage: `url(${bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
    },
    overlay: {
        minHeight: "100vh",
        width: "100vw",
        background: "rgba(30,20,50,0.5)", // 어두운 신비로운 반투명 레이어
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        background: "rgba(255, 255, 255, 0.3)",
        borderRadius: 32,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        padding: 48,
        minWidth: 380,
        textAlign: "center",
    },
    title: {
        fontSize: 38,
        marginBottom: 8,
        letterSpacing: 2,
        fontWeight: 700,
        color: "#1e1440",
        textShadow: "0 2px 8px #fffbe6",
    },
    subtitle: {
        color: "#ff9800",
        marginBottom: 32,
        fontSize: 18,
        fontWeight: 500,
        textShadow: "0 0.5px 0px #fffbe6",
    },
    button: {
        fontSize: 20,
        padding: "16px 40px",
        borderRadius: 24,
        background: "linear-gradient(90deg, #ffecb3 60%, #ffe0b2 100%)",
        border: "2px solid #ff9800",
        cursor: "pointer",
        marginTop: 40,
        boxShadow: "0 2px 8px #fffbe6",
        fontWeight: 600,
        color: "#7c4d00",
    },
};
