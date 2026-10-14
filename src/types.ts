export type QuestionTopic = 'bahan_tambang' | 'sda_terbarukan_tak_terbarukan';

export type CardStatus = 'unanswered' | 'correct' | 'wrong' | 'skipped';

export interface AnswerChoice {
  id: string;
  text: string;
  badge?: string;
}

export interface Question {
  id: number;
  cardNumber: number; // 1 to 50
  topic: QuestionTopic;
  topicTitle: string;
  level: 1 | 2 | 3;
  points: number;
  statement: string;
  correctAnswerId: string;
  correctAnswerText: string;
  explanation: string;
  historicalNote?: string;
}

export interface UserAnswerRecord {
  questionId: number;
  selectedAnswerId: string;
  selectedAnswerText: string;
  isCorrect: boolean;
  pointsEarned: number;
  answeredAt: number;
}

export interface GameSession {
  sessionId: string;
  playerName: string;
  roomCode: string;
  mode: 'practice' | 'competition';
  startTime: number;
  endTime: number; // Date.now() + 300_000
  durationSeconds: number; // 300
  answers: Record<number, UserAnswerRecord>;
  currentCardId: number;
  score: number;
  isFinished: boolean;
  finishReason?: 'time_up' | 'manual_finish' | 'all_completed';
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  accuracy: number; // 0 to 100%
  timeSpentSeconds: number;
  timeSpentFormatted: string;
  timestamp: number;
  roomCode?: string;
  mode: 'practice' | 'competition';
}

export interface NotificationState {
  show: boolean;
  type: 'correct' | 'wrong' | 'warning' | 'info';
  title: string;
  message: string;
  points?: number;
  explanation?: string;
}
