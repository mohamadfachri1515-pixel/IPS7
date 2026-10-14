import React, { useEffect, useState } from 'react';
import { GameSession } from '../types';
import { sound } from '../services/sound';
import {
  Timer,
  Award,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  Trophy,
  BookOpen,
  Share2
} from 'lucide-react';

interface HeaderProps {
  session: GameSession;
  totalQuestions: number;
  onTimeExpired: () => void;
  onOpenLeaderboard: () => void;
  onOpenRules: () => void;
  onOpenHostDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  totalQuestions,
  onTimeExpired,
  onOpenLeaderboard,
  onOpenRules,
  onOpenHostDashboard
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [warned60, setWarned60] = useState(false);
  const [warned30, setWarned30] = useState(false);
  const [warned10, setWarned10] = useState(false);
  const [warned5, setWarned5] = useState(false);

  // Accurate timestamp-based timer
  useEffect(() => {
    if (session.isFinished) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((session.endTime - now) / 1000));
      setSecondsRemaining(diff);

      // Warning chimes at 60s, 30s, 10s, 5s
      if (diff === 60 && !warned60) {
        sound.playWarning();
        setWarned60(true);
      } else if (diff === 30 && !warned30) {
        sound.playWarning();
        setWarned30(true);
      } else if (diff <= 10 && diff > 5 && !warned10) {
        sound.playWarning();
        setWarned10(true);
      } else if (diff <= 5 && diff > 0 && !warned5) {
        sound.playWarning();
        setWarned5(true);
      }

      if (diff <= 0) {
        clearInterval(interval);
        onTimeExpired();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [session.endTime, session.isFinished, warned60, warned30, warned10, warned5, onTimeExpired]);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const answeredList = Object.values(session.answers);
  const correctCount = answeredList.filter(a => a.isCorrect).length;
  const wrongCount = answeredList.filter(a => !a.isCorrect).length;
  const answeredCount = answeredList.length;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Timer color states
  let timerBoxStyle = 'bg-[#002D28] border-[#00D9FF] text-[#00D9FF] shadow-[0_0_15px_rgba(0,217,255,0.4)]';
  if (secondsRemaining <= 15) {
    timerBoxStyle = 'bg-[#450A0A] border-[#EF4444] text-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse';
  } else if (secondsRemaining <= 60) {
    timerBoxStyle = 'bg-[#3E2405] border-[#F59E0B] text-[#FBBF24] shadow-[0_0_15px_rgba(245,158,11,0.5)]';
  }

  return (
    <header className="w-full bg-[#001D1A]/95 border-b border-[#31524D] backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Participant Info */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            {/* Crest Logo */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D9FF] to-[#00473E] p-0.5 flex items-center justify-center shadow-[0_0_12px_#00D9FF]">
              <span className="font-title text-xs font-black text-black">COC</span>
            </div>
            <div>
              <h1 className="font-title font-black text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F5E5BE] to-[#D6B56D] leading-none">
                CLASH OF CHAMPIONS
              </h1>
              <span className="text-[10px] sm:text-xs font-tech text-[#00D9FF] tracking-wider uppercase font-semibold">
                SDA: TANTANGAN 50 KARTU
              </span>
            </div>
          </div>

          {/* Participant Tag on Mobile/Compact */}
          <div className="flex md:hidden items-center gap-2">
            <span className="font-tech text-xs text-[#CBD5E1] truncate max-w-[120px]">
              👤 {session.playerName}
            </span>
          </div>
        </div>

        {/* CENTER STATS: TIMER, SCORE, PROGRESS */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          {/* Prominent 5-Minute Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 font-tech font-extrabold text-lg sm:text-xl tracking-widest ${timerBoxStyle}`}
          >
            <Timer size={20} className={secondsRemaining <= 15 ? 'animate-spin' : ''} />
            <span>{timerStr}</span>
          </div>

          {/* Score Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#002D28] border border-[#D6B56D]/60 shadow-[0_0_12px_rgba(214,181,109,0.25)]">
            <Award size={18} className="text-[#D6B56D]" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-tech text-[#D6B56D] font-bold leading-none uppercase">SKOR</span>
              <span className="font-tech font-bold text-sm sm:text-base text-white leading-none">
                {session.score.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Correct / Wrong Counters */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#00201C] border border-[#31524D]">
            <div className="flex items-center gap-1 text-[#34D399] font-tech font-bold text-xs">
              <CheckCircle2 size={15} />
              <span>{correctCount}</span>
            </div>
            <span className="text-[#31524D]">|</span>
            <div className="flex items-center gap-1 text-[#F87171] font-tech font-bold text-xs">
              <XCircle size={15} />
              <span>{wrongCount}</span>
            </div>
          </div>

          {/* Progress (X / 50) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#00201C] border border-[#31524D] text-xs font-tech">
            <span className="text-[#94A3B8]">PROGRES:</span>
            <span className="text-[#00D9FF] font-bold">
              {answeredCount}/{totalQuestions}
            </span>
          </div>
        </div>

        {/* RIGHT ACTIONS: SOUND, LEADERBOARD, RULES */}
        <div className="flex items-center gap-2">
          {session.roomCode && (
            <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#002521] border border-[#00D9FF]/40 text-[#00D9FF] text-xs font-tech font-bold">
              ROOM: {session.roomCode}
            </span>
          )}

          <button
            onClick={onOpenLeaderboard}
            className="p-2 rounded-lg bg-[#002D28] hover:bg-[#004740] border border-[#D6B56D]/50 text-[#D6B56D] hover:text-white transition-all shadow-sm"
            title="Papan Peringkat"
          >
            <Trophy size={17} />
          </button>

          <button
            onClick={onOpenRules}
            className="p-2 rounded-lg bg-[#002D28] hover:bg-[#004740] border border-[#31524D] text-[#CBD5E1] hover:text-[#00D9FF] transition-all shadow-sm"
            title="Aturan Permainan"
          >
            <BookOpen size={17} />
          </button>

          <button
            onClick={handleToggleSound}
            className="p-2 rounded-lg bg-[#002D28] hover:bg-[#004740] border border-[#31524D] text-[#CBD5E1] hover:text-[#00D9FF] transition-all shadow-sm"
            title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
          >
            {isMuted ? <VolumeX size={17} className="text-[#EF4444]" /> : <Volume2 size={17} className="text-[#34D399]" />}
          </button>

          {onOpenHostDashboard && (
            <button
              onClick={onOpenHostDashboard}
              className="px-2.5 py-1.5 rounded-lg bg-[#003831] hover:bg-[#004740] border border-[#00D9FF]/40 text-[#00D9FF] text-xs font-tech font-bold transition-all"
            >
              Host
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
