export interface Question {
  id: number;
  text: string;
  category: string;
  difficulty: string;
}

export interface AnswerRequest {
  question_id: number;
  latitude: number;
  longitude: number;
  time_spent: number;
}

export interface AnswerResponse {
  question_id: number;
  correct_latitude: number;
  correct_longitude: number;
  correct_text: string;
  distance_km: number;
  base_score: number;
  time_bonus: number;
  final_score: number;
}

export interface GameCreate {
  player_name: string;
  score: number;
  questions_count: number;
}

export interface LeaderboardEntry {
  rank: number;
  player_name: string;
  score: number;
}