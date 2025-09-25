import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import PickCard from "./pages/PickCard";

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      isConnected: boolean;
      publicKey: { toString: () => string } | null;
      on: (event: string, callback: (args: any) => void) => void;
      off: (event: string, callback: (args: any) => void) => void;
    };
  }
}

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

const App: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    availableAccounts: [],
    currentAccountIndex: 0,
  });

  // 페이지 로드 시 기존 연결 확인 (자동 연결 활성화)
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.solana && window.solana.isPhantom) {
        try {
          // 이미 연결되어 있다면 자동으로 연결 상태 설정
          if (window.solana.isConnected && window.solana.publicKey) {
            console.log("🔗 이미 연결된 지갑 발견, 자동 연결 중...");

            // 모든 가능한 계정 가져오기
            const accounts = await getAllAccounts();
            console.log("사용 가능한 계정들:", accounts);

            // 현재 연결된 계정의 인덱스 찾기
            const currentIndex = accounts.findIndex(
              account => account.address === window.solana.publicKey?.toString()
            );

            setWallet({
              address: window.solana.publicKey.toString(),
              isConnected: true,
              isConnecting: false,
              availableAccounts: accounts,
              currentAccountIndex: Math.max(0, currentIndex),
            });

            console.log("✅ 자동 연결 완료:", window.solana.publicKey.toString());
          } else {
            console.log("연결된 지갑이 없음");
          }
        } catch (error) {
          console.error("자동 연결 중 오류:", error);
        }
      }
    };

    checkWalletConnection();

    // 계정 변경 이벤트 리스너
    const handleAccountChanged = (publicKey: any) => {
      if (publicKey) {
        setWallet({
          address: publicKey.toString(),
          isConnected: true,
          isConnecting: false,
        });
      } else {
        setWallet({
          address: null,
          isConnected: false,
          isConnecting: false,
        });
      }
    };

    // 연결 해제 이벤트 리스너
    const handleDisconnect = () => {
      setWallet({
        address: null,
        isConnected: false,
        isConnecting: false,
      });
    };

    if (window.solana) {
      window.solana.on("accountChanged", handleAccountChanged);
      window.solana.on("disconnect", handleDisconnect);
    }

    return () => {
      if (window.solana) {
        window.solana.off("accountChanged", handleAccountChanged);
        window.solana.off("disconnect", handleDisconnect);
      }
    };
  }, []);

  // 모든 가능한 계정을 가져오는 함수
  const getAllAccounts = async (): Promise<WalletAccount[]> => {
    try {
      // Solana에서 제공하는 getAllAccounts 메소드 사용
      // 아직 표준화되지 않은 기능이므로 fallback 방식 사용
      if (window.solana && typeof window.solana.request === 'function') {
        try {
          const accounts = await window.solana.request({
            method: 'wallet_getAccounts'
          });
          return accounts.map((account: any, index: number) => ({
            address: account.toString(),
            name: `Account ${index + 1}`
          }));
        } catch {
          // fallback: 현재 연결된 계정만 반환
          return [{
            address: window.solana.publicKey?.toString() || '',
            name: 'Main Account'
          }];
        }
      }

      // 기본 fallback
      return [{
        address: window.solana?.publicKey?.toString() || '',
        name: 'Main Account'
      }];
    } catch (err) {
      console.error("계정 목록 가져오기 실패:", err);
      return [];
    }
  };

  const connectWallet = async () => {
    // 팬텀 지갑 설치 확인
    if (!window.solana) {
      alert("팬텀 지갑이 설치되지 않았습니다. https://phantom.app 에서 설치해주세요!");
      window.open("https://phantom.app", "_blank");
      return;
    }

    if (!window.solana.isPhantom) {
      alert("팬텀 지갑을 사용해주세요!");
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true }));

    try {
      // 명시적으로 연결 요청
      const resp = await window.solana.connect({ onlyIfTrusted: false });
      console.log("지갑 연결 성공:", resp.publicKey.toString());

      // 모든 가능한 계정 가져오기
      const accounts = await getAllAccounts();
      console.log("사용 가능한 계정들:", accounts);

      // 현재 연결된 계정의 인덱스 찾기
      const currentIndex = accounts.findIndex(
        account => account.address === resp.publicKey.toString()
      );

      setWallet({
        address: resp.publicKey.toString(),
        isConnected: true,
        isConnecting: false,
        availableAccounts: accounts,
        currentAccountIndex: Math.max(0, currentIndex),
      });

    } catch (err) {
      console.error("지갑 연결 실패:", err);
      setWallet(prev => ({ ...prev, isConnecting: false }));

      if (err.code === 4001) {
        alert("사용자가 연결을 취소했습니다.");
      } else if (err.code === -32002) {
        alert("이미 연결 요청이 진행 중입니다. 팬텀 지갑을 확인해주세요.");
      } else {
        alert(`지갑 연결 실패: ${err.message || "알 수 없는 오류"}`);
      }
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        await window.solana.disconnect();
        console.log("지갑 연결 해제 성공");
      }

      setWallet({
        address: null,
        isConnected: false,
        isConnecting: false,
        availableAccounts: [],
        currentAccountIndex: 0,
      });

    } catch (err) {
      console.error("지갑 연결 해제 중 오류:", err);
      // 에러가 발생해도 상태는 초기화
      setWallet({
        address: null,
        isConnected: false,
        isConnecting: false,
        availableAccounts: [],
        currentAccountIndex: 0,
      });
    }
  };

  // 계정 전환 함수
  const switchAccount = async (accountIndex: number) => {
    try {
      const targetAccount = wallet.availableAccounts[accountIndex];
      if (!targetAccount) {
        console.error("유효하지 않은 계정 인덱스:", accountIndex);
        return;
      }

      console.log("계정 전환 시도:", targetAccount.address);

      // 팬텀의 계정 전환 API 사용 (만약 지원한다면)
      if (window.solana && typeof window.solana.request === 'function') {
        try {
          await window.solana.request({
            method: 'wallet_switchAccount',
            params: { address: targetAccount.address }
          });
        } catch (switchErr) {
          console.log("직접 계정 전환 불가, 재연결 시도");
          // 재연결 방식 fallback
          await disconnectWallet();
          setTimeout(async () => {
            await connectWallet();
          }, 300);
          return;
        }
      }

      // 상태 업데이트
      setWallet(prev => ({
        ...prev,
        address: targetAccount.address,
        currentAccountIndex: accountIndex,
      }));

      console.log("계정 전환 성공:", targetAccount.address);

    } catch (err) {
      console.error("계정 전환 실패:", err);
      alert("계정 전환에 실패했습니다: " + err.message);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Welcome
              wallet={wallet}
              onConnect={connectWallet}
              onDisconnect={disconnectWallet}
              onSwitchAccount={switchAccount}
            />
          }
        />
        <Route path="/pick" element={<PickCard wallet={wallet} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
