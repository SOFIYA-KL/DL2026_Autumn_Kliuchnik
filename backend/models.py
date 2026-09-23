from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime

from database import Base


class Question(Base):
    """Вопрос викторины с координатами правильного ответа."""
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)              # "Где Эйфелева башня?"
    latitude = Column(Float, nullable=False)           # правильная широта
    longitude = Column(Float, nullable=False)          # правильная долгота
    correct_text = Column(String, nullable=False)      # "Париж, Франция"
    category = Column(String, default="landmark")      # landmark/capital/city
    difficulty = Column(String, default="easy")        # easy/medium/hard


class Game(Base):
    """Результат одной игры — для таблицы лидеров."""
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    player_name = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    questions_count = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)