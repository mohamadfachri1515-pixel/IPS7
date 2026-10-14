import React from 'react';
import { Question, CardStatus, UserAnswerRecord } from '../types';
import { Check, X, Sparkles, Award } from 'lucide-react';

interface CardVisualProps {
  question: Question;
  status: CardStatus;
  userAnswer?: UserAnswerRecord;
  isActive?: boolean;
  isCompact?: boolean;
  onClick?: () => void;
  showStatement?: boolean;
  dragTargetSlot?: React.ReactNode;
}

export const CardVisual: React.FC<CardVisualProps> = ({
  question,
  status,
  userAnswer,
  isActive = false,
  isCompact = false,
  onClick,
  showStatement = true,
  dragTargetSlot
}) => {
  const cardNumStr = question.cardNumber < 10 ? `0${question.cardNumber}` : `${question.cardNumber}`;

  // Border & Glow based on status
  let borderClasses = 'border-[#5A736E] hover:border-[#00D9FF] shadow-[0_4px_20px_rgba(0,0,0,0.8)]';
  let badgeColor = 'border-[#00D9FF]/60 text-[#00D9FF] shadow-[0_0_10px_rgba(0,217,255,0.3)]';
  let gemColor = 'bg-[#00D9FF] shadow-[0_0_12px_#00D9FF]';

  if (status === 'correct') {
    borderClasses = 'border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.45)] ring-1 ring-[#10B981]';
    badgeColor = 'border-[#10B981] text-[#34D399] shadow-[0_0_12px_rgba(16,185,129,0.5)]';
    gemColor = 'bg-[#10B981] shadow-[0_0_14px_#10B981]';
  } else if (status === 'wrong') {
    borderClasses = 'border-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.45)] ring-1 ring-[#EF4444]';
    badgeColor = 'border-[#EF4444] text-[#F87171] shadow-[0_0_12px_rgba(239,68,68,0.5)]';
    gemColor = 'bg-[#EF4444] shadow-[0_0_14px_#EF4444]';
  } else if (status === 'skipped') {
    borderClasses = 'border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.3)]';
    badgeColor = 'border-[#F59E0B] text-[#FBBF24]';
    gemColor = 'bg-[#F59E0B] shadow-[0_0_10px_#F59E0B]';
  } else if (isActive) {
    borderClasses = 'border-[#00D9FF] shadow-[0_0_25px_rgba(0,217,255,0.6)] ring-2 ring-[#00D9FF]/70';
  }

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative select-none transition-all duration-200 group flex flex-col justify-between ${
        onClick ? 'cursor-pointer active:scale-[0.98]' : ''
      } ${
        isCompact
          ? 'w-full aspect-[3/4.4] min-h-[160px] p-2.5 rounded-lg'
          : 'w-full max-w-xl min-h-[460px] p-5 sm:p-7 rounded-xl'
      } bg-[#002D28] border-2 ${borderClasses} bg-gradient-to-b from-[#003832] via-[#002824] to-[#001715]`}
    >
      {/* Fantasy Corner Filigree Brackets */}
      <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#D6B56D]/80 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#D6B56D]/80 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#D6B56D]/80 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#D6B56D]/80 rounded-br-sm pointer-events-none" />

      {/* Outer Metallic Bevel Line */}
      <div className="absolute inset-[3px] border border-[#CBD5E1]/20 rounded-md pointer-events-none" />

      {/* TOP HEADER SECTION */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Title Logo with Cyan Wing Ornaments */}
        <div className="relative flex items-center justify-center gap-1.5 w-full">
          {/* Left Wing Icon Motif */}
          <div className="w-3 sm:w-6 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-[#D6B56D]" />
          
          <div className="flex items-center gap-1">
            <span
              className={`font-title font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#E2E8F0] to-[#94A3B8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
                isCompact ? 'text-[10px] leading-tight' : 'text-sm sm:text-base tracking-widest'
              }`}
            >
              CLASH OF
            </span>
            <span
              className={`font-title font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#FFEAA7] via-[#D6B56D] to-[#8C6D2D] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
                isCompact ? 'text-[10px] leading-tight' : 'text-sm sm:text-base tracking-widest'
              }`}
            >
              CHAMPIONS
            </span>
          </div>

          {/* Right Wing Icon Motif */}
          <div className="w-3 sm:w-6 h-[2px] bg-gradient-to-l from-transparent via-[#00D9FF] to-[#D6B56D]" />
        </div>

        {/* Card Number Badge */}
        <div
          className={`mt-1.5 px-2.5 py-0.5 rounded-full border bg-[#001D1A]/90 font-tech font-bold uppercase ${badgeColor} ${
            isCompact ? 'text-[9px] tracking-normal' : 'text-xs sm:text-sm tracking-wider'
          }`}
        >
          KARTU #{cardNumStr}
        </div>

        {/* Level and Points Label */}
        <div
          className={`mt-1 font-tech font-semibold tracking-wider text-[#D6B56D] flex items-center justify-center gap-1.5 ${
            isCompact ? 'text-[8.5px]' : 'text-xs sm:text-sm'
          }`}
        >
          <span>LEVEL {question.level}</span>
          <span className="text-[#00D9FF]/70">|</span>
          <span className="text-[#F5F2E8] font-bold">{question.points} POIN</span>
        </div>
      </div>

      {/* INNER CONTENT AREA */}
      <div
        className={`relative z-10 flex-1 my-2 flex flex-col justify-center items-center text-center rounded-lg border border-[#31524D]/60 bg-[#00201C]/85 backdrop-blur-sm overflow-hidden ${
          isCompact ? 'p-1.5' : 'p-4 sm:p-5'
        }`}
      >
        {/* Subtle background tech grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#00D9FF_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />

        {isCompact ? (
          // Compact Grid View
          <div className="flex flex-col items-center justify-center h-full w-full">
            {status === 'correct' ? (
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-[#10B981]/20 border border-[#10B981] flex items-center justify-center text-[#10B981]">
                  <Check size={16} strokeWidth={3} />
                </div>
                <span className="text-[9px] font-tech font-bold text-[#10B981]">+{question.points} PTS</span>
              </div>
            ) : status === 'wrong' ? (
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-[#EF4444]/20 border border-[#EF4444] flex items-center justify-center text-[#EF4444]">
                  <X size={16} strokeWidth={3} />
                </div>
                <span className="text-[9px] font-tech font-bold text-[#EF4444]">0 PTS</span>
              </div>
            ) : status === 'skipped' ? (
              <div className="flex flex-col items-center gap-1">
                <div className="px-2 py-0.5 rounded text-[8.5px] font-tech text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/40">
                  LEWAT
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-[#94A3B8] group-hover:text-[#00D9FF] transition-colors">
                <Sparkles size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="text-[8px] font-tech mt-1 text-[#CBD5E1]/70 line-clamp-2 px-1">
                  {question.topicTitle}
                </span>
              </div>
            )}
          </div>
        ) : (
          // Full Arena Mode View
          <div className="flex flex-col justify-between h-full w-full gap-3">
            {/* Topic pill */}
            <div className="inline-flex items-center justify-center gap-1 px-3 py-1 self-center rounded-full bg-[#001412] border border-[#00D9FF]/30 text-[#00D9FF] text-xs font-tech font-medium tracking-wide">
              <Award size={12} />
              <span>{question.topicTitle}</span>
            </div>

            {/* Main Statement */}
            {showStatement && (
              <div className="my-auto py-2">
                <p className="text-sm sm:text-base leading-relaxed text-[#F5F2E8] font-normal tracking-wide drop-shadow">
                  "{question.statement}"
                </p>
                {question.historicalNote && (
                  <p className="mt-2 text-[11px] sm:text-xs text-[#D6B56D]/80 italic">
                    ℹ️ {question.historicalNote}
                  </p>
                )}
              </div>
            )}

            {/* Target Drop/Match Slot */}
            {dragTargetSlot && (
              <div className="w-full mt-2">
                {dragTargetSlot}
              </div>
            )}

            {/* Answered Status Feedback in Arena */}
            {userAnswer && (
              <div
                className={`w-full p-2.5 rounded-lg border text-xs sm:text-sm font-medium flex items-center justify-center gap-2 ${
                  userAnswer.isCorrect
                    ? 'bg-[#10B981]/15 border-[#10B981] text-[#34D399]'
                    : 'bg-[#EF4444]/15 border-[#EF4444] text-[#F87171]'
                }`}
              >
                {userAnswer.isCorrect ? <Check size={16} /> : <X size={16} />}
                <span>
                  {userAnswer.isCorrect
                    ? `Benar: ${userAnswer.selectedAnswerText} (+${userAnswer.pointsEarned} Poin)`
                    : `Jawaban: ${userAnswer.selectedAnswerText} (Salah)`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM GEMSTONE ORNAMENT */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Metal prongs */}
        <div className="w-4 h-[1px] bg-gradient-to-r from-transparent to-[#D6B56D]" />
        <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-white/60 ${gemColor} transform rotate-45 transition-colors`} />
        <div className="w-4 h-[1px] bg-gradient-to-l from-transparent to-[#D6B56D]" />
      </div>
    </div>
  );
};
