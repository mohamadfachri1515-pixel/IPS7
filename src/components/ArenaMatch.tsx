import React, { useState, useMemo, useEffect } from 'react';
import { Question, CardStatus, UserAnswerRecord, AnswerChoice } from '../types';
import { CardVisual } from './CardVisual';
import { sound } from '../services/sound';
import { ALL_ANSWER_CHOICES } from '../data/questions';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  RotateCcw,
  Flag,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ArenaMatchProps {
  currentQuestion: Question;
  answers: Record<number, UserAnswerRecord>;
  allQuestions: Question[];
  onSelectCardId: (id: number) => void;
  onSubmitAnswer: (
    questionId: number,
    selectedAnswerId: string,
    selectedAnswerText: string
  ) => void;
  onFinishGame: () => void;
  onOpenCardGrid: () => void;
  onOpenDualBoard: () => void;
}

export const ArenaMatch: React.FC<ArenaMatchProps> = ({
  currentQuestion,
  answers,
  allQuestions,
  onSelectCardId,
  onSubmitAnswer,
  onFinishGame,
  onOpenCardGrid,
  onOpenDualBoard
}) => {
  const currentAnswer = answers[currentQuestion.id];
  const isCardAnswered = !!currentAnswer;

  // Staged selection before submitting
  const [selectedChoice, setSelectedChoice] = useState<AnswerChoice | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [showExplanationModal, setShowExplanationModal] = useState<boolean>(false);

  // Reset selected choice when switching questions
  useEffect(() => {
    setSelectedChoice(null);
    setShowExplanationModal(false);
  }, [currentQuestion.id]);

  // Generate randomized pool of choices for current question
  // Includes correct answer + 7 plausible distractors from same level or topic
  const answerPool = useMemo(() => {
    const correct: AnswerChoice = {
      id: currentQuestion.correctAnswerId,
      text: currentQuestion.correctAnswerText
    };

    // Distractors from same topic or level
    const candidates = ALL_ANSWER_CHOICES.filter(
      item => item.id !== currentQuestion.correctAnswerId
    );

    // Prefer candidates with same topic or same level
    const sortedCandidates = [...candidates].sort((a, b) => {
      const aMatches = (a.topic === currentQuestion.topic ? 2 : 0) + (a.level === currentQuestion.level ? 1 : 0);
      const bMatches = (b.topic === currentQuestion.topic ? 2 : 0) + (b.level === currentQuestion.level ? 1 : 0);
      return bMatches - aMatches + (Math.random() - 0.5);
    });

    const distractors = sortedCandidates.slice(0, 7).map(d => ({
      id: d.id,
      text: d.text
    }));

    const pool = [correct, ...distractors];
    // Deterministic shuffle using question ID as seed or standard Fisher-Yates
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }, [currentQuestion.id]);

  // Handling click on choice
  const handleSelectChoice = (choice: AnswerChoice) => {
    if (isCardAnswered) return;
    sound.playClick();
    setSelectedChoice(choice);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, choice: AnswerChoice) => {
    if (isCardAnswered) return;
    e.dataTransfer.setData('text/plain', JSON.stringify(choice));
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isCardAnswered) return;
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isCardAnswered) return;
    e.preventDefault();
    setIsDraggingOver(false);
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (dataStr) {
        const choice = JSON.parse(dataStr) as AnswerChoice;
        setSelectedChoice(choice);
        sound.playSnap();
      }
    } catch {}
  };

  // Submit Answer
  const handleCheckAnswer = () => {
    if (isCardAnswered) return;
    if (!selectedChoice) {
      sound.playWrong();
      alert('Pilih pasangan jawaban terlebih dahulu!');
      return;
    }

    const isCorrect = selectedChoice.id === currentQuestion.correctAnswerId;
    if (isCorrect) {
      sound.playCorrect();
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      sound.playWrong();
    }

    onSubmitAnswer(currentQuestion.id, selectedChoice.id, selectedChoice.text);
  };

  // Skip to next unanswered question
  const handleSkip = () => {
    sound.playClick();
    const unanswered = allQuestions.filter(q => !answers[q.id] && q.id !== currentQuestion.id);
    if (unanswered.length > 0) {
      // Find next in order
      const nextOne = unanswered.find(q => q.id > currentQuestion.id) || unanswered[0];
      onSelectCardId(nextOne.id);
    } else {
      // Move to next cyclic
      const nextId = currentQuestion.id < 50 ? currentQuestion.id + 1 : 1;
      onSelectCardId(nextId);
    }
  };

  const handlePrev = () => {
    sound.playClick();
    const prevId = currentQuestion.id > 1 ? currentQuestion.id - 1 : 50;
    onSelectCardId(prevId);
  };

  const handleNext = () => {
    sound.playClick();
    const nextId = currentQuestion.id < 50 ? currentQuestion.id + 1 : 1;
    onSelectCardId(nextId);
  };

  const status: CardStatus = !currentAnswer
    ? 'unanswered'
    : currentAnswer.isCorrect
    ? 'correct'
    : 'wrong';

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Top Navigation & Fast Actions */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#002D28] hover:bg-[#004740] border border-[#31524D] text-[#D6B56D] font-tech font-bold text-xs sm:text-sm transition-all"
          >
            <ChevronLeft size={16} /> Sebelumnya
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#002D28] hover:bg-[#004740] border border-[#31524D] text-[#D6B56D] font-tech font-bold text-xs sm:text-sm transition-all"
          >
            Selanjutnya <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCardGrid}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#002521] hover:bg-[#003B35] border border-[#00D9FF]/40 text-[#00D9FF] font-tech font-bold text-xs sm:text-sm transition-all"
          >
            <Layers size={15} /> Kisi 50 Kartu
          </button>
          <button
            onClick={onOpenDualBoard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#002521] hover:bg-[#003B35] border border-[#D6B56D]/40 text-[#D6B56D] font-tech font-bold text-xs sm:text-sm transition-all"
          >
            <Sparkles size={15} /> Papan Menjodohkan
          </button>
        </div>
      </div>

      {/* Main Dual Matching Stage */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Clash of Champions Fantasy Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center w-full">
          <CardVisual
            question={currentQuestion}
            status={status}
            userAnswer={currentAnswer}
            isActive={true}
            isCompact={false}
            dragTargetSlot={
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full min-h-[64px] p-2.5 rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center text-center ${
                  isDraggingOver
                    ? 'border-[#00D9FF] bg-[#00D9FF]/15 scale-[1.02]'
                    : selectedChoice && !isCardAnswered
                    ? 'border-[#00D9FF] bg-[#003831] shadow-[0_0_15px_rgba(0,217,255,0.3)]'
                    : 'border-[#31524D] bg-[#001D1A]'
                }`}
              >
                {selectedChoice && !isCardAnswered ? (
                  <div className="flex items-center justify-between w-full px-2">
                    <span className="font-tech text-xs sm:text-sm font-bold text-[#00D9FF] line-clamp-2">
                      🎯 Pasangan: {selectedChoice.text}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChoice(null);
                      }}
                      className="text-xs text-[#94A3B8] hover:text-[#EF4444] px-1"
                    >
                      Batal
                    </button>
                  </div>
                ) : isCardAnswered ? (
                  <span className="text-xs text-[#CBD5E1]">
                    Kartu ini telah dinilai ({currentAnswer.pointsEarned} Poin)
                  </span>
                ) : (
                  <div className="flex flex-col items-center text-[#94A3B8] text-xs">
                    <span>Tarik jawaban ke sini</span>
                    <span className="text-[10px] text-[#D6B56D]/80">atau klik pilihan di sebelah kanan</span>
                  </div>
                )}
              </div>
            }
          />

          {/* Action Bar Below Card */}
          <div className="w-full max-w-xl mt-4 flex items-center justify-between gap-3">
            {!isCardAnswered ? (
              <>
                <button
                  onClick={handleCheckAnswer}
                  disabled={!selectedChoice}
                  className={`flex-1 py-3 px-4 rounded-xl font-tech font-bold text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                    selectedChoice
                      ? 'bg-gradient-to-r from-[#00D9FF] to-[#0891B2] text-black shadow-[0_0_20px_rgba(0,217,255,0.5)] hover:scale-[1.02] cursor-pointer'
                      : 'bg-[#002D28] text-[#94A3B8] opacity-50 cursor-not-allowed border border-[#31524D]'
                  }`}
                >
                  <CheckCircle size={18} />
                  Periksa Jawaban
                </button>
                <button
                  onClick={handleSkip}
                  className="py-3 px-4 rounded-xl font-tech font-bold text-sm tracking-wider uppercase bg-[#002D28] hover:bg-[#004740] text-[#D6B56D] border border-[#31524D] transition-all flex items-center gap-1.5"
                >
                  <ArrowRight size={16} /> Lewati
                </button>
              </>
            ) : (
              <div className="w-full flex items-center justify-between gap-2">
                <button
                  onClick={() => setShowExplanationModal(true)}
                  className="flex-1 py-2.5 px-3 rounded-lg font-tech font-bold text-xs sm:text-sm bg-[#002D28] hover:bg-[#004740] text-[#00D9FF] border border-[#00D9FF]/40 transition-all flex items-center justify-center gap-1.5"
                >
                  <HelpCircle size={16} />
                  Lihat Pembahasan Lengkap
                </button>
                <button
                  onClick={handleNext}
                  className="py-2.5 px-4 rounded-lg font-tech font-bold text-xs sm:text-sm bg-gradient-to-r from-[#00D9FF] to-[#0891B2] text-black transition-all flex items-center gap-1.5"
                >
                  Kartu Berikutnya <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Choices Pool (7 cols) */}
        <div className="lg:col-span-7 w-full flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-[#00201C] border border-[#31524D] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#31524D]/60 mb-3">
              <div>
                <h3 className="font-title font-bold text-sm sm:text-base text-[#D6B56D]">
                  PILIHAN PASANGAN JAWABAN
                </h3>
                <p className="text-xs text-[#CBD5E1]">
                  Pilih jawaban yang paling tepat untuk menjodohkan KARTU #{currentQuestion.cardNumber}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#001412] text-[#00D9FF] font-tech text-xs border border-[#00D9FF]/30">
                {answerPool.length} Pilihan
              </span>
            </div>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {answerPool.map((choice) => {
                const isSelected = selectedChoice?.id === choice.id;
                const isCorrectMatch = currentAnswer && currentAnswer.selectedAnswerId === choice.id && currentAnswer.isCorrect;
                const isWrongMatch = currentAnswer && currentAnswer.selectedAnswerId === choice.id && !currentAnswer.isCorrect;
                const isTheTrueAnswer = currentAnswer && !currentAnswer.isCorrect && choice.id === currentQuestion.correctAnswerId;

                let cardStyle = 'bg-[#002D28] border-[#31524D] text-[#F5F2E8] hover:border-[#00D9FF] hover:bg-[#003831]';

                if (isSelected && !isCardAnswered) {
                  cardStyle = 'bg-[#00473E] border-[#00D9FF] text-white shadow-[0_0_15px_rgba(0,217,255,0.4)] ring-1 ring-[#00D9FF]';
                } else if (isCorrectMatch) {
                  cardStyle = 'bg-[#10B981]/20 border-[#10B981] text-[#34D399]';
                } else if (isWrongMatch) {
                  cardStyle = 'bg-[#EF4444]/20 border-[#EF4444] text-[#F87171] line-through';
                } else if (isTheTrueAnswer) {
                  cardStyle = 'bg-[#10B981]/15 border-dashed border-[#10B981] text-[#34D399]';
                }

                return (
                  <div
                    key={choice.id}
                    draggable={!isCardAnswered}
                    onDragStart={(e) => handleDragStart(e, choice)}
                    onClick={() => handleSelectChoice(choice)}
                    className={`relative p-3.5 rounded-xl border transition-all duration-150 select-none flex items-center justify-between gap-2 ${
                      isCardAnswered ? 'cursor-default opacity-85' : 'cursor-pointer active:scale-[0.98]'
                    } ${cardStyle}`}
                  >
                    <span className="font-tech font-semibold text-xs sm:text-sm tracking-wide leading-snug">
                      {choice.text}
                    </span>

                    {/* Choice indicator badge */}
                    <div className="shrink-0">
                      {isSelected && !isCardAnswered && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00D9FF] shadow-[0_0_8px_#00D9FF] inline-block" />
                      )}
                      {isTheTrueAnswer && (
                        <span className="text-[10px] text-[#34D399] font-tech font-bold uppercase">
                          Kunci
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Card Controls: Akhiri Permainan */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#001D1A]/80 border border-[#31524D]/50 text-xs">
            <span className="text-[#94A3B8]">
              Butuh menyerahkan skor sekarang?
            </span>
            <button
              onClick={onFinishGame}
              className="px-3.5 py-1.5 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444]/30 border border-[#EF4444]/60 text-[#EF4444] font-tech font-bold tracking-wider flex items-center gap-1.5 transition-all"
            >
              <Flag size={14} /> Akhiri Permainan
            </button>
          </div>
        </div>
      </div>

      {/* Explanation Modal */}
      {showExplanationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#002824] border-2 border-[#00D9FF] rounded-2xl max-w-lg w-full p-6 shadow-[0_0_30px_rgba(0,217,255,0.4)] relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#31524D]">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[#D6B56D]" size={18} />
                <h3 className="font-title font-bold text-base text-[#D6B56D]">
                  PEMBAHASAN KARTU #{currentQuestion.cardNumber}
                </h3>
              </div>
              <button
                onClick={() => setShowExplanationModal(false)}
                className="text-[#94A3B8] hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3 text-sm">
              <div>
                <span className="text-xs font-tech text-[#D6B56D] uppercase">Pernyataan:</span>
                <p className="text-[#F5F2E8] italic mt-0.5">"{currentQuestion.statement}"</p>
              </div>

              <div className="p-3 rounded-lg bg-[#001815] border border-[#10B981]">
                <span className="text-xs font-tech text-[#10B981] uppercase font-bold">Kunci Jawaban:</span>
                <p className="text-white font-bold text-base mt-0.5">{currentQuestion.correctAnswerText}</p>
              </div>

              <div>
                <span className="text-xs font-tech text-[#00D9FF] uppercase font-bold">Penjelasan Edukasi:</span>
                <p className="text-[#CBD5E1] leading-relaxed mt-1">{currentQuestion.explanation}</p>
              </div>

              {currentQuestion.historicalNote && (
                <div className="text-xs text-[#D6B56D]/80 bg-[#001F1C] p-2.5 rounded border border-[#31524D]">
                  ℹ️ {currentQuestion.historicalNote}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowExplanationModal(false)}
              className="w-full py-2.5 rounded-lg bg-[#00D9FF] text-black font-tech font-bold text-sm tracking-wider uppercase hover:bg-[#38bdf8] transition-all"
            >
              Tutup Pembahasan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
