/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { QUESTIONS_DATA } from './data/questions';
import { GameSession, NotificationState } from './types';
import { GameService } from './services/gameService';
import { sound } from './services/sound';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { ArenaMatch } from './components/ArenaMatch';
import { CardGrid } from './components/CardGrid';
import { DualColumnBoard } from './components/DualColumnBoard';
import { NotificationToast } from './components/NotificationToast';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ResultModal } from './components/ResultModal';
import { RulesModal } from './components/RulesModal';
import { HostDashboardModal } from './components/HostDashboardModal';
import { ArrowLeft, Layers, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentView, setCurrentView] = useState<'arena' | 'grid' | 'dual'>('arena');
  const [currentCardId, setCurrentCardId] = useState<number>(1);

  // Modals state
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isHostOpen, setIsHostOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isConfirmFinishOpen, setIsConfirmFinishOpen] = useState(false);

  // Floating Toast Notification
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Check for restored ongoing session
  useEffect(() => {
    const active = GameService.getActiveSession();
    if (active) {
      setSession(active);
      setCurrentCardId(active.currentCardId || 1);
      if (active.isFinished) {
        setIsResultOpen(true);
      }
    }
  }, []);

  const triggerNotification = (
    type: 'correct' | 'wrong' | 'warning' | 'info',
    title: string,
    message: string,
    points?: number,
    explanation?: string
  ) => {
    setNotification({
      show: true,
      type,
      title,
      message,
      points,
      explanation
    });

    // Auto-dismiss after 2.5s
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 2800);
  };

  // Start Game
  const handleStartGame = (playerName: string, mode: 'practice' | 'competition', roomCode: string) => {
    const newSession = GameService.startNewSession(playerName, mode, roomCode);
    setSession(newSession);
    setCurrentCardId(1);
    setCurrentView('arena');
    setIsResultOpen(false);
  };

  // Submit Answer
  const handleSubmitAnswer = (
    questionId: number,
    selectedAnswerId: string,
    selectedAnswerText: string
  ) => {
    if (!session || session.isFinished) return;

    const result = GameService.submitAnswer(session, questionId, selectedAnswerId, selectedAnswerText);
    setSession({ ...session });

    if (result.alreadyAnswered) {
      triggerNotification('warning', 'SUDAH DINILAI', 'Kartu ini sudah dinilai sebelumnya.');
      return;
    }

    if (result.isCorrect) {
      triggerNotification(
        'correct',
        `BENAR! +${result.pointsEarned} POIN`,
        `Pasangan "${selectedAnswerText}" sangat tepat!`,
        result.pointsEarned,
        result.explanation
      );
    } else {
      const q = QUESTIONS_DATA.find(item => item.id === questionId);
      triggerNotification(
        'wrong',
        'JAWABAN KURANG TEPAT',
        `Jawaban yang benar adalah: "${q?.correctAnswerText}"`,
        0,
        result.explanation
      );
    }

    // Check if finished
    if (session.isFinished) {
      sound.playComplete();
      setIsResultOpen(true);
    }
  };

  // Time Expired
  const handleTimeExpired = () => {
    if (!session || session.isFinished) return;
    sound.playWarning();
    const finished = GameService.finishSession(session, 'time_up');
    setSession({ ...session });
    setIsResultOpen(true);
    triggerNotification('warning', 'WAKTU 05:00 HABIS!', 'Permainan otomatis dihentikan dan skor disimpan.');
  };

  // Manual Finish
  const handleConfirmFinish = () => {
    if (!session) return;
    sound.playComplete();
    GameService.finishSession(session, 'manual_finish');
    setSession({ ...session });
    setIsConfirmFinishOpen(false);
    setIsResultOpen(true);
  };

  // Play Again (fresh session)
  const handlePlayAgain = () => {
    if (!session) return;
    const newSession = GameService.startNewSession(session.playerName, session.mode, session.roomCode);
    setSession(newSession);
    setCurrentCardId(1);
    setCurrentView('arena');
    setIsResultOpen(false);
  };

  // Go to Home
  const handleGoHome = () => {
    GameService.clearSession();
    setSession(null);
    setIsResultOpen(false);
  };

  const currentQuestion = QUESTIONS_DATA.find(q => q.id === currentCardId) || QUESTIONS_DATA[0];

  return (
    <div className="min-h-screen bg-[#020B09] text-[#F5F2E8] flex flex-col selection:bg-[#00D9FF] selection:text-black">
      {/* Header if in game */}
      {session && !session.isFinished && (
        <Header
          session={session}
          totalQuestions={QUESTIONS_DATA.length}
          onTimeExpired={handleTimeExpired}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenHostDashboard={() => setIsHostOpen(true)}
        />
      )}

      {/* Main Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 flex flex-col items-center">
        {!session ? (
          /* Landing Screen */
          <HomePage
            onStartGame={handleStartGame}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenHostDashboard={() => setIsHostOpen(true)}
          />
        ) : (
          /* Game Mode Screens */
          <div className="w-full space-y-4">
            {/* View Switcher Bar */}
            <div className="w-full flex items-center justify-between gap-2 pb-2 border-b border-[#31524D]/60 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentView('arena');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-tech font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                    currentView === 'arena'
                      ? 'bg-[#00D9FF] text-black shadow-[0_0_12px_#00D9FF]'
                      : 'bg-[#002D28] text-[#CBD5E1] hover:bg-[#003831]'
                  }`}
                >
                  <Sparkles size={14} /> Arena Kartu #{currentCardId}
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentView('grid');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-tech font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                    currentView === 'grid'
                      ? 'bg-[#00D9FF] text-black shadow-[0_0_12px_#00D9FF]'
                      : 'bg-[#002D28] text-[#CBD5E1] hover:bg-[#003831]'
                  }`}
                >
                  <Layers size={14} /> Kisi 50 Kartu
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentView('dual');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-tech font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                    currentView === 'dual'
                      ? 'bg-[#00D9FF] text-black shadow-[0_0_12px_#00D9FF]'
                      : 'bg-[#002D28] text-[#D6B56D] hover:bg-[#003831]'
                  }`}
                >
                  <Sparkles size={14} /> Papan Dua Kolom
                </button>
              </div>

              <div className="text-xs font-tech text-[#94A3B8]">
                Peserta: <b className="text-white">{session.playerName}</b>
                {session.roomCode && <span className="ml-2 text-[#00D9FF]">Room #{session.roomCode}</span>}
              </div>
            </div>

            {/* Mode: Arena Match (Default active card) */}
            {currentView === 'arena' && (
              <ArenaMatch
                currentQuestion={currentQuestion}
                answers={session.answers}
                allQuestions={QUESTIONS_DATA}
                onSelectCardId={(id) => setCurrentCardId(id)}
                onSubmitAnswer={handleSubmitAnswer}
                onFinishGame={() => setIsConfirmFinishOpen(true)}
                onOpenCardGrid={() => setCurrentView('grid')}
                onOpenDualBoard={() => setCurrentView('dual')}
              />
            )}

            {/* Mode: 50 Cards Grid (5-column board from reference image) */}
            {currentView === 'grid' && (
              <CardGrid
                questions={QUESTIONS_DATA}
                answers={session.answers}
                currentCardId={currentCardId}
                onSelectCard={(id) => {
                  sound.playClick();
                  setCurrentCardId(id);
                  setCurrentView('arena');
                }}
              />
            )}

            {/* Mode: Dual Column Match Board */}
            {currentView === 'dual' && (
              <DualColumnBoard
                questions={QUESTIONS_DATA}
                answers={session.answers}
                onSubmitAnswer={handleSubmitAnswer}
                onOpenArenaCard={(id) => {
                  sound.playClick();
                  setCurrentCardId(id);
                  setCurrentView('arena');
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal to finish early */}
      {isConfirmFinishOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#002824] border-2 border-[#EF4444] rounded-2xl max-w-md w-full p-6 shadow-[0_0_30px_rgba(239,68,68,0.4)] text-center">
            <AlertCircle className="text-[#EF4444] mx-auto mb-2" size={40} />
            <h3 className="font-title font-bold text-lg text-white">
              YAKIN INGIN MENGAKHIRI TANTANGAN?
            </h3>
            <p className="text-xs text-[#CBD5E1] mt-2 leading-relaxed">
              Waktu yang tersisa akan dihentikan dan skor Anda saat ini akan langsung dikunci serta dicatat ke papan peringkat.
            </p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={() => setIsConfirmFinishOpen(false)}
                className="flex-1 py-2.5 rounded-lg bg-[#002D28] hover:bg-[#003831] border border-[#31524D] text-[#CBD5E1] font-tech font-bold text-xs uppercase"
              >
                Lanjutkan Bermain
              </button>
              <button
                onClick={handleConfirmFinish}
                className="flex-1 py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white font-tech font-bold text-xs uppercase tracking-wider shadow"
              >
                Ya, Akhiri Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {isResultOpen && session && (
        <ResultModal
          session={session}
          questions={QUESTIONS_DATA}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        />
      )}

      {/* Leaderboard Modal */}
      {isLeaderboardOpen && (
        <LeaderboardModal
          currentRoomCode={session?.roomCode}
          currentPlayerName={session?.playerName}
          onClose={() => setIsLeaderboardOpen(false)}
        />
      )}

      {/* Rules Modal */}
      {isRulesOpen && (
        <RulesModal onClose={() => setIsRulesOpen(false)} />
      )}

      {/* Host / Teacher Dashboard */}
      {isHostOpen && (
        <HostDashboardModal
          currentRoomCode={session?.roomCode || ''}
          onSelectRoom={(code) => {
            if (session) {
              session.roomCode = code;
              session.mode = 'competition';
              GameService.saveSession(session);
              setSession({ ...session });
            }
          }}
          onClose={() => setIsHostOpen(false)}
        />
      )}

      {/* Toast Notification Alert */}
      <NotificationToast
        notification={notification}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}
