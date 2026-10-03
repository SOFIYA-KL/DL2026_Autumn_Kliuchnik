import axios from "axios";
import type {
  Question,
  AnswerRequest,
  AnswerResponse,
  GameCreate,
  LeaderboardEntry,
} from "../types";

const API_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export async function fetchQuestions(limit: number = 10): Promise<Question[]> {
  const { data } = await api.get<Question[]>("/questions", {
    params: { limit },
  });
  return data;
}

export async function submitAnswer(
  payload: AnswerRequest
): Promise<AnswerResponse> {
  const { data } = await api.post<AnswerResponse>("/answer", payload);
  return data;
}

export async function saveGame(payload: GameCreate): Promise<void> {
  await api.post("/games", payload);
}

export async function fetchLeaderboard(
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const { data } = await api.get<LeaderboardEntry[]>("/leaderboard", {
    params: { limit },
  });
  return data;
}

export interface HintResponse {
  question_id: number;
  continent: string;
  category: string;
}

export async function fetchHint(questionId: number): Promise<HintResponse> {
  const { data } = await api.get<HintResponse>(`/hint/${questionId}`);
  return data;
}