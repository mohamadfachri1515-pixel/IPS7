import React, { useState, useEffect } from 'react';
import { GameService } from '../services/gameService';
import { LeaderboardEntry } from '../types';
import { Users, PlusCircle, Download, RefreshCw, BarChart3, Award } from 'lucide-react';

interface HostDashboardModalProps {
  currentRoomCode: string;
  onSelectRoom: (code: string) => void;
  onClose: () => void;
}

export const HostDashboardModal: React.FC<HostDashboardModalProps> = ({
  currentRoomCode,
  onSelectRoom,
  onClose
}) => {
  const [newRoomCode, setNewRoomCode] = useState('');
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [hostName, setHostName] = useState('Pak Guru');
  const [activeRoom, setActiveRoom] = useState(currentRoomCode || 'SDA-JUARA');
  const [roomScores, setRoomScores] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadRoomScores = async (code: string) => {
    setIsLoading(true);
    const data = await GameService.getLeaderboard(code);
    setRoomScores(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadRoomScores(activeRoom);
  }, [activeRoom]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomCode.trim()) return;

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newRoomCode.trim().toUpperCase(),
          title: newRoomTitle || `Room ${newRoomCode}`,
          hostName
        })
      });

      if (res.ok) {
        setFeedbackMsg(`Room #${newRoomCode.toUpperCase()} berhasil dibuat!`);
        setActiveRoom(newRoomCode.trim().toUpperCase());
        onSelectRoom(newRoomCode.trim().toUpperCase());
        setNewRoomCode('');
        setNewRoomTitle('');
      } else {
        setFeedbackMsg('Gagal membuat room.');
      }
    } catch {
      setFeedbackMsg(`Room #${newRoomCode.toUpperCase()} aktif secara lokal.`);
      setActiveRoom(newRoomCode.trim().toUpperCase());
      onSelectRoom(newRoomCode.trim().toUpperCase());
    }
  };

  // Export scores to CSV
  const handleExportCSV = () => {
    if (roomScores.length === 0) {
      alert('Belum ada data peserta untuk diunduh.');
      return;
    }

    const headers = ['Peringkat', 'Nama Siswa', 'Skor', 'Benar', 'Salah', 'Belum Dijawab', 'Akurasi (%)', 'Waktu'];
    const rows = roomScores.map((entry, idx) => [
      idx + 1,
      `"${entry.playerName.replace(/"/g, '""')}"`,
      entry.score,
      entry.correctCount,
      entry.wrongCount,
      entry.unansweredCount,
      `${entry.accuracy}%`,
      entry.timeSpentFormatted
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_nilai_${activeRoom}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const avgScore = roomScores.length > 0 ? Math.round(roomScores.reduce((sum, s) => sum + s.score, 0) / roomScores.length) : 0;
  const highestScore = roomScores.length > 0 ? Math.max(...roomScores.map(s => s.score)) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#00201C] border-2 border-[#00D9FF] rounded-2xl max-w-4xl w-full p-5 sm:p-7 shadow-[0_0_40px_rgba(0,217,255,0.35)] relative flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#31524D]">
          <div className="flex items-center gap-2.5">
            <Users className="text-[#00D9FF]" size={22} />
            <div>
              <h2 className="font-title font-bold text-lg sm:text-xl text-[#00D9FF]">
                DASHBOARD HOST & GURU
              </h2>
              <span className="text-xs text-[#CBD5E1]">
                Kelola ruang kompetisi kelas, pantau nilai real-time, dan unduh rekapan nilai.
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white text-lg font-bold p-1 px-2.5 rounded bg-[#002D28]"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-5">
          {/* Create Room Form */}
          <div className="p-4 rounded-xl bg-[#002D28] border border-[#31524D]">
            <h3 className="font-tech font-bold text-sm text-[#D6B56D] uppercase flex items-center gap-1.5 mb-2">
              <PlusCircle size={16} /> Buat Kode Room Baru untuk Kelas
            </h3>
            <form onSubmit={handleCreateRoom} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <input
                type="text"
                placeholder="Kode Room (misal: GEO-8A)"
                value={newRoomCode}
                onChange={(e) => setNewRoomCode(e.target.value.toUpperCase())}
                className="px-3 py-2 rounded-lg bg-[#001D1A] border border-[#31524D] text-[#F5F2E8] font-tech text-xs sm:text-sm uppercase placeholder:normal-case focus:border-[#00D9FF] outline-none"
              />
              <input
                type="text"
                placeholder="Nama Kelas/Ujian (Opsional)"
                value={newRoomTitle}
                onChange={(e) => setNewRoomTitle(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#001D1A] border border-[#31524D] text-[#F5F2E8] font-tech text-xs sm:text-sm placeholder:normal-case focus:border-[#00D9FF] outline-none"
              />
              <input
                type="text"
                placeholder="Nama Guru"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#001D1A] border border-[#31524D] text-[#F5F2E8] font-tech text-xs sm:text-sm focus:border-[#00D9FF] outline-none"
              />
              <button
                type="submit"
                className="py-2 px-3 rounded-lg bg-[#00D9FF] hover:bg-[#38bdf8] text-black font-tech font-bold text-xs uppercase tracking-wider transition-all"
              >
                Buat Room
              </button>
            </form>
            {feedbackMsg && (
              <p className="text-xs text-[#34D399] font-tech mt-2">✓ {feedbackMsg}</p>
            )}
          </div>

          {/* Active Room Statistics */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#CBD5E1]">Room Aktif:</span>
              <span className="px-3 py-1 rounded-lg bg-[#001D1A] border border-[#00D9FF] text-[#00D9FF] font-tech font-bold text-sm">
                #{activeRoom}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadRoomScores(activeRoom)}
                className="px-3 py-1.5 rounded-lg bg-[#002D28] hover:bg-[#004740] border border-[#31524D] text-[#CBD5E1] text-xs font-tech font-bold flex items-center gap-1"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> Refresh
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-black text-xs font-tech font-bold flex items-center gap-1 transition-all"
              >
                <Download size={13} /> Unduh CSV Nilai
              </button>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#002D28] border border-[#31524D] text-center">
              <span className="text-[10px] text-[#94A3B8] font-tech uppercase">Total Peserta</span>
              <p className="font-tech font-extrabold text-xl text-white mt-0.5">{roomScores.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#002D28] border border-[#31524D] text-center">
              <span className="text-[10px] text-[#94A3B8] font-tech uppercase">Rata-rata Skor</span>
              <p className="font-tech font-extrabold text-xl text-[#D6B56D] mt-0.5">{avgScore}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#002D28] border border-[#31524D] text-center">
              <span className="text-[10px] text-[#94A3B8] font-tech uppercase">Skor Tertinggi</span>
              <p className="font-tech font-extrabold text-xl text-[#34D399] mt-0.5">{highestScore}</p>
            </div>
          </div>

          {/* Scores Table */}
          <div className="rounded-xl border border-[#31524D] overflow-hidden">
            <table className="w-full text-left text-xs font-tech">
              <thead className="bg-[#002D28] text-[#D6B56D] uppercase font-bold border-b border-[#31524D]">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Nama Siswa</th>
                  <th className="py-2 px-3 text-right">Skor</th>
                  <th className="py-2 px-3 text-center">Benar</th>
                  <th className="py-2 px-3 text-center">Salah</th>
                  <th className="py-2 px-3 text-center">Akurasi</th>
                  <th className="py-2 px-3 text-right">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#31524D]/60 bg-[#001D1A]/80">
                {roomScores.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-[#94A3B8]">
                      Belum ada siswa yang menyelesaikan kuis di room ini.
                    </td>
                  </tr>
                ) : (
                  roomScores.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-[#002D28]">
                      <td className="py-2 px-3 font-bold text-white">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-[#F5F2E8]">{s.playerName}</td>
                      <td className="py-2 px-3 text-right font-extrabold text-[#D6B56D]">{s.score}</td>
                      <td className="py-2 px-3 text-center text-[#34D399]">{s.correctCount}</td>
                      <td className="py-2 px-3 text-center text-[#F87171]">{s.wrongCount}</td>
                      <td className="py-2 px-3 text-center text-[#00D9FF]">{s.accuracy}%</td>
                      <td className="py-2 px-3 text-right text-[#CBD5E1]">{s.timeSpentFormatted}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
