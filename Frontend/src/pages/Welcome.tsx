import React, { useState, useEffect } from "react";
import bgImg from "../assets/main.jpeg";
import { categories, Category, SpreadType, getSpreadTypesByCategory } from "../data/spreadTypes";
import { useNavigate } from "react-router-dom";
import Modal from "../components/UI/Modal";

interface WalletAccount {
    address: string;
    name?: string;
}

interface WalletState {
    address: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    availableAccounts: WalletAccount[];
    currentAccountIndex: number;
}

interface WelcomeProps {
    wallet: WalletState;
    onConnect: () => void;
    onDisconnect: () => void;
    onSwitchAccount: (accountIndex: number) => void;
}



const Welcome: React.FC<WelcomeProps> = ({ wallet, onConnect, onDisconnect, onSwitchAccount }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [showSpreadSelection, setShowSpreadSelection] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
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
    };

    const handleDisconnect = async () => {
        await onDisconnect();
        setShowSpreadSelection(false);
        setShowAccountMenu(false);
    };

    const handleAccountSwitch = async () => {
        console.log("계정 전환 시작...");
        setShowAccountMenu(false);

        if (!window.solana || !window.solana.isPhantom) {
            alert("팬텀 지갑이 설치되어 있지 않습니다!");
            return;
        }

        try {
            // 현재 연결 해제
            console.log("기존 연결 해제 중...");
            await handleDisconnect();

            // 잠시 기다린 후 새 연결 시도
            setTimeout(async () => {
                console.log("새 연결 시도 중...");
                try {
                    // 새로운 계정으로 연결
                    await handleConnect();
                } catch (connectErr) {
                    console.error("재연결 실패:", connectErr);
                    alert("계정 전환 실패: " + connectErr.message);
                }
            }, 300);

        } catch (err) {
            console.error('계정 전환 중 오류:', err);
            alert("계정 전환 중 오류가 발생했습니다: " + err.message);
        }
    };

    const handleEnterApp = () => {
        if (wallet.isConnected && wallet.address) {
            setShowSpreadSelection(true);
        }
    };

    // 메뉴 외부 클릭시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showAccountMenu) {
                const target = event.target as HTMLElement;
                if (!target.closest('[data-wallet-menu]')) {
                    setShowAccountMenu(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showAccountMenu]);

    // 지갑 주소 줄임 표시 함수
    const shortenAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    const selectCategory = (category: Category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const selectSpread = (spread: SpreadType) => {
        // 스프레드를 선택하면 PickCard 페이지로 이동하며 스프레드 정보 전달
        navigate('/pick', { state: { selectedSpread: spread } });
        setIsModalOpen(false);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
    };

    return (
        <div style={styles.bg}>
            <div style={styles.overlay}>
                {!showSpreadSelection ? (
                    // 초기 화면
                    <>
                        {/* 지갑이 연결되어 있으면 지갑 정보 표시 */}
                        {wallet.isConnected && (
                            <div style={getWalletInfoStyle(isMobile)} data-wallet-menu>
                                <div style={styles.walletAddress}>
                                    <span style={styles.walletLabel}>👛 연결된 지갑:</span>
                                    <span
                                        style={styles.addressText}
                                        onClick={() => setShowAccountMenu(!showAccountMenu)}
                                    >
                                        {wallet.address ? shortenAddress(wallet.address) : '연결 중...'}
                                        {wallet.address && <span style={{marginLeft: '4px'}}>⬇️</span>}
                                    </span>
                                </div>

                                {/* 계정 메뉴 */}
                                {showAccountMenu && (
                                    <div style={styles.accountMenu}>
                                        {/* 계정 목록 표시 */}
                                        {wallet.availableAccounts.length > 1 && (
                                            <>
                                                <div style={styles.accountMenuHeader}>
                                                    💼 계정 선택
                                                </div>
                                                {wallet.availableAccounts.map((account, index) => (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            ...styles.accountItem,
                                                            background: index === wallet.currentAccountIndex
                                                                ? 'rgba(76, 175, 80, 0.2)'
                                                                : 'transparent'
                                                        }}
                                                        onClick={() => {
                                                            onSwitchAccount(index);
                                                            setShowAccountMenu(false);
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (index !== wallet.currentAccountIndex) {
                                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (index !== wallet.currentAccountIndex) {
                                                                e.currentTarget.style.background = 'transparent';
                                                            } else {
                                                                e.currentTarget.style.background = 'rgba(76, 175, 80, 0.2)';
                                                            }
                                                        }}
                                                    >
                                                        <div style={styles.accountName}>
                                                            {index === wallet.currentAccountIndex ? '✅' : '💳'} {account.name || `Account ${index + 1}`}
                                                        </div>
                                                        <div style={styles.accountAddress}>
                                                            {shortenAddress(account.address)}
                                                        </div>
                                                    </div>
                                                ))}
                                                <div style={styles.menuDivider}></div>
                                            </>
                                        )}

                                        <div
                                            style={styles.accountMenuItem}
                                            onClick={() => {
                                                if (wallet.address) {
                                                    navigator.clipboard.writeText(wallet.address);
                                                    alert('지갑 주소가 복사되었습니다!');
                                                    setShowAccountMenu(false);
                                                }
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            📋 주소 복사
                                        </div>
                                        <div
                                            style={styles.accountMenuItem}
                                            onClick={handleAccountSwitch}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            🔄 새 계정 연결
                                        </div>
                                        <div
                                            style={{...styles.accountMenuItem, borderBottom: 'none'}}
                                            onClick={handleDisconnect}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            🔌 연결 해제
                                        </div>
                                    </div>
                                )}

                                <button
                                    style={styles.menuToggleBtn}
                                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                    }}
                                >
                                    ⚙️
                                </button>
                            </div>
                        )}

                        <div style={getContainerStyle(isMobile)}>
                            <h1 style={getTitleStyle(isMobile)}>Sol Tarot</h1>
                            <div style={getSubtitleStyle(isMobile)}>Let the Tarot reveal your fate today!</div>

                            <div style={styles.buttonContainer}>
                                {!wallet.isConnected ? (
                                    <button
                                        style={getConnectButtonStyle(isMobile)}
                                        onClick={handleConnect}
                                        disabled={wallet.isConnecting}
                                    >
                                        {wallet.isConnecting ? '🔄 연결 중...' : '👛 지갑 연결'}
                                    </button>
                                ) : (
                                    <div style={styles.connectedInfo}>
                                        <div style={styles.connectedText}>
                                            ✅ 지갑 연결됨
                                        </div>
                                        <button
                                            style={styles.changeWalletBtn}
                                            onClick={handleAccountSwitch}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 152, 0, 0.3)';
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 152, 0, 0.2)';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            🔄 지갑 변경
                                        </button>
                                    </div>
                                )}

                                <button
                                    style={getEnterButtonStyle(isMobile, !wallet.isConnected)}
                                    onClick={handleEnterApp}
                                    disabled={!wallet.isConnected}
                                >
                                    🔮 입장하기
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    // 카테고리 선택 화면
                    <div style={getSpreadContainerStyle(isMobile)}>
                        {/* 지갑 정보 표시 */}
                        <div style={getWalletInfoStyle(isMobile)} data-wallet-menu>
                            <div style={styles.walletAddress}>
                                <span style={styles.walletLabel}>👛 연결된 지갑:</span>
                                <span
                                    style={styles.addressText}
                                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                                >
                                    {wallet.address ? shortenAddress(wallet.address) : '연결 중...'}
                                    {wallet.address && <span style={{marginLeft: '4px'}}>⬇️</span>}
                                </span>
                            </div>

                            {/* 계정 메뉴 */}
                            {showAccountMenu && (
                                <div style={styles.accountMenu}>
                                    {/* 계정 목록 표시 */}
                                    {wallet.availableAccounts.length > 1 && (
                                        <>
                                            <div style={styles.accountMenuHeader}>
                                                💼 계정 선택
                                            </div>
                                            {wallet.availableAccounts.map((account, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        ...styles.accountItem,
                                                        background: index === wallet.currentAccountIndex
                                                            ? 'rgba(76, 175, 80, 0.2)'
                                                            : 'transparent'
                                                    }}
                                                    onClick={() => {
                                                        onSwitchAccount(index);
                                                        setShowAccountMenu(false);
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (index !== wallet.currentAccountIndex) {
                                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (index !== wallet.currentAccountIndex) {
                                                            e.currentTarget.style.background = 'transparent';
                                                        } else {
                                                            e.currentTarget.style.background = 'rgba(76, 175, 80, 0.2)';
                                                        }
                                                    }}
                                                >
                                                    <div style={styles.accountName}>
                                                        {index === wallet.currentAccountIndex ? '✅' : '💳'} {account.name || `Account ${index + 1}`}
                                                    </div>
                                                    <div style={styles.accountAddress}>
                                                        {shortenAddress(account.address)}
                                                    </div>
                                                </div>
                                            ))}
                                            <div style={styles.menuDivider}></div>
                                        </>
                                    )}

                                    <div
                                        style={styles.accountMenuItem}
                                        onClick={() => {
                                            if (wallet.address) {
                                                navigator.clipboard.writeText(wallet.address);
                                                alert('지갑 주소가 복사되었습니다!');
                                                setShowAccountMenu(false);
                                            }
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        📋 주소 복사
                                    </div>
                                    <div
                                        style={styles.accountMenuItem}
                                        onClick={handleAccountSwitch}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        🔄 새 계정 연결
                                    </div>
                                    <div
                                        style={{...styles.accountMenuItem, borderBottom: 'none'}}
                                        onClick={handleDisconnect}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        🔌 연결 해제
                                    </div>
                                </div>
                            )}

                            <button
                                style={styles.menuToggleBtn}
                                onClick={() => setShowAccountMenu(!showAccountMenu)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                }}
                            >
                                ⚙️
                            </button>
                        </div>

                        <h2 style={getSpreadTitleStyle(isMobile)}>
                            오늘 당신이 알고 싶은 운명의 비밀은 무엇인가요?
                        </h2>
                        <div style={styles.categoryWrapper}>
                            {categories.map((category) => (
                                <div
                                    key={category.key}
                                    style={getCategoryCardStyle(isMobile)}
                                    onClick={() => selectCategory(category)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.03)';
                                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.4), 0 0 30px rgba(138, 43, 226, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3), 0 0 20px rgba(138, 43, 226, 0.1)';
                                    }}
                                >
                                    <h3 style={styles.categoryTitle}>{category.icon} {category.name} {category.icon}</h3>
                                    <p style={styles.categoryDescription}>{category.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 스프레드 선택 모달 */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : ""}
                >
                    {selectedCategory && (
                        <div style={styles.spreadModalContent}>
                            {getSpreadTypesByCategory(selectedCategory.key).map((spread) => (
                                <div
                                    key={spread.key}
                                    style={styles.spreadModalCard}
                                    onClick={() => selectSpread(spread)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.02)';
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3), 0 0 15px rgba(138, 43, 226, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)';
                                    }}
                                >
                                    <h4 style={styles.spreadModalTitle}>{spread.name}</h4>
                                    <p style={styles.spreadModalDescription}>{spread.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal>
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

const getConnectButtonStyle = (isMobile: boolean): React.CSSProperties => ({
    fontSize: isMobile ? 15 : 18,
    padding: isMobile ? "12px 20px" : "14px 32px",
    borderRadius: 20,
    background: "linear-gradient(90deg, #4CAF50 60%, #45a049 100%)",
    border: "2px solid #45a049",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
    fontWeight: 600,
    color: "#fff",
    marginBottom: isMobile ? 12 : 16,
    transition: "all 0.3s ease",
});

const getEnterButtonStyle = (isMobile: boolean, isDisabled: boolean): React.CSSProperties => ({
    fontSize: isMobile ? 16 : 20,
    padding: isMobile ? "12px 24px" : "16px 40px",
    borderRadius: 24,
    background: isDisabled
        ? "linear-gradient(90deg, #cccccc 60%, #bbbbbb 100%)"
        : "linear-gradient(90deg, #ffecb3 60%, #ffe0b2 100%)",
    border: isDisabled ? "2px solid #999999" : "2px solid #ff9800",
    cursor: isDisabled ? "not-allowed" : "pointer",
    boxShadow: isDisabled ? "0 2px 8px rgba(0,0,0,0.1)" : "0 2px 8px #fffbe6",
    fontWeight: 600,
    color: isDisabled ? "#666666" : "#7c4d00",
    opacity: isDisabled ? 0.6 : 1,
    transition: "all 0.3s ease",
});

// 스프레드 선택 화면 스타일 함수들
const getSpreadContainerStyle = (isMobile: boolean): React.CSSProperties => ({
    background: "rgba(255, 255, 255, 0.3)",
    borderRadius: isMobile ? 16 : 24,
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
    padding: isMobile ? "16px 12px" : "32px",
    minWidth: isMobile ? "280px" : "420px",
    width: isMobile ? "95%" : "auto",
    maxWidth: isMobile ? "340px" : "500px",
    textAlign: "center" as const,
});

// 지갑 정보 반응형 스타일
const getWalletInfoStyle = (isMobile: boolean): React.CSSProperties => ({
    position: "absolute",
    top: isMobile ? 12 : 20,
    right: isMobile ? 12 : 20,
    display: "flex",
    alignItems: "center",
    gap: isMobile ? 8 : 15,
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(15px)",
    WebkitBackdropFilter: "blur(15px)",
    borderRadius: isMobile ? 12 : 15,
    padding: isMobile ? "8px 12px" : "12px 16px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
    zIndex: 10,
    flexDirection: isMobile ? "column" : "row",
    minWidth: isMobile ? "160px" : "auto",
});

const getSpreadTitleStyle = (isMobile: boolean): React.CSSProperties => ({
    fontSize: isMobile ? 17 : 22,
    marginBottom: isMobile ? 20 : 24,
    fontWeight: 600,
    color: "#1e1440",
    textShadow: "0 2px 8px #fffbe6",
    lineHeight: 1.3,
});

// 카테고리 카드 스타일
const getCategoryCardStyle = (isMobile: boolean): React.CSSProperties => ({
    background: "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: isMobile ? 12 : 16,
    padding: isMobile ? "16px 12px" : "20px 18px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3), 0 0 20px rgba(138, 43, 226, 0.1)",
    marginBottom: isMobile ? 10 : 12,
    textAlign: "center",
    minHeight: isMobile ? 80 : 90,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
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
    categoryWrapper: {
        display: "flex",
        flexDirection: "column",
        gap: 0,
        width: "100%",
    },
    buttonContainer: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        alignItems: "center",
        marginTop: 32,
        width: "100%",
    },
    connectedInfo: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    connectedText: {
        color: "#4CAF50",
        fontSize: 14,
        fontWeight: 600,
        textShadow: "0 1px 2px rgba(0,0,0,0.2)",
    },
    changeWalletBtn: {
        fontSize: 12,
        padding: "6px 12px",
        borderRadius: 16,
        background: "rgba(255, 152, 0, 0.2)",
        border: "1px solid rgba(255, 152, 0, 0.4)",
        cursor: "pointer",
        color: "#ff9800",
        fontWeight: 500,
        transition: "all 0.2s ease",
        backdropFilter: "blur(5px)",
    },
    // 지갑 정보 스타일
    walletAddress: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        position: "relative" as const,
    },
    walletLabel: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "500",
        opacity: 0.9,
    },
    addressText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
        fontFamily: "monospace",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        padding: "4px 8px",
        borderRadius: 8,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    menuToggleBtn: {
        background: "rgba(255, 255, 255, 0.2)",
        color: "#FFFFFF",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        borderRadius: 8,
        padding: "6px 8px",
        fontSize: 12,
        cursor: "pointer",
        transition: "all 0.3s ease",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
    },
    accountMenu: {
        position: "absolute" as const,
        top: "100%",
        right: 0,
        marginTop: 8,
        background: "rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 12,
        border: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        minWidth: 150,
        zIndex: 20,
        overflow: "hidden",
    },
    accountMenuHeader: {
        padding: "12px 16px 8px",
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center",
        opacity: 0.8,
        borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
        marginBottom: 4,
    },
    accountItem: {
        padding: "10px 16px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    },
    accountName: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 2,
    },
    accountAddress: {
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: 10,
        fontFamily: "monospace",
    },
    menuDivider: {
        height: 1,
        background: "rgba(255, 255, 255, 0.2)",
        margin: "8px 0",
    },
    accountMenuItem: {
        padding: "12px 16px",
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        background: "transparent",
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 8,
        color: "#fff",
        margin: "0 0 8px 0",
        textShadow: "0 2px 8px rgba(0,0,0,0.5)",
    },
    categoryDescription: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.8)",
        lineHeight: 1.3,
        margin: 0,
        textAlign: "center",
        textShadow: "0 1px 4px rgba(0,0,0,0.5)",
    },
    // 모달 내 스프레드 스타일
    spreadModalContent: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    spreadModalCard: {
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: 12,
        padding: "16px 20px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(5px)",
    },
    spreadModalTitle: {
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 6,
        color: "#fff",
        margin: "0 0 6px 0",
        textShadow: "0 1px 4px rgba(0,0,0,0.5)",
    },
    spreadModalDescription: {
        fontSize: 13,
        color: "rgba(255, 255, 255, 0.8)",
        lineHeight: 1.4,
        margin: 0,
        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
    },
};
