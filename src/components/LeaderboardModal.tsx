import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../types';
import { GameService } from '../services/gameService';
import { Trophy, Medal, RefreshCw, Clock, Flame, Users } from 'lucide-react';

interface LeaderboardModalProps {
  currentRoomCode?: string;
  currentPlayerName?: string;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  currentRoomCode,
  currentPlayerName,
  onClose
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'room'>(currentRoomCode ? 'room' : 'all');
  const [cycleSeconds, setCycleSeconds] = useState<number>(300);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const loadScores = async () => {
    setIsLoading(true);
    const roomParam = activeTab === 'room' && currentRoomCode ? currentRoomCode : undefined;
    const data = await GameService.getLeaderboard(roomParam);
    setEntries(data);
    setIsLoading(false);
    setLastRefreshedAt(new Date());
  };

  useEffect(() => {
    loadScores();
  }, [activeTab, currentRoomCode]);

  // 5-minute cycle countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = GameService.getLeaderboardCycleSeconds();
      setCycleSeconds(remaining);
      // Auto refresh when 5-min cycle resets
      if (remaining === 300) {
        loadScores();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTab, currentRoomCode]);

  const cycleMins = Math.floor(cycleSeconds / 60);
  const cycleSecs = cycleSeconds % 60;
  const cycleFormatted = `${cycleMins.toString().padStart(2, '0')}:${cycleSecs.toString().padStart(2, '0')}`;

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#00201C] border-2 border-[#00D9FF] rounded-2xl max-w-4xl w-full p-5 sm:p-7 shadow-[0_0_40px_rgba(0,217,255,0.35)] relative flex flex-col max-h-[92vh]">
        {/* Header Section */}
        <div className="flex items-center justify-between pb-4 border-b border-[#31524D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D6B56D] to-[#F59E0B] p-0.5 flex items-center justify-center shadow-[0_0_15px_#D6B56D]">
              <Trophy className="text-black" size={22} />
            </div>
            <div>
              <h2 className="font-title font-black text-lg sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F5E5BE] to-[#D6B56D]">
                PAPAN PERINGKAT ARENA
              </h2>
              <div className="flex items-center gap-2 text-xs font-tech text-[#00D9FF]">
                <span>Pembaruan otomatis tiap 5 menit</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#CBD5E1]">
                  <Clock size={12} /> Siklus berikutnya: <b className="text-[#00D9FF]">{cycleFormatted}</b>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadScores}
              disabled={isLoading}
              className="p-2 rounded-lg bg-[#002D28] hover:bg-[#004740] border border-[#31524D] text-[#00D9FF] transition-all flex items-center gap-1 text-xs font-tech font-bold"
              title="Segarkan Peringkat Sekarang"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-white text-xl font-bold p-1 px-2.5 rounded-lg bg-[#002D28]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Room Tab Selector */}
        <div className="flex items-center justify-between gap-2 mt-4 mb-2 flex-wrap text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-tech font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-[#00D9FF] text-black shadow-[0_0_10px_#00D9FF]'
                  : 'bg-[#002D28] text-[#CBD5E1] hover:bg-[#003831]'
              }`}
            >
              Semua Peserta ({entries.length})
            </button>

            {currentRoomCode && (
              <button
                onClick={() => setActiveTab('room')}
                className={`px-3 py-1.5 rounded-lg font-tech font-bold transition-all ${
                  activeTab === 'room'
                    ? 'bg-[#00D9FF] text-black shadow-[0_0_10px_#00D9FF]'
                    : 'bg-[#002D28] text-[#CBD5E1] hover:bg-[#003831]'
                }`}
              >
                Room #{currentRoomCode}
              </button>
            )}
          </div>

          <span className="text-[11px] text-[#94A3B8] font-tech">
            Terakhir diperbarui: {lastRefreshedAt.toLocaleTimeString('id-ID')}
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-6">
          {entries.length === 0 ? (
            <div className="py-16 text-center text-[#94A3B8] flex flex-col items-center justify-center gap-2">
              <Users size={36} className="opacity-40" />
              <p className="font-tech text-base">Belum ada peserta yang menyelesaikan tantangan.</p>
              <span className="text-xs text-[#CBD5E1]/60">Selesaikan kuis untuk menjadi juara pertama di papan peringkat!</span>
            </div>
          ) : (
            <>
              {/* PODIUM TOP 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* JUARA 2 - PERAK */}
                {top3[1] && (
                  <div className="order-2 sm:order-1 bg-gradient-to-b from-[#1E293B] to-[#0F172A] p-4 rounded-xl border-2 border-[#CBD5E1] shadow-[0_0_15px_rgba(203,213,225,0.3)] flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-full bg-[#CBD5E1] text-black font-tech font-black text-base flex items-center justify-center mb-1">
                      2
                    </div>
                    <span className="text-xs font-tech font-bold text-[#CBD5E1] uppercase">JUARA 2 PERAK</span>
                    <h4 className="font-tech font-bold text-base text-white mt-1 truncate max-w-[180px]">
                      {top3[1].playerName}
                    </h4>
                    <span className="font-tech font-extrabold text-xl text-[#CBD5E1] mt-1">
                      {top3[1].score.toLocaleString('id-ID')} PTS
                    </span>
                    <span className="text-[11px] text-[#94A3B8] font-tech">
                      {top3[1].correctCount} Benar • {top3[1].timeSpentFormatted}
                    </span>
                  </div>
                )}

                {/* JUARA 1 - EMAS */}
                {top3[0] && (
                  <div className="order-1 sm:order-2 bg-gradient-to-b from-[#382B00] via-[#211A00] to-[#0E0C00] p-4 rounded-xl border-2 border-[#D6B56D] shadow-[0_0_25px_rgba(214,181,109,0.5)] flex flex-col items-center text-center transform sm:-translate-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#D6B56D] text-black font-tech font-black text-lg flex items-center justify-center mb-1 shadow-[0_0_15px_#D6B56D]">
                      👑 1
                    </div>
                    <span className="text-xs font-tech font-extrabold text-[#D6B56D] uppercase tracking-wider flex items-center gap-1">
                      <Flame size={14} /> JUARA 1 EMAS
                    </span>
                    <h4 className="font-tech font-bold text-lg text-white mt-1 truncate max-w-[200px]">
                      {top3[0].playerName}
                    </h4>
                    <span className="font-tech font-black text-2xl text-[#FFEAA7] mt-1">
                      {top3[0].score.toLocaleString('id-ID')} PTS
                    </span>
                    <span className="text-xs text-[#D6B56D] font-tech font-semibold">
                      {top3[0].correctCount} Benar • {top3[0].accuracy}% Akurasi • {top3[0].timeSpentFormatted}
                    </span>
                  </div>
                )}

                {/* JUARA 3 - PERUNGGU */}
                {top3[2] && (
                  <div className="order-3 bg-gradient-to-b from-[#2B1705] to-[#140B02] p-4 rounded-xl border-2 border-[#CD7F32] shadow-[0_0_15px_rgba(205,127,50,0.3)] flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-full bg-[#CD7F32] text-white font-tech font-black text-base flex items-center justify-center mb-1">
                      3
                    </div>
                    <span className="text-xs font-tech font-bold text-[#CD7F32] uppercase">JUARA 3 PERUNGGU</span>
                    <h4 className="font-tech font-bold text-base text-white mt-1 truncate max-w-[180px]">
                      {top3[2].playerName}
                    </h4>
                    <span className="font-tech font-extrabold text-xl text-[#E0A96D] mt-1">
                      {top3[2].score.toLocaleString('id-ID')} PTS
                    </span>
                    <span className="text-[11px] text-[#94A3B8] font-tech">
                      {top3[2].correctCount} Benar • {top3[2].timeSpentFormatted}
                    </span>
                  </div>
                )}
              </div>

              {/* TABLE LIST FOR ALL ENTRIES */}
              <div className="overflow-x-auto rounded-xl border border-[#31524D]">
                <table className="w-full text-left text-xs sm:text-sm font-tech">
                  <thead className="bg-[#002D28] text-[#D6B56D] uppercase font-bold border-b border-[#31524D]">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Peserta</th>
                      <th className="py-2.5 px-3 text-right">Skor</th>
                      <th className="py-2.5 px-3 text-center">Benar</th>
                      <th className="py-2.5 px-3 text-center">Salah</th>
                      <th className="py-2.5 px-3 text-center">Belum</th>
                      <th className="py-2.5 px-3 text-center">Akurasi</th>
                      <th className="py-2.5 px-3 text-right">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#31524D]/60 bg-[#001D1A]/70">
                    {entries.map((entry, index) => {
                      const isCurrentPlayer = currentPlayerName && entry.playerName.toLowerCase() === currentPlayerName.toLowerCase();
                      const rank = index + 1;

                      return (
                        <tr
                          key={entry.id}
                          className={`hover:bg-[#002D28] transition-colors ${
                            isCurrentPlayer ? 'bg-[#00D9FF]/10 font-bold text-[#00D9FF]' : ''
                          }`}
                        >
                          <td className="py-2 px-3 font-bold text-white">
                            {rank === 1 ? '🥇 1' : rank === 2 ? '🥈 2' : rank === 3 ? '🥉 3' : rank}
                          </td>
                          <td className="py-2 px-3 font-semibold text-[#F5F2E8] max-w-[200px] truncate">
                            {entry.playerName}
                            {isCurrentPlayer && (
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[#00D9FF] text-black uppercase">
                                Anda
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-extrabold text-[#D6B56D]">
                            {entry.score.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2 px-3 text-center text-[#34D399] font-bold">
                            {entry.correctCount}
                          </td>
                          <td className="py-2 px-3 text-center text-[#F87171]">
                            {entry.wrongCount}
                          </td>
                          <td className="py-2 px-3 text-center text-[#94A3B8]">
                            {entry.unansweredCount}
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-[#00D9FF]">
                            {entry.accuracy}%
                          </td>
                          <td className="py-2 px-3 text-right text-[#CBD5E1]">
                            {entry.timeSpentFormatted}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#31524D] flex items-center justify-between text-xs text-[#94A3B8]">
          <span>Kriteria urutan: 1. Skor Tertinggi &gt; 2. Jumlah Benar &gt; 3. Waktu Tercepat</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#002D28] hover:bg-[#004740] text-[#00D9FF] font-tech font-bold uppercase transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
