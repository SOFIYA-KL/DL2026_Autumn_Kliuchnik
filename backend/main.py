from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import desc
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func

from database import Base, engine, get_db
from models import Question, Game
from schemas import (
    QuestionPublic,
    AnswerRequest,
    AnswerResponse,
    GameCreate,
    GameResponse,
    LeaderboardEntry,
)
from scoring import haversine, calculate_score

# Создаём таблицы при старте (если их ещё нет)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Geo Quiz API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Базовые проверки ----------

@app.get("/")
def root():
    return {"message": "Geo Quiz API is running"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ---------- Вопросы ----------

@app.get("/api/questions", response_model=list[QuestionPublic])
def get_questions(limit: int = 10, db: Session = Depends(get_db)):
    """
    Возвращает N случайных вопросов БЕЗ координат.
    Фронт получит только id, текст, категорию и сложность.
    """
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="limit должен быть от 1 до 100")

    questions = (
        db.query(Question)
        .order_by(func.random())
        .limit(limit)
        .all()
    )
    return questions


# ---------- Ответ игрока ----------

@app.post("/api/answer", response_model=AnswerResponse)
def answer(payload: AnswerRequest, db: Session = Depends(get_db)):
    """
    Принимает координаты клика игрока, считает расстояние до правильной точки
    и возвращает очки.
    """
    # Проверяем координаты
    if not (-90 <= payload.latitude <= 90) or not (-180 <= payload.longitude <= 180):
        raise HTTPException(status_code=400, detail="Некорректные координаты")

    # Ищем вопрос
    question = db.query(Question).filter(Question.id == payload.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Вопрос не найден")

    # Считаем расстояние и очки
    distance_km = haversine(
        payload.latitude, payload.longitude,
        question.latitude, question.longitude,
    )
    scores = calculate_score(distance_km, payload.time_spent)

    return AnswerResponse(
        question_id=question.id,
        correct_latitude=question.latitude,
        correct_longitude=question.longitude,
        correct_text=question.correct_text,
        distance_km=round(distance_km, 1),
        base_score=scores["base_score"],
        time_bonus=scores["time_bonus"],
        final_score=scores["final_score"],
    )


# ---------- Сохранение игры ----------

@app.post("/api/games", response_model=GameResponse, status_code=201)
def save_game(payload: GameCreate, db: Session = Depends(get_db)):
    """Сохраняет результат игры — для таблицы лидеров."""
    if not payload.player_name.strip():
        raise HTTPException(status_code=400, detail="Имя не может быть пустым")
    if payload.score < 0:
        raise HTTPException(status_code=400, detail="Очки не могут быть отрицательными")

    game = Game(
        player_name=payload.player_name.strip()[:50],
        score=payload.score,
        questions_count=payload.questions_count,
    )
    db.add(game)
    db.commit()
    db.refresh(game)

    return GameResponse(
        id=game.id,
        player_name=game.player_name,
        score=game.score,
        questions_count=game.questions_count,
        created_at=game.created_at.isoformat(),
    )


# ---------- Таблица лидеров ----------

@app.get("/api/leaderboard", response_model=list[LeaderboardEntry])
def leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    """Топ-N игроков по очкам."""
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="limit должен быть от 1 до 100")

    rows = (
        db.query(Game)
        .order_by(desc(Game.score))
        .limit(limit)
        .all()
    )
    return [
        LeaderboardEntry(rank=i + 1, player_name=g.player_name, score=g.score)
        for i, g in enumerate(rows)
    ]


# ---------- Подсказки ----------

def get_continent(lat: float, lng: float) -> str:
    """Определяет континент по координатам (приближённо, для подсказок)."""
    if -35 <= lat <= 37 and -20 <= lng <= 52:
        return "Африке"
    if 35 <= lat <= 72 and -15 <= lng <= 40:
        return "Европе"
    if 0 <= lat <= 80 and 40 < lng <= 180:
        return "Азии"
    if 10 <= lat <= 80 and -170 <= lng <= -50:
        return "Северной Америке"
    if -60 <= lat <= 15 and -85 <= lng <= -30:
        return "Южной Америке"
    if -50 <= lat <= 0 and 110 <= lng <= 180:
        return "Австралии и Океании"
    if lat < -60:
        return "Антарктиде"
    return "неизвестно где"


@app.get("/api/hint/{question_id}")
def get_hint(question_id: int, db: Session = Depends(get_db)):
    """Подсказка: континент, где находится правильный ответ."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Вопрос не найден")
    return {
        "question_id": question_id,
        "continent": get_continent(question.latitude, question.longitude),
        "category": question.category,
    }


# ---------- Очистка игр (для разработки) ----------

@app.delete("/api/games")
def clear_games(db: Session = Depends(get_db)):
    """Удаляет все игры из таблицы лидеров. Только для разработки."""
    count = db.query(Game).count()
    db.query(Game).delete()
    db.commit()
    return {"deleted": count}