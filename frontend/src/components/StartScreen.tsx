import { useState } from "react";

interface Props {
  onStart: (playerName: string, mode: string) => void;
}

export default function StartScreen({ onStart }: Props) {
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"classic" | "endless" | "survival">("classic");

  const handleStart = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Введите имя");
      return;
    }
    onStart(trimmed, mode);
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "15%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          padding: 40,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(148, 163, 184, 0.15)",
          borderRadius: 24,
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 64,
            lineHeight: 1,
            marginBottom: 8,
            filter: "drop-shadow(0 8px 24px rgba(59,130,246,0.5))",
          }}
        >
          🌍
        </div>

        <h1
          style={{
            fontSize: 42,
            fontWeight: 800,
            margin: "8px 0 12px",
            background: "linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: -1,
          }}
        >
          Geo Quiz
        </h1>

        <p style={{ color: "#94a3b8", fontSize: 16, margin: "0 0 24px", lineHeight: 1.5 }}>
          Угадай, где это находится на карте мира
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
          placeholder="Твоё имя"
          maxLength={30}
          autoFocus
          style={{
            width: "100%",
            padding: "14px 18px",
            fontSize: 16,
            color: "#e2e8f0",
            background: "rgba(30, 41, 59, 0.7)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: 12,
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
            marginBottom: 16,
            transition: "border-color 0.2s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.6)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(148,163,184,0.2)")}
        />

        <div style={{ marginBottom: 20, textAlign: "left" }}>
          <div
            style={{
              color: "#64748b",
              fontSize: 11,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Режим игры
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <ModeBtn
              active={mode === "classic"}
              onClick={() => setMode("classic")}
              icon="🎯"
              label="10 вопросов"
            />
            <ModeBtn
              active={mode === "endless"}
              onClick={() => setMode("endless")}
              icon="♾️"
              label="Бесконечный"
            />
            <ModeBtn
              active={mode === "survival"}
              onClick={() => setMode("survival")}
              icon="💀"
              label="До ошибки"
            />
          </div>
        </div>

        <button
          onClick={handleStart}
          style={{
            width: "100%",
            padding: "14px 24px",
            fontSize: 17,
            fontWeight: 700,
            color: "white",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 10px 30px rgba(59,130,246,0.4)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 15px 35px rgba(59,130,246,0.55)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(59,130,246,0.4)";
          }}
        >
          Начать игру →
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            marginTop: 24,
            color: "#64748b",
            fontSize: 13,
          }}
        >
          <div>⚡ Бонус за скорость</div>
          <div>🏆 До 75 000 очков</div>
        </div>
      </div>
    </div>
  );
}

function ModeBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "12px 8px",
        background: active ? "rgba(59, 130, 246, 0.15)" : "rgba(30, 41, 59, 0.5)",
        border: active
          ? "1px solid rgba(59, 130, 246, 0.6)"
          : "1px solid rgba(148, 163, 184, 0.15)",
        borderRadius: 10,
        color: active ? "#60a5fa" : "#94a3b8",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        transition: "all 0.15s ease",
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}