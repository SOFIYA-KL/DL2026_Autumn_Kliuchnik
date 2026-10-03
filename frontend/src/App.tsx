import { useState } from "react";
import StartScreen from "./components/StartScreen";
import GameScreen from "./components/GameScreen";
import FinishScreen from "./components/FinishScreen";
import { saveGame } from "./api/client";

function App() {
  const [screen, setScreen] = useState<"start" | "game" | "finish">("start");
  const [playerName, setPlayerName] = useState("");
  const [mode, setMode] = useState("classic");
  const [finalScore, setFinalScore] = useState(0);
  const [saved, setSaved] = useState(false);

  const handleFinish = async (score: number, questionsCount: number) => {
    setFinalScore(score);
    setScreen("finish");
    setSaved(false);
    try {
      await saveGame({
        player_name: playerName,
        score,
        questions_count: questionsCount,
      });
      setSaved(true);
    } catch {
      setSaved(false);
    }
  };

  return (
    <div
      style={{
        background:
          "radial-gradient(circle at 20% 0%, #1e293b 0%, #0f172a 50%, #020617 100%)",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {screen === "start" && (
        <StartScreen
          onStart={(name, m) => {
            setPlayerName(name);
            setMode(m);
            setScreen("game");
          }}
        />
      )}
      {screen === "game" && (
        <GameScreen
          playerName={playerName}
          mode={mode}
          onFinish={handleFinish}
        />
      )}
      {screen === "finish" && (
        <FinishScreen
          playerName={playerName}
          score={finalScore}
          saved={saved}
          onRestart={() => setScreen("start")}
        />
      )}
    </div>
  );
}

export default App;