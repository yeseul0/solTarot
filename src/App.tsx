import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import PickCard from "./pages/PickCard";

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
    };
  }
}

const App: React.FC = () => {
  const [wallet, setWallet] = useState<string | null>(null);

  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const resp = await window.solana.connect();
        setWallet(resp.publicKey.toString());
      } catch (err) {
        alert("지갑 연결이 취소되었습니다.");
      }
    } else {
      alert("Phantom 지갑을 설치해주세요!");
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome onConnect={connectWallet} />} />
        <Route path="/pick" element={<PickCard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
