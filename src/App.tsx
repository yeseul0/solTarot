import React, { useState } from "react";
import Welcome from "./Welcome";
import PickCard from "./PickCard";

const App: React.FC = () => {
  const [step, setStep] = useState<"welcome" | "pick">("welcome");
  const [wallet, setWallet] = useState<string | null>(null);

  const connectWallet = async () => {
    if ((window as any).solana && (window as any).solana.isPhantom) {
      try {
        const resp = await (window as any).solana.connect();
        setWallet(resp.publicKey.toString());
        setStep("pick");
      } catch (err) {
        alert("지갑 연결이 취소되었습니다.");
      }
    } else {
      alert("Phantom 지갑을 설치해주세요!");
    }
  };

  const reset = () => {
    setStep("welcome");
    setWallet(null);
  };

  return (
    <>
      {step === "welcome" && <Welcome onConnect={connectWallet} />}
      {step === "pick" && wallet && <PickCard wallet={wallet} onReset={reset} />}
    </>
  );
};

export default App;
