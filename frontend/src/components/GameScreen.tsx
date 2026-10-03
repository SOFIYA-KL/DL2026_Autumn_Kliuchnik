import { useEffect, useState } from "react";
import MapView from "./MapView";
import { fetchQuestions, submitAnswer, fetchHint } from "../api/client";
import type { Question, AnswerResponse } from "../types";

interface Props {
  playerName: string;
  mode: string;
  onFinish: (score: number, questionsCount: number) => void;
}

export default function GameScreen({ playerName, mode, onFinish }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [pending, setPending] = useState<[number, number] | null>(null);
  const [result, setResult] = useState<AnswerResponse | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [usedHint, setUsedHint] = useState(false);

  useEffect(() => {
    const limit = mode === "classic" ? 10 : 30;
    fetchQuestions(limit).then((qs) => {
      setQuestions(qs);
      setStartTime(Date.now());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (result) return;
    const t = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 200);
    return () => clearInterval(t);
  }, [startTime, result]);

  const handleMapClick = (lat: number, lng: number) => {
    if (result) return;
    setPending([lat, lng]);
  };

  const handleHint = async () => {
    if (!questions[current] || result || usedHint) return;
    try {
      const h = await fetchHint(questions[current].id);
      setHint(`📍 Это в ${h.continent}`);
      setUsedHint(true);
    } catch {
      setHint("Не удалось загрузить подсказку");
    }
  };

  const handleConfirm = async () => {
    if (!pending || !questions[current] || result || loading) return;
    setLoading(true);
    const timeSpent = (Date.now() - startTime) / 1000;
    try {
      const res = await submitAnswer({
        question_id: questions[current].id,
        latitude: pending[0],
        longitude: pending[1],
        time_spent: timeSpent,
      });
      setResult(res);
      const penalty = usedHint ? 0.7 : 1.0;
      setScore((s) => s + Math.round(res.final_score * penalty));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => setPending(null);

  const handleNext = () => {
    if (mode === "survival" && result && result.final_score === 0) {
      onFinish(score, current + 1);
      return;
    }

    setPending(null);
    setResult(null);
    setSeconds(0);
    setStartTime(Date.now());
    setHint(null);
    setUsedHint(false);

    const isLast =
      (mode === "classic" && current + 1 >= 10) ||
      current + 1 >= questions.length;

    if (isLast) {
      onFinish(score, current + 1);
    } else {
      setCurrent((c) => c + 1);
    }
  };

  if (questions.length === 0) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: 20,
        }}
      >
        Загрузка вопросов…
      </div>
    );
  }

  const totalLabel =
    mode === "classic" ? "10" : mode === "endless" ? "∞" : "💀";

  const totalQuestions = mode === "classic" ? 10 : questions.length;
  const progress = Math.min(
    1,
    (current + (result ? 1 : 0)) / totalQuestions
  );

  const displayScore = result
    ? usedHint
      ? Math.round(result.final_score * 0.7)
      : result.final_score
    : 0;

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 16,
        gap: 12,
        width: "100%",
      }}
    >
      {/* Шапка */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              color: "white",
              boxShadow: result
                ? `0 0 20px ${
                    result.final_score > 0
                      ? "rgba(34, 197, 94, 0.6)"
                      : "rgba(239, 68, 68, 0.6)"
                  }`
                : "0 0 0 rgba(0,0,0,0)",
              transition: "box-shadow 0.4s ease",
            }}
          >
            {playerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: 11,
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              Игрок
            </div>
            <div style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600 }}>
              {playerName}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {!result && (
            <button
              onClick={handleHint}
              disabled={usedHint}
              style={{
                padding: "6px 14px",
                background: usedHint
                  ? "rgba(71, 85, 105, 0.3)"
                  : "rgba(251, 191, 36, 0.15)",
                border: usedHint
                  ? "1px solid rgba(148, 163, 184, 0.2)"
                  : "1px solid rgba(251, 191, 36, 0.4)",
                color: usedHint ? "#64748b" : "#fbbf24",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: usedHint ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {usedHint ? "💡 −30%" : "💡 Подсказка"}
            </button>
          )}
          <Stat label="Вопрос" value={`${current + 1} / ${totalLabel}`} />
          <Stat label="Счёт" value={score.toString()} accent />
          <Stat label="Время" value={`${seconds}с`} />
          {mode === "endless" && !result && (
            <button
              onClick={() => onFinish(score, current + 1)}
              style={{
                padding: "6px 14px",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#f87171",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              🏁 Завершить
            </button>
          )}
        </div>
      </div>

      {/* Прогресс-бар */}
      <div
        style={{
          height: 4,
          background: "rgba(148, 163, 184, 0.1)",
          borderRadius: 2,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)",
            borderRadius: 2,
            transition: "width 0.4s ease",
            boxShadow: "0 0 12px rgba(139, 92, 246, 0.6)",
          }}
        />
      </div>

      {/* Вопрос */}
      <div
        style={{
          padding: "14px 20px",
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(148, 163, 184, 0.15)",
          borderRadius: 14,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            color: "#64748b",
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Вопрос
        </div>
        <div style={{ color: "#e2e8f0", fontSize: 22, fontWeight: 600 }}>
          {questions[current].text}
        </div>
      </div>

      {/* Подсказка */}
      {hint && !result && (
        <div
          style={{
            padding: "10px 16px",
            background: "rgba(251, 191, 36, 0.1)",
            border: "1px solid rgba(251, 191, 36, 0.3)",
            borderRadius: 12,
            color: "#fbbf24",
            fontSize: 14,
            fontWeight: 600,
            flexShrink: 0,
            animation: "fadeIn 0.3s ease",
          }}
        >
          {hint}{" "}
          <span style={{ color: "#94a3b8", fontWeight: 400 }}>
            (−30% к очкам)
          </span>
        </div>
      )}

      {/* Карта */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <MapView
          onMapClick={handleMapClick}
          disabled={!!result}
          correctAnswer={
            result ? [result.correct_latitude, result.correct_longitude] : null
          }
          userPoint={pending}
        />
      </div>

      {/* Нижний блок */}
      {result ? (
        <div
          style={{
            padding: "14px 20px",
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            gap: 16,
            animation: "fadeIn 0.3s ease",
          }}
        >
          <div>
            <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>
              Правильно:{" "}
              <span style={{ color: "#22c55e", fontWeight: 600 }}>
                {result.correct_text}
              </span>
            </div>
            <div style={{ color: "#64748b", fontSize: 13 }}>
              {result.distance_km} км · Точность {result.base_score} · ×
              {result.time_bonus}
              {usedHint && " · −30% за подсказку"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                color: displayScore > 0 ? "#38bdf8" : "#64748b",
                fontSize: 28,
                fontWeight: 700,
                fontFamily: "monospace",
                textShadow:
                  displayScore > 0
                    ? "0 0 20px rgba(56,189,248,0.6)"
                    : "none",
              }}
            >
              +{displayScore}
            </div>
            <button
              onClick={handleNext}
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {mode === "survival" && result.final_score === 0
                ? "Завершить"
                : mode === "classic" && current + 1 >= 10
                ? "Завершить"
                : current + 1 >= questions.length
                ? "Завершить"
                : "Дальше →"}
            </button>
          </div>
        </div>
      ) : pending ? (
        <div
          style={{
            padding: "14px 20px",
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            gap: 16,
          }}
        >
          <div style={{ color: "#94a3b8", fontSize: 14 }}>
            📍 Ты выбрал точку. Подтвердить ответ?
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleCancel}
              style={{
                padding: "10px 20px",
                background: "rgba(71, 85, 105, 0.4)",
                color: "#e2e8f0",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Отмена
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{
                padding: "10px 24px",
                background: loading
                  ? "rgba(71, 85, 105, 0.5)"
                  : "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {loading ? "Проверяем…" : "✓ Ответить"}
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "14px 20px",
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: 14,
            textAlign: "center",
            color: "#94a3b8",
            fontSize: 15,
            flexShrink: 0,
          }}
        >
          🖱️ Кликни по карте, чтобы выбрать точку. Колесо мыши — зум.
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        padding: "6px 14px",
        background: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(148, 163, 184, 0.15)",
        borderRadius: 10,
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: 10,
          letterSpacing: 1.2,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: accent ? "#38bdf8" : "#e2e8f0",
          fontSize: accent ? 20 : 17,
          fontWeight: 700,
          fontFamily: "monospace",
          textShadow: accent ? "0 0 12px rgba(56,189,248,0.5)" : "none",
        }}
      >
        {value}
      </div>
    </div>
  );
}