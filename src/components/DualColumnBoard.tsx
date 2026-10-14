import React, { useState, useMemo } from 'react';
import { Question, UserAnswerRecord } from '../types';
import { sound } from '../services/sound';
import { Check, X, Sparkles, Layers, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DualColumnBoardProps {
  questions: Question[];
  answers: Record<number, UserAnswerRecord>;
  onSubmitAnswer: (
    questionId: number,
    selectedAnswerId: string,
    selectedAnswerText: string
  ) => void;
  onOpenArenaCard: (id: number) => void;
}

export const DualColumnBoard: React.FC<DualColumnBoardProps> = ({
  questions,
  answers,
  onSubmitAnswer,
  onOpenArenaCard
}) => {
  // Set filter by level to keep matching clean and responsive
  const [activeLevelTab, setActiveLevelTab] = useState<1 | 2 | 3>(1);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  // Staged pairings before submission: { questionId: answerId }
  const [stagedPairings, setStagedPairings] = useState<Record<number, { id: string; text: string }>>({});

  // Filter questions for current level tab
  const tabQuestions = useMemo(() => {
    return questions.filter(q => q.level === activeLevelTab);
  }, [questions, activeLevelTab]);

  // Scrambled answers for the current level
  const tabAnswers = useMemo(() => {
    const list = tabQuestions.map(q => ({
      id: q.correctAnswerId,
      text: q.correctAnswerText,
      questionId: q.id
    }));
    // Fisher-Yates shuffle
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, [activeLevelTab, tabQuestions]);

  // Handle clicking on question (left)
  const handleSelectQuestion = (qId: number) => {
    if (answers[qId]) return; // already locked
    sound.playClick();
    setSelectedQuestionId(qId);

    // If an answer was already selected on right, pair them!
    if (selectedAnswerId) {
      const foundAns = tabAnswers.find(a => a.id === selectedAnswerId);
      if (foundAns) {
        setStagedPairings(prev => ({
          ...prev,
          [qId]: { id: foundAns.id, text: foundAns.text }
        }));
        sound.playSnap();
        setSelectedQuestionId(null);
        setSelectedAnswerId(null);
      }
    }
  };

  // Handle clicking on answer (right)
  const handleSelectAnswer = (ans: { id: string; text: string }) => {
    sound.playClick();
    setSelectedAnswerId(ans.id);

    // If a question was already selected on left, pair them!
    if (selectedQuestionId !== null) {
      setStagedPairings(prev => ({
        ...prev,
        [selectedQuestionId]: { id: ans.id, text: ans.text }
      }));
      sound.playSnap();
      setSelectedQuestionId(null);
      setSelectedAnswerId(null);
    }
  };

  // Drag and drop support
  const handleDragStart = (e: React.DragEvent, ans: { id: string; text: string }) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(ans));
  };

  const handleDropOnQuestion = (e: React.DragEvent, qId: number) => {
    if (answers[qId]) return;
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (dataStr) {
        const ans = JSON.parse(dataStr) as { id: string; text: string };
        setStagedPairings(prev => ({
          ...prev,
          [qId]: { id: ans.id, text: ans.text }
        }));
        sound.playSnap();
      }
    } catch {}
  };

  // Submit single staged pair
  const handleEvaluatePair = (qId: number) => {
    const pair = stagedPairings[qId];
    if (!pair) return;
    const q = questions.find(item => item.id === qId);
    if (!q) return;

    const isCorrect = pair.id === q.correctAnswerId;
    if (isCorrect) {
      sound.playCorrect();
      confetti({ particleCount: 30, spread: 50 });
    } else {
      sound.playWrong();
    }

    onSubmitAnswer(qId, pair.id, pair.text);
    // remove from staged
    setStagedPairings(prev => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  // Batch submit all staged pairs
  const handleEvaluateAllStaged = () => {
    const qIds = Object.keys(stagedPairings).map(Number);
    if (qIds.length === 0) return;

    let hasCorrect = false;
    qIds.forEach(qId => {
      const pair = stagedPairings[qId];
      const q = questions.find(item => item.id === qId);
      if (pair && q) {
        if (pair.id === q.correctAnswerId) hasCorrect = true;
        onSubmitAnswer(qId, pair.id, pair.text);
      }
    });

    if (hasCorrect) {
      sound.playCorrect();
      confetti({ particleCount: 50, spread: 70 });
    } else {
      sound.playWrong();
    }

    setStagedPairings({});
  };

  const stagedCount = Object.keys(stagedPairings).length;

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Level Tabs */}
      <div className="bg-[#00201C] p-4 rounded-xl border border-[#31524D] shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-title font-bold text-base sm:text-lg text-[#D6B56D] flex items-center gap-2">
            <Layers className="text-[#00D9FF]" size={20} />
            PAPAN MENJODOHKAN DUA KOLOM
          </h2>
          <p className="text-xs text-[#CBD5E1] mt-0.5">
            Klik pernyataan di Kolom Kiri, lalu klik jawaban yang cocok di Kolom Kanan (atau gunakan Drag & Drop)
          </p>
        </div>

        {/* Level Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveLevelTab(1);
              setSelectedQuestionId(null);
              setSelectedAnswerId(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-tech font-bold text-xs sm:text-sm transition-all ${
              activeLevelTab === 1
                ? 'bg-[#00D9FF] text-black shadow-[0_0_15px_#00D9FF]'
                : 'bg-[#002D28] text-[#D6B56D] hover:bg-[#004740]'
            }`}
          >
            LEVEL 1 (100 PTS)
          </button>
          <button
            onClick={() => {
              setActiveLevelTab(2);
              setSelectedQuestionId(null);
              setSelectedAnswerId(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-tech font-bold text-xs sm:text-sm transition-all ${
              activeLevelTab === 2
                ? 'bg-[#00D9FF] text-black shadow-[0_0_15px_#00D9FF]'
                : 'bg-[#002D28] text-[#D6B56D] hover:bg-[#004740]'
            }`}
          >
            LEVEL 2 (200 PTS)
          </button>
          <button
            onClick={() => {
              setActiveLevelTab(3);
              setSelectedQuestionId(null);
              setSelectedAnswerId(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-tech font-bold text-xs sm:text-sm transition-all ${
              activeLevelTab === 3
                ? 'bg-[#00D9FF] text-black shadow-[0_0_15px_#00D9FF]'
                : 'bg-[#002D28] text-[#D6B56D] hover:bg-[#004740]'
            }`}
          >
            LEVEL 3 (240 PTS)
          </button>
        </div>
      </div>

      {/* Floating Batch Submit Toolbar if any staged */}
      {stagedCount > 0 && (
        <div className="sticky top-20 z-20 bg-[#003831] border-2 border-[#00D9FF] p-3 rounded-xl shadow-[0_0_20px_rgba(0,217,255,0.4)] flex items-center justify-between gap-4 animate-pulse">
          <span className="font-tech text-xs sm:text-sm text-white font-bold">
            ⚡ {stagedCount} Pasangan siap dinilai!
          </span>
          <button
            onClick={handleEvaluateAllStaged}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00D9FF] to-[#0891B2] text-black font-tech font-bold text-xs sm:text-sm tracking-wider uppercase shadow hover:scale-105 transition-all"
          >
            Periksa Semua ({stagedCount})
          </button>
        </div>
      )}

      {/* Dual Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* KOLOM KIRI: PERNYATAAN (7 Cols) */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#31524D]">
            <span className="font-tech font-bold text-xs sm:text-sm text-[#00D9FF] uppercase tracking-wider">
              KOLOM KIRI: PERNYATAAN / PERTANYAAN ({tabQuestions.length} SOAL)
            </span>
            <span className="text-[11px] text-[#94A3B8]">Pilih kartu</span>
          </div>

          <div className="space-y-3">
            {tabQuestions.map((q) => {
              const ans = answers[q.id];
              const staged = stagedPairings[q.id];
              const isSelected = selectedQuestionId === q.id;

              let border = 'border-[#31524D] bg-[#002521] hover:border-[#00D9FF]/70';
              if (ans?.isCorrect) {
                border = 'border-[#10B981] bg-[#10B981]/10';
              } else if (ans && !ans.isCorrect) {
                border = 'border-[#EF4444] bg-[#EF4444]/10';
              } else if (isSelected) {
                border = 'border-[#00D9FF] bg-[#003831] ring-2 ring-[#00D9FF] shadow-[0_0_15px_rgba(0,217,255,0.4)]';
              } else if (staged) {
                border = 'border-[#D6B56D] bg-[#002D28] shadow-[0_0_12px_rgba(214,181,109,0.3)]';
              }

              return (
                <div
                  key={q.id}
                  onClick={() => handleSelectQuestion(q.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnQuestion(e, q.id)}
                  className={`p-4 rounded-xl border transition-all ${
                    ans ? 'opacity-90' : 'cursor-pointer active:scale-[0.99]'
                  } ${border}`}
                >
                  {/* Card Header inside statement */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-tech font-bold text-xs bg-[#001412] text-[#00D9FF] border border-[#00D9FF]/40">
                        KARTU #{q.cardNumber < 10 ? `0${q.cardNumber}` : q.cardNumber}
                      </span>
                      <span className="text-[11px] font-tech text-[#D6B56D]">
                        {q.points} POIN
                      </span>
                    </div>

                    {ans ? (
                      <span
                        className={`text-xs font-tech font-bold flex items-center gap-1 ${
                          ans.isCorrect ? 'text-[#34D399]' : 'text-[#F87171]'
                        }`}
                      >
                        {ans.isCorrect ? <Check size={14} /> : <X size={14} />}
                        {ans.isCorrect ? `+${ans.pointsEarned} POIN` : '0 POIN'}
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenArenaCard(q.id);
                        }}
                        className="text-[10px] font-tech text-[#CBD5E1] hover:text-[#00D9FF] underline"
                      >
                        Buka di Arena
                      </button>
                    )}
                  </div>

                  {/* Statement */}
                  <p className="text-xs sm:text-sm text-[#F5F2E8] leading-relaxed">
                    "{q.statement}"
                  </p>

                  {/* Paired display or Staged display */}
                  {staged && !ans && (
                    <div className="mt-3 pt-2.5 border-t border-[#31524D] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs text-[#00D9FF]">
                        <span className="font-tech font-bold">Pasangan:</span>
                        <span className="font-semibold text-white">{staged.text}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEvaluatePair(q.id);
                          }}
                          className="px-2.5 py-1 rounded bg-[#00D9FF] hover:bg-[#38bdf8] text-black font-tech font-bold text-xs uppercase"
                        >
                          Periksa
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setStagedPairings(prev => {
                              const next = { ...prev };
                              delete next[q.id];
                              return next;
                            });
                          }}
                          className="px-1.5 py-1 text-xs text-[#94A3B8] hover:text-[#EF4444]"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {ans && (
                    <div className="mt-2 text-xs text-[#CBD5E1] flex items-center gap-1.5">
                      <span className="font-tech text-[#D6B56D]">Kunci:</span>
                      <span className="font-semibold">{q.correctAnswerText}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* KOLOM KANAN: PILIHAN JAWABAN ACAK (5 Cols) */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#31524D]">
            <span className="font-tech font-bold text-xs sm:text-sm text-[#D6B56D] uppercase tracking-wider">
              KOLOM KANAN: PILIHAN JAWABAN ({tabAnswers.length})
            </span>
            <span className="text-[11px] text-[#94A3B8]">Klik atau Seret</span>
          </div>

          <div className="space-y-2 sticky top-24">
            {tabAnswers.map((ans) => {
              const isSelected = selectedAnswerId === ans.id;

              return (
                <div
                  key={ans.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, ans)}
                  onClick={() => handleSelectAnswer(ans)}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-tech font-semibold tracking-wide transition-all cursor-grab active:cursor-grabbing select-none flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#00473E] border-[#00D9FF] text-white shadow-[0_0_15px_rgba(0,217,255,0.4)]'
                      : 'bg-[#002D28] border-[#31524D] text-[#F5F2E8] hover:border-[#D6B56D] hover:bg-[#003831]'
                  }`}
                >
                  <span>{ans.text}</span>
                  <div className="w-2 h-2 rounded-full border border-[#D6B56D] bg-[#001D1A]" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
