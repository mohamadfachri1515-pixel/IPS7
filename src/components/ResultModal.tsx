import React, { useState } from 'react';
import { GameSession, Question } from '../types';
import { Trophy, CheckCircle, XCircle, Clock, RotateCcw, Home, HelpCircle, Award, Sparkles } from 'lucide-react';

interface ResultModalProps {
  session: GameSession;
  questions: Question[];
  onPlayAgain: () => void;
  onGoHome: () => void;
  onOpenLeaderboard: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  session,
  questions,
  onPlayAgain,
  onGoHome,
  onOpenLeaderboard
}) => {
  const [filterReview, setFilterReview] = useState<'all' | 'wrong' | 'unanswered'>('all');

  const answeredList = Object.values(session.answers);
  const correctCount = answeredList.filter(a => a.isCorrect).length;
  const wrongCount = answeredList.filter(a => !a.isCorrect).length;
  const unansweredCount = questions.length - answeredList.length;
  const accuracy = answeredList.length > 0 ? Math.round((correctCount / answeredList.length) * 100) : 0;

  const durationSec = Math.min(session.durationSeconds, Math.floor((Math.min(Date.now(), session.endTime) - session.startTime) / 1000));
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const filteredQuestions = questions.filter(q => {
    const ans = session.answers[q.id];
    if (filterReview === 'all') return true;
    if (filterReview === 'wrong') return ans && !ans.isCorrect;
    if (filterReview === 'unanswered') return !ans;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#00201C] border-2 border-[#D6B56D] rounded-2xl max-w-4xl w-full p-5 sm:p-8 shadow-[0_0_50px_rgba(214,181,109,0.4)] relative flex flex-col max-h-[95vh]">
        {/* Title & Celebration */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-[#31524D]">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D6B56D] via-[#F5E5BE] to-[#9B7E3E] p-1 flex items-center justify-center shadow-[0_0_25px_#D6B56D] mb-2">
            <Trophy className="text-black" size={32} />
          </div>
          <h2 className="font-title font-black text-xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F5E5BE] to-[#D6B56D]">
            TANTANGAN SELESAI!
          </h2>
          <p className="text-xs sm:text-sm text-[#00D9FF] font-tech font-bold uppercase tracking-wider mt-1">
            {session.finishReason === 'time_up'
              ? 'Waktu 05:00 Habis! Skor Anda Telah Dikunci'
              : session.finishReason === 'all_completed'
              ? 'Luar Biasa! Semua 50 Kartu Berhasil Diselesaikan'
              : 'Sesi Tantangan Ditutup'}
          </p>
          <span className="text-xs text-[#CBD5E1] mt-0.5">Peserta: <b className="text-white">{session.playerName}</b></span>
        </div>

        {/* Score & Key Metrics Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="bg-[#002D28] border border-[#D6B56D]/60 p-3.5 rounded-xl flex flex-col items-center text-center shadow">
            <Award className="text-[#D6B56D] mb-1" size={20} />
            <span className="text-[10px] font-tech text-[#D6B56D] uppercase font-bold">TOTAL SKOR</span>
            <span className="font-tech font-black text-2xl text-white">
              {session.score.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-[#CBD5E1]">dari 10.000 poin</span>
          </div>

          <div className="bg-[#002D28] border border-[#10B981]/60 p-3.5 rounded-xl flex flex-col items-center text-center shadow">
            <CheckCircle className="text-[#10B981] mb-1" size={20} />
            <span className="text-[10px] font-tech text-[#34D399] uppercase font-bold">BENAR</span>
            <span className="font-tech font-black text-2xl text-[#34D399]">
              {correctCount}
            </span>
            <span className="text-[10px] text-[#CBD5E1]">{accuracy}% Akurasi</span>
          </div>

          <div className="bg-[#002D28] border border-[#EF4444]/60 p-3.5 rounded-xl flex flex-col items-center text-center shadow">
            <XCircle className="text-[#EF4444] mb-1" size={20} />
            <span className="text-[10px] font-tech text-[#F87171] uppercase font-bold">SALAH / LEWAT</span>
            <span className="font-tech font-black text-2xl text-[#F87171]">
              {wrongCount} / {unansweredCount}
            </span>
            <span className="text-[10px] text-[#CBD5E1]">total {questions.length} kartu</span>
          </div>

          <div className="bg-[#002D28] border border-[#00D9FF]/60 p-3.5 rounded-xl flex flex-col items-center text-center shadow">
            <Clock className="text-[#00D9FF] mb-1" size={20} />
            <span className="text-[10px] font-tech text-[#00D9FF] uppercase font-bold">WAKTU</span>
            <span className="font-tech font-black text-2xl text-white">
              {timeFormatted}
            </span>
            <span className="text-[10px] text-[#CBD5E1]">dari 05:00</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2.5 flex-wrap my-2">
          <button
            onClick={onOpenLeaderboard}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D6B56D] to-[#B38F44] text-black font-tech font-extrabold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(214,181,109,0.4)] hover:scale-105 transition-all"
          >
            <Trophy size={16} /> Lihat Papan Peringkat
          </button>
          <button
            onClick={onPlayAgain}
            className="px-4 py-2.5 rounded-xl bg-[#00D9FF] hover:bg-[#38bdf8] text-black font-tech font-extrabold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,217,255,0.4)] hover:scale-105 transition-all"
          >
            <RotateCcw size={16} /> Main Lagi (Sesi Baru)
          </button>
          <button
            onClick={onGoHome}
            className="px-4 py-2.5 rounded-xl bg-[#002D28] hover:bg-[#004740] border border-[#31524D] text-[#CBD5E1] hover:text-white font-tech font-bold text-xs sm:text-sm uppercase flex items-center gap-1.5 transition-all"
          >
            <Home size={16} /> Kembali ke Beranda
          </button>
        </div>

        {/* REVIEW OF ALL 50 QUESTIONS */}
        <div className="mt-4 pt-3 border-t border-[#31524D] flex-1 overflow-y-auto pr-1">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <h3 className="font-tech font-bold text-sm text-[#D6B56D] uppercase flex items-center gap-1.5">
              <Sparkles size={16} /> Evaluasi & Pembahasan Edukasi Soal
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-tech">
              <button
                onClick={() => setFilterReview('all')}
                className={`px-2.5 py-1 rounded transition-all ${
                  filterReview === 'all' ? 'bg-[#00D9FF] text-black font-bold' : 'bg-[#002D28] text-[#CBD5E1]'
                }`}
              >
                Semua ({questions.length})
              </button>
              <button
                onClick={() => setFilterReview('wrong')}
                className={`px-2.5 py-1 rounded transition-all ${
                  filterReview === 'wrong' ? 'bg-[#EF4444] text-white font-bold' : 'bg-[#002D28] text-[#F87171]'
                }`}
              >
                Salah ({wrongCount})
              </button>
              <button
                onClick={() => setFilterReview('unanswered')}
                className={`px-2.5 py-1 rounded transition-all ${
                  filterReview === 'unanswered' ? 'bg-[#F59E0B] text-black font-bold' : 'bg-[#002D28] text-[#FBBF24]'
                }`}
              >
                Belum Dijawab ({unansweredCount})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredQuestions.map((q) => {
              const ans = session.answers[q.id];
              const isCorrect = ans?.isCorrect === true;
              const isWrong = ans && !ans.isCorrect;
              const isUnanswered = !ans;

              return (
                <div
                  key={q.id}
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm transition-all ${
                    isCorrect
                      ? 'border-[#10B981]/50 bg-[#10B981]/5'
                      : isWrong
                      ? 'border-[#EF4444]/60 bg-[#EF4444]/5'
                      : 'border-[#31524D] bg-[#001D1A]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-tech font-bold text-xs text-[#00D9FF]">
                      KARTU #{q.cardNumber < 10 ? `0${q.cardNumber}` : q.cardNumber} • LEVEL {q.level} ({q.points} POIN)
                    </span>
                    <span
                      className={`font-tech font-bold text-xs flex items-center gap-1 ${
                        isCorrect ? 'text-[#34D399]' : isWrong ? 'text-[#F87171]' : 'text-[#94A3B8]'
                      }`}
                    >
                      {isCorrect ? '✓ Benar' : isWrong ? '✕ Salah' : '○ Belum Dijawab'}
                    </span>
                  </div>

                  <p className="text-[#F5F2E8] italic">"{q.statement}"</p>

                  <div className="mt-2 pt-2 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {ans && (
                      <div>
                        <span className="text-[#94A3B8]">Jawaban Anda: </span>
                        <b className={isCorrect ? 'text-[#34D399]' : 'text-[#F87171]'}>
                          {ans.selectedAnswerText}
                        </b>
                      </div>
                    )}
                    <div>
                      <span className="text-[#94A3B8]">Kunci Benar: </span>
                      <b className="text-[#34D399]">{q.correctAnswerText}</b>
                    </div>
                  </div>

                  <p className="text-[#CBD5E1] text-[11px] sm:text-xs mt-2 bg-[#001815] p-2.5 rounded border border-[#31524D]/40 leading-relaxed">
                    💡 <b>Penjelasan:</b> {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
