import React, { useState } from 'react';
import { Question, CardStatus, UserAnswerRecord } from '../types';
import { CardVisual } from './CardVisual';
import { Filter, Layers, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface CardGridProps {
  questions: Question[];
  answers: Record<number, UserAnswerRecord>;
  currentCardId: number;
  onSelectCard: (id: number) => void;
}

export const CardGrid: React.FC<CardGridProps> = ({
  questions,
  answers,
  currentCardId,
  onSelectCard
}) => {
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unanswered' | 'correct' | 'wrong'>('all');

  const filteredQuestions = questions.filter(q => {
    if (filterLevel !== 'all' && q.level !== filterLevel) return false;
    const ans = answers[q.id];
    if (filterStatus === 'all') return true;
    if (filterStatus === 'unanswered') return !ans;
    if (filterStatus === 'correct') return ans?.isCorrect === true;
    if (filterStatus === 'wrong') return ans?.isCorrect === false;
    return true;
  });

  return (
    <div className="w-full space-y-4">
      {/* Filter and Stats Bar */}
      <div className="bg-[#00201C]/90 p-3.5 rounded-xl border border-[#31524D] shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Level Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#D6B56D] font-tech font-bold uppercase flex items-center gap-1 mr-1">
            <Layers size={14} /> Level:
          </span>
          <button
            onClick={() => setFilterLevel('all')}
            className={`px-2.5 py-1 rounded font-tech font-bold transition-all ${
              filterLevel === 'all'
                ? 'bg-[#00D9FF] text-black shadow-[0_0_10px_#00D9FF]'
                : 'bg-[#002D28] text-[#F5F2E8] hover:bg-[#004740]'
            }`}
          >
            SEMUA (50)
          </button>
          <button
            onClick={() => setFilterLevel(1)}
            className={`px-2.5 py-1 rounded font-tech font-bold transition-all ${
              filterLevel === 1
                ? 'bg-[#00D9FF] text-black shadow-[0_0_10px_#00D9FF]'
                : 'bg-[#002D28] text-[#D6B56D] hover:bg-[#004740]'
            }`}
          >
            L1 (100 PTS)
          </button>
          <button
            onClick={() => setFilterLevel(2)}
            className={`px-2.5 py-1 rounded font-tech font-bold transition-all ${
              filterLevel === 2
                ? 'bg-[#00D9FF] text-black shadow-[0_0_10px_#00D9FF]'
                : 'bg-[#002D28] text-[#D6B56D] hover:bg-[#004740]'
            }`}
          >
            L2 (200 PTS)
          </button>
          <button
            onClick={() => setFilterLevel(3)}
            className={`px-2.5 py-1 rounded font-tech font-bold transition-all ${
              filterLevel === 3
                ? 'bg-[#00D9FF] text-black shadow-[0_0_10px_#00D9FF]'
                : 'bg-[#002D28] text-[#D6B56D] hover:bg-[#004740]'
            }`}
          >
            L3 (240 PTS)
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#D6B56D] font-tech font-bold uppercase flex items-center gap-1 mr-1">
            <Filter size={14} /> Status:
          </span>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 rounded font-tech font-bold transition-all ${
              filterStatus === 'all' ? 'bg-[#00D9FF] text-black' : 'bg-[#002D28] text-[#F5F2E8]'
            }`}
          >
            SEMUA
          </button>
          <button
            onClick={() => setFilterStatus('unanswered')}
            className={`px-2.5 py-1 rounded font-tech font-bold flex items-center gap-1 transition-all ${
              filterStatus === 'unanswered' ? 'bg-[#00D9FF] text-black' : 'bg-[#002D28] text-[#94A3B8]'
            }`}
          >
            <Clock size={12} /> Belum
          </button>
          <button
            onClick={() => setFilterStatus('correct')}
            className={`px-2.5 py-1 rounded font-tech font-bold flex items-center gap-1 transition-all ${
              filterStatus === 'correct' ? 'bg-[#10B981] text-black' : 'bg-[#002D28] text-[#34D399]'
            }`}
          >
            <CheckCircle2 size={12} /> Benar
          </button>
          <button
            onClick={() => setFilterStatus('wrong')}
            className={`px-2.5 py-1 rounded font-tech font-bold flex items-center gap-1 transition-all ${
              filterStatus === 'wrong' ? 'bg-[#EF4444] text-white' : 'bg-[#002D28] text-[#F87171]'
            }`}
          >
            <XCircle size={12} /> Salah
          </button>
        </div>
      </div>

      {/* 5-Column Grid conforming directly to GAMBAR TEMPLATE.png */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 p-1">
        {filteredQuestions.map((q) => {
          const ans = answers[q.id];
          const status: CardStatus = !ans ? 'unanswered' : ans.isCorrect ? 'correct' : 'wrong';
          const isActive = q.id === currentCardId;

          return (
            <CardVisual
              key={q.id}
              question={q}
              status={status}
              userAnswer={ans}
              isActive={isActive}
              isCompact={true}
              onClick={() => onSelectCard(q.id)}
            />
          );
        })}
      </div>
    </div>
  );
};
