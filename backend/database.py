from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Файл базы будет создан в папке backend, называется quiz.db
DATABASE_URL = "sqlite:///./quiz.db"

# check_same_thread=False нужен только для SQLite + FastAPI.
# Без него FastAPI ругается при многопоточных запросах.
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# Фабрика сессий: каждый запрос получает свою сессию
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()


def get_db():
    """FastAPI-зависимость: выдаёт сессию и закрывает её после запроса."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()