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

# Создаём таблицы при старте
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Geo Quiz API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Geo Quiz API is running"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/questions", response_model=list[QuestionPublic])
def get_questions(limit: int = 10, db: Session = Depends(get_db)):
    if limit < 1 or limit > 50:
        raise HTTPException(status_code=400, detail="limit должен быть от 1 до 50")
    questions = db.query(Question).order_by(func.random()).limit(limit).all()
    return questions


@app.post("/api/answer", response_model=AnswerResponse)
def answer(payload: AnswerRequest, db: Session = Depends(get_db)):
    if not (-90 <= payload.latitude <= 90) or not (-180 <= payload.longitude <= 180):
        raise HTTPException(status_code=400, detail="Некорректные координаты")
    question = db.query(Question).filter(Question.id == payload.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Вопрос не найден")
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


@app.post("/api/games", response_model=GameResponse, status_code=201)
def save_game(payload: GameCreate, db: Session = Depends(get_db)):
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


@app.get("/api/leaderboard", response_model=list[LeaderboardEntry])
def leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="limit должен быть от 1 до 100")
    rows = db.query(Game).order_by(desc(Game.score)).limit(limit).all()
    return [
        LeaderboardEntry(rank=i + 1, player_name=g.player_name, score=g.score)
        for i, g in enumerate(rows)
    ]