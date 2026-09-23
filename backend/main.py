from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func

from database import Base, engine, get_db
from models import Question
from schemas import QuestionPublic

# Создаём таблицы при старте (если их ещё нет)
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
    """
    Возвращает N случайных вопросов БЕЗ координат.
    Фронт получит только id, текст, категорию и сложность.
    """
    if limit < 1 or limit > 50:
        raise HTTPException(status_code=400, detail="limit должен быть от 1 до 50")

    questions = (
        db.query(Question)
        .order_by(func.random())
        .limit(limit)
        .all()
    )
    return questions