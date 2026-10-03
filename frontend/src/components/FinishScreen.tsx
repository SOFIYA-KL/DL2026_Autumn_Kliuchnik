import { useEffect, useState } from "react";
import { fetchLeaderboard } from "../api/client";
import type { LeaderboardEntry } from "../types";

interface Props {
  playerName: string;
  score: number;
  saved: boolean;
  onRestart: () => void;
}

export default function FinishScreen({ playerName, score, saved, onRestart }: Props) {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Небольшая задержка, чтобы бэкенд успел сохранить игру
    const timer = setTimeout(() => {
      fetchLeaderboard(10)
        .then(setLeaders)
        .finally(() => setLoading(false));
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        overflow: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          padding: 32,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(148, 163, 184, 0.15)",
          borderRadius: 24,
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 8 }}>🎉</div>
          <h1
            style={{
              fontSize: 34,
              margin: "8px 0 12px",
              background: "linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 800,
            }}
          >
            Игра окончена!
          </h1>
          <p style={{ fontSize: 16, color: "#94a3b8", margin: 0 }}>
            {playerName}, твой результат
          </p>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              fontFamily: "ui-monospace, monospace",
              color: "#38bdf8",
              textShadow: "0 0 40px rgba(56,189,248,0.5)",
              lineHeight: 1,
              marginTop: 12,
            }}
          >
            {score.toLocaleString("ru-RU")}
          </div>
          {saved && (
            <div style={{ color: "#22c55e", fontSize: 13, marginTop: 8 }}>✓ Результат сохранён</div>
          )}
        </div>

        {/* Таблица лидеров */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              color: "#94a3b8",
              fontSize: 12,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            🏆 Таблица лидеров
          </div>

          {loading ? (
            <div style={{ color: "#64748b", textAlign: "center", padding: 20 }}>Загрузка…</div>
          ) : leaders.length === 0 ? (
            <div style={{ color: "#64748b", textAlign: "center", padding: 20 }}>
              Пока никто не играл. Будь первым!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {leaders.map((l) => {
                const isMe = l.player_name === playerName && l.score === score;
                return (
                  <div
                    key={l.rank}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px 16px",
                      background: isMe
                        ? "rgba(59, 130, 246, 0.15)"
                        : "rgba(15, 23, 42, 0.4)",
                      border: isMe
                        ? "1px solid rgba(59, 130, 246, 0.4)"
                        : "1px solid rgba(148, 163, 184, 0.1)",
                      borderRadius: 10,
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background:
                          l.rank === 1
                            ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                            : l.rank === 2
                            ? "linear-gradient(135deg, #cbd5e1, #94a3b8)"
                            : l.rank === 3
                            ? "linear-gradient(135deg, #d97706, #b45309)"
                            : "rgba(71, 85, 105, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 14,
                        color: "white",
                      }}
                    >
                      {l.rank}
                    </div>
                    <div style={{ flex: 1, color: "#e2e8f0", fontWeight: 500, fontSize: 15 }}>
                      {l.player_name}
                      {isMe && (
                        <span style={{ color: "#60a5fa", fontSize: 12, marginLeft: 8 }}>(ты)</span>
                      )}
                    </div>
                    <div style={{ color: "#38bdf8", fontWeight: 700, fontFamily: "monospace", fontSize: 16 }}>
                      {l.score.toLocaleString("ru-RU")}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={onRestart}
          style={{
            width: "100%",
            padding: "14px 24px",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            color: "white",
            border: "none",
            borderRadius: 12,
            fontSize: 17,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 10px 30px rgba(59,130,246,0.4)",
          }}
        >
          🔄 Играть снова
        </button>
      </div>
    </div>
  );
}