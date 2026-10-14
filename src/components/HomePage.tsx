import React, { useState } from 'react';
import { Trophy, Play, BookOpen, Users, Sparkles, Layers, ShieldCheck, Flame } from 'lucide-react';
import { sound } from '../services/sound';

interface HomePageProps {
  onStartGame: (playerName: string, mode: 'practice' | 'competition', roomCode: string) => void;
  onOpenLeaderboard: () => void;
  onOpenRules: () => void;
  onOpenHostDashboard: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartGame,
  onOpenLeaderboard,
  onOpenRules,
  onOpenHostDashboard
}) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'practice' | 'competition'>('practice');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      sound.playWrong();
      setErrorMessage('Silakan isi nama peserta sebelum memulai tantangan!');
      return;
    }

    if (mode === 'competition' && !roomCode.trim()) {
      sound.playWrong();
      setErrorMessage('Mode Kompetisi membutuhkan Kode Room (misal: SDA-JUARA)!');
      return;
    }

    sound.playClick();
    setErrorMessage('');
    onStartGame(playerName.trim(), mode, roomCode.trim().toUpperCase());
  };

  return (
    <div className="w-full min-h-[calc(100vh-60px)] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background Ambience & Cyber Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,#003831_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00D9FF08_1px,transparent_1px),linear-gradient(to_bottom,#00D9FF08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Main Content Box */}
      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center">
        {/* Fantasy Crest Wings & Top Badge */}
        <div className="flex items-center justify-center gap-2 mb-2 animate-bounce">
          <div className="w-8 sm:w-16 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-[#D6B56D]" />
          <span className="px-3 py-0.5 rounded-full bg-[#001D1A] border border-[#00D9FF] text-[#00D9FF] font-tech text-xs tracking-widest uppercase shadow-[0_0_12px_rgba(0,217,255,0.4)]">
            TANTANGAN EDUKASI GEOGRAFI
          </span>
          <div className="w-8 sm:w-16 h-[2px] bg-gradient-to-l from-transparent via-[#00D9FF] to-[#D6B56D]" />
        </div>

        {/* Big Signature Clash of Champions Title */}
        <h1 className="font-title font-black text-3xl sm:text-5xl md:text-6xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#F5E5BE] to-[#D6B56D] drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)]">
          CLASH OF CHAMPIONS
        </h1>

        {/* Subtitle */}
        <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#002824] border border-[#31524D] shadow-[0_0_20px_rgba(0,217,255,0.2)]">
          <Sparkles className="text-[#00D9FF]" size={16} />
          <span className="font-tech font-bold text-sm sm:text-lg tracking-widest uppercase text-[#00D9FF]">
            TANTANGAN SUMBER DAYA ALAM
          </span>
          <Sparkles className="text-[#00D9FF]" size={16} />
        </div>

        <p className="mt-4 text-xs sm:text-sm text-[#CBD5E1] max-w-lg leading-relaxed">
          Uji ketangkasan intelektual Anda dalam <b>50 Kartu Menjodohkan</b> seputar Bahan Tambang, SDA Terbarukan, dan Konservasi Energi. Raih skor maksimal <b>10.000 Poin</b> dalam waktu <b>5 Menit</b>!
        </p>

        {/* Form Card */}
        <div className="w-full mt-7 p-6 sm:p-8 rounded-2xl bg-[#00201C]/90 border-2 border-[#5A736E] hover:border-[#00D9FF]/70 backdrop-blur-md shadow-[0_0_35px_rgba(0,0,0,0.8)] transition-all">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-[#EF4444]/15 border border-[#EF4444] text-[#F87171] text-xs font-tech font-bold flex items-center gap-2">
                <span>⚠️ {errorMessage}</span>
              </div>
            )}

            {/* Mode Selector */}
            <div>
              <label className="block text-xs font-tech font-bold text-[#D6B56D] uppercase mb-1.5">
                Pilih Mode Permainan:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMode('practice');
                    setErrorMessage('');
                  }}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-tech font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                    mode === 'practice'
                      ? 'bg-[#003831] border-[#00D9FF] text-white shadow-[0_0_15px_rgba(0,217,255,0.3)] ring-1 ring-[#00D9FF]'
                      : 'bg-[#002824] border-[#31524D] text-[#94A3B8] hover:bg-[#00302B]'
                  }`}
                >
                  <span className="flex items-center gap-1 text-[#00D9FF]">
                    <Layers size={16} /> Mode Latihan
                  </span>
                  <span className="text-[10px] text-[#CBD5E1] font-normal">Bermain mandiri & simpan di perangkat</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMode('competition');
                    setErrorMessage('');
                  }}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-tech font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                    mode === 'competition'
                      ? 'bg-[#003831] border-[#D6B56D] text-white shadow-[0_0_15px_rgba(214,181,109,0.3)] ring-1 ring-[#D6B56D]'
                      : 'bg-[#002824] border-[#31524D] text-[#94A3B8] hover:bg-[#00302B]'
                  }`}
                >
                  <span className="flex items-center gap-1 text-[#D6B56D]">
                    <Trophy size={16} /> Mode Kompetisi
                  </span>
                  <span className="text-[10px] text-[#CBD5E1] font-normal">Sinkronisasi Room kelas real-time</span>
                </button>
              </div>
            </div>

            {/* Input Nama Peserta */}
            <div>
              <label className="block text-xs font-tech font-bold text-[#D6B56D] uppercase mb-1">
                Nama Peserta / Juara: <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={40}
                placeholder="Masukkan nama lengkap Anda..."
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="w-full px-4 py-3 rounded-xl bg-[#001715] border border-[#31524D] text-[#F5F2E8] placeholder-[#64748B] focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF] outline-none font-sans text-sm sm:text-base transition-all"
              />
            </div>

            {/* Input Room Code (Visible if competition or optional) */}
            {mode === 'competition' && (
              <div>
                <label className="block text-xs font-tech font-bold text-[#D6B56D] uppercase mb-1">
                  Kode Room / Sesi: <span className="text-[#EF4444]">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={15}
                    placeholder="Contoh: SDA-JUARA"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#001715] border border-[#31524D] text-[#00D9FF] font-tech font-bold uppercase placeholder:normal-case placeholder-[#64748B] focus:border-[#00D9FF] outline-none text-sm sm:text-base tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setRoomCode('SDA-JUARA')}
                    className="px-3 py-2 rounded-xl bg-[#002D28] border border-[#31524D] text-[#D6B56D] font-tech text-xs hover:bg-[#003831]"
                    title="Gunakan Demo Room"
                  >
                    Demo Room
                  </button>
                </div>
                <span className="text-[10px] text-[#94A3B8] mt-1 block">
                  Dapatkan kode room dari guru atau pengawas ujian.
                </span>
              </div>
            )}

            {/* Tombol Mulai */}
            <button
              type="submit"
              className="mt-2 w-full py-4 rounded-xl bg-gradient-to-r from-[#00D9FF] via-[#38BDF8] to-[#0891B2] text-black font-tech font-black text-base sm:text-lg tracking-widest uppercase shadow-[0_0_25px_rgba(0,217,255,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play size={20} fill="currentColor" />
              MULAI TANTANGAN
            </button>
          </form>

          {/* Quick Actions */}
          <div className="mt-5 pt-4 border-t border-[#31524D]/60 flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="px-3.5 py-2 rounded-lg bg-[#002D28] hover:bg-[#004740] border border-[#D6B56D]/50 text-[#D6B56D] text-xs font-tech font-bold tracking-wider uppercase transition-all flex items-center gap-1.5"
            >
              <Trophy size={15} /> Papan Peringkat
            </button>

            <button
              type="button"
              onClick={onOpenRules}
              className="px-3.5 py-2 rounded-lg bg-[#002D28] hover:bg-[#004740] border border-[#31524D] text-[#CBD5E1] text-xs font-tech font-bold tracking-wider uppercase transition-all flex items-center gap-1.5"
            >
              <BookOpen size={15} /> Petunjuk Aturan
            </button>

            <button
              type="button"
              onClick={onOpenHostDashboard}
              className="px-3.5 py-2 rounded-lg bg-[#002521] hover:bg-[#003831] border border-[#00D9FF]/40 text-[#00D9FF] text-xs font-tech font-bold tracking-wider uppercase transition-all flex items-center gap-1.5"
            >
              <Users size={15} /> Dashboard Guru
            </button>
          </div>
        </div>

        {/* Feature Highlights Footer */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-left">
          <div className="p-3 rounded-xl bg-[#001D1A]/70 border border-[#31524D]/50 text-xs">
            <span className="font-tech font-bold text-[#D6B56D] block">⚡ Tepat 50 Soal</span>
            <span className="text-[#94A3B8] text-[11px]">Bahan tambang & klasifikasi SDA terbarukan lengkap.</span>
          </div>
          <div className="p-3 rounded-xl bg-[#001D1A]/70 border border-[#31524D]/50 text-xs">
            <span className="font-tech font-bold text-[#00D9FF] block">⏱️ Timer 5 Menit</span>
            <span className="text-[#94A3B8] text-[11px]">Sistem waktu akurat berbasis timestamp tanpa jeda.</span>
          </div>
          <div className="p-3 rounded-xl bg-[#001D1A]/70 border border-[#31524D]/50 text-xs">
            <span className="font-tech font-bold text-[#34D399] block">🎯 Drag & Click Match</span>
            <span className="text-[#94A3B8] text-[11px]">Responsif untuk perangkat ponsel, tablet, & desktop.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
