from pydantic import BaseModel


class QuestionPublic(BaseModel):
    """
    То, что уходит на фронт.
    ВАЖНО: НЕТ координат! Иначе игрок подсмотрит их в DevTools.
    """
    id: int
    text: str
    category: str
    difficulty: str

    class Config:
        from_attributes = True  # разрешает создавать схему из ORM-объекта