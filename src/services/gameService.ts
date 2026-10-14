import { QUESTIONS_DATA } from '../data/questions';
import { GameSession, LeaderboardEntry, UserAnswerRecord } from '../types';

const ACTIVE_SESSION_KEY = 'coc_active_game_session';
const LEADERBOARD_KEY = 'coc_arena_leaderboard';

export class GameService {
  /**
   * Starts a new 5-minute session
   */
  public static startNewSession(playerName: string, mode: 'practice' | 'competition' = 'practice', roomCode = ''): GameSession {
    const now = Date.now();
    const durationSeconds = 300; // 5 minutes
    const session: GameSession = {
      sessionId: 'sess_' + now + '_' + Math.random().toString(36).substring(2, 7),
      playerName: playerName.trim(),
      roomCode: roomCode.trim().toUpperCase(),
      mode,
      startTime: now,
      endTime: now + durationSeconds * 1000,
      durationSeconds,
      answers: {},
      currentCardId: 1,
      score: 0,
      isFinished: false
    };

    try {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Could not save session to localStorage', e);
    }

    return session;
  }

  /**
   * Restores an ongoing session if not expired
   */
  public static getActiveSession(): GameSession | null {
    try {
      const data = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (!data) return null;
      const session = JSON.parse(data) as GameSession;
      if (session.isFinished) return session;

      const now = Date.now();
      if (now >= session.endTime) {
        session.isFinished = true;
        session.finishReason = 'time_up';
        this.saveSession(session);
        this.recordToLeaderboard(session);
      }
      return session;
    } catch {
      return null;
    }
  }

  /**
   * Saves updated session state
   */
  public static saveSession(session: GameSession): void {
    try {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Failed to save session', e);
    }
  }

  /**
   * Clears active session
   */
  public static clearSession(): void {
    try {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    } catch {}
  }

  /**
   * Checks answer for a question
   */
  public static submitAnswer(
    session: GameSession,
    questionId: number,
    selectedAnswerId: string,
    selectedAnswerText: string
  ): { isCorrect: boolean; pointsEarned: number; explanation: string; alreadyAnswered: boolean } {
    if (session.isFinished) {
      return { isCorrect: false, pointsEarned: 0, explanation: 'Sesi permainan sudah berakhir.', alreadyAnswered: true };
    }

    // Check if already answered
    if (session.answers[questionId]) {
      const existing = session.answers[questionId];
      return {
        isCorrect: existing.isCorrect,
        pointsEarned: existing.pointsEarned,
        explanation: 'Soal ini sudah dinilai sebelumnya.',
        alreadyAnswered: true
      };
    }

    const question = QUESTIONS_DATA.find(q => q.id === questionId);
    if (!question) {
      return { isCorrect: false, pointsEarned: 0, explanation: 'Soal tidak ditemukan.', alreadyAnswered: false };
    }

    const isCorrect = selectedAnswerId === question.correctAnswerId;
    const pointsEarned = isCorrect ? question.points : 0;

    const answerRecord: UserAnswerRecord = {
      questionId,
      selectedAnswerId,
      selectedAnswerText,
      isCorrect,
      pointsEarned,
      answeredAt: Date.now()
    };

    session.answers[questionId] = answerRecord;
    session.score += pointsEarned;
    this.saveSession(session);

    // If all 50 questions answered, finish
    if (Object.keys(session.answers).length >= QUESTIONS_DATA.length) {
      this.finishSession(session, 'all_completed');
    }

    return {
      isCorrect,
      pointsEarned,
      explanation: question.explanation,
      alreadyAnswered: false
    };
  }

  /**
   * Finishes session and stores leaderboard entry
   */
  public static finishSession(session: GameSession, reason: 'time_up' | 'manual_finish' | 'all_completed' = 'manual_finish'): LeaderboardEntry {
    session.isFinished = true;
    session.finishReason = reason;
    this.saveSession(session);

    const entry = this.recordToLeaderboard(session);
    return entry;
  }

  /**
   * Adds entry to leaderboard
   */
  public static recordToLeaderboard(session: GameSession): LeaderboardEntry {
    const answeredList = Object.values(session.answers);
    const correctCount = answeredList.filter(a => a.isCorrect).length;
    const wrongCount = answeredList.filter(a => !a.isCorrect).length;
    const unansweredCount = QUESTIONS_DATA.length - answeredList.length;
    const accuracy = answeredList.length > 0 ? Math.round((correctCount / answeredList.length) * 100) : 0;

    const duration = Math.min(session.durationSeconds, Math.floor((Math.min(Date.now(), session.endTime) - session.startTime) / 1000));
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    const timeSpentFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const entry: LeaderboardEntry = {
      id: session.sessionId,
      playerName: session.playerName,
      score: session.score,
      correctCount,
      wrongCount,
      unansweredCount,
      accuracy,
      timeSpentSeconds: duration,
      timeSpentFormatted,
      timestamp: Date.now(),
      roomCode: session.roomCode || undefined,
      mode: session.mode
    };

    try {
      const existingStr = localStorage.getItem(LEADERBOARD_KEY);
      let list: LeaderboardEntry[] = existingStr ? JSON.parse(existingStr) : [];
      // avoid duplicates
      list = list.filter(item => item.id !== entry.id);
      list.push(entry);
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to store leaderboard entry', e);
    }

    // Try posting to backend room API asynchronously
    if (session.roomCode) {
      fetch(`/api/rooms/${encodeURIComponent(session.roomCode)}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      }).catch(() => {
        // Fallback gracefully if server is unreachable
      });
    }

    return entry;
  }

  /**
   * Fetches leaderboard sorted according to tournament rules
   */
  public static async getLeaderboard(roomCode?: string): Promise<LeaderboardEntry[]> {
    let entries: LeaderboardEntry[] = [];

    // If room code provided, try fetching from backend room first
    if (roomCode) {
      try {
        const res = await fetch(`/api/rooms/${encodeURIComponent(roomCode)}/scores`);
        if (res.ok) {
          const remoteList = await res.json();
          if (Array.isArray(remoteList)) {
            entries = remoteList;
          }
        }
      } catch {
        // Fallback to local
      }
    }

    if (entries.length === 0) {
      try {
        const stored = localStorage.getItem(LEADERBOARD_KEY);
        if (stored) {
          entries = JSON.parse(stored);
        }
      } catch {}
    }

    // Filter by room if specified
    if (roomCode && entries.length > 0) {
      const filtered = entries.filter(e => e.roomCode && e.roomCode.toUpperCase() === roomCode.toUpperCase());
      if (filtered.length > 0) {
        entries = filtered;
      }
    }

    // Sort: 1. Score desc, 2. Correct count desc, 3. Time spent asc
    entries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
      return a.timeSpentSeconds - b.timeSpentSeconds;
    });

    return entries;
  }

  /**
   * Calculates time remaining in the 5-minute cycle for leaderboard auto-refresh
   */
  public static getLeaderboardCycleSeconds(): number {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const cycle = 300; // 5 minutes
    const passed = nowSeconds % cycle;
    return cycle - passed;
  }
}
