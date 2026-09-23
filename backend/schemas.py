from pydantic import BaseModel


class QuestionPublic(BaseModel):
    id: int
    text: str
    category: str
    difficulty: str

    class Config:
        from_attributes = True


class AnswerRequest(BaseModel):
    question_id: int
    latitude: float
    longitude: float
    time_spent: float = 0.0


class AnswerResponse(BaseModel):
    question_id: int
    correct_latitude: float
    correct_longitude: float
    correct_text: str
    distance_km: float
    base_score: int
    time_bonus: float
    final_score: int


class GameCreate(BaseModel):
    player_name: str
    score: int
    questions_count: int


class GameResponse(BaseModel):
    id: int
    player_name: str
    score: int
    questions_count: int
    created_at: str


class LeaderboardEntry(BaseModel):
    rank: int
    player_name: str
    score: int