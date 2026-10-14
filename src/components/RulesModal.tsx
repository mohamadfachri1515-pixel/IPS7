import React from 'react';
import { BookOpen, Trophy, Clock, Award, CheckCircle2, ShieldAlert } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#00201C] border-2 border-[#D6B56D] rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-[0_0_35px_rgba(214,181,109,0.35)] relative flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-[#31524D]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="text-[#D6B56D]" size={22} />
            <h2 className="font-title font-bold text-lg sm:text-xl text-[#D6B56D]">
              ATURAN & PANDUAN TANTANGAN
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white text-lg font-bold p-1 px-2.5 rounded bg-[#002D28]"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-4 text-xs sm:text-sm text-[#F5F2E8] leading-relaxed">
          {/* Section 1 */}
          <div className="p-3.5 rounded-xl bg-[#002D28] border border-[#31524D]">
            <h3 className="font-tech font-bold text-sm text-[#00D9FF] flex items-center gap-1.5 uppercase mb-1">
              <Clock size={16} /> 1. Batas Waktu 5 Menit (300 Detik)
            </h3>
            <p className="text-[#CBD5E1]">
              Setiap sesi berdurasi tepat 5 menit. Timer menggunakan timestamp sehingga tetap akurat walau tab diminimalkan. Saat waktu mencapai 00:00, seluruh jawaban otomatis dikunci dan skor akhir dihitung.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-3.5 rounded-xl bg-[#002D28] border border-[#31524D]">
            <h3 className="font-tech font-bold text-sm text-[#D6B56D] flex items-center gap-1.5 uppercase mb-1">
              <Award size={16} /> 2. Distribusi Level & Poin (Maks. 10.000 Poin)
            </h3>
            <ul className="space-y-1 text-[#CBD5E1] pl-2">
              <li>• <b>Soal 1–10 (Level 1)</b>: 100 Poin/soal (Maks: 1.000 Poin)</li>
              <li>• <b>Soal 11–25 (Level 2)</b>: 200 Poin/soal (Maks: 3.000 Poin)</li>
              <li>• <b>Soal 26–50 (Level 3)</b>: 240 Poin/soal (Maks: 6.000 Poin)</li>
              <li className="text-[#00D9FF] font-bold mt-1">
                Total Poin Maksimum = Tepat 10.000 Poin.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="p-3.5 rounded-xl bg-[#002D28] border border-[#31524D]">
            <h3 className="font-tech font-bold text-sm text-[#34D399] flex items-center gap-1.5 uppercase mb-1">
              <CheckCircle2 size={16} /> 3. Mekanisme Menjodohkan & Penilaian
            </h3>
            <p className="text-[#CBD5E1]">
              Anda dapat menjodohkan dengan:
            </p>
            <ul className="list-disc pl-5 mt-1 text-[#CBD5E1] space-y-1">
              <li><b>Klik untuk Memasangkan</b>: Klik kartu pernyataan lalu klik jawaban yang cocok.</li>
              <li><b>Drag and Drop</b>: Tarik jawaban langsung ke dalam slot kartu.</li>
              <li>Tekan tombol <b>"PERIKSA JAWABAN"</b> untuk mengevaluasi.</li>
              <li>Jawaban yang benar mendapat poin penuh; jawaban salah mendapat 0 poin. Setelah dinilai, soal dikunci permanen untuk mencegah pengulangan poin.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="p-3.5 rounded-xl bg-[#002D28] border border-[#31524D]">
            <h3 className="font-tech font-bold text-sm text-[#F59E0B] flex items-center gap-1.5 uppercase mb-1">
              <Trophy size={16} /> 4. Papan Peringkat & Penentuan Juara
            </h3>
            <p className="text-[#CBD5E1]">
              Papan peringkat arena diurutkan secara ketat berdasarkan:
            </p>
            <ol className="list-decimal pl-5 mt-1 text-[#CBD5E1] space-y-0.5">
              <li>Total perolehan skor tertinggi</li>
              <li>Jumlah jawaban benar terbanyak (jika skor sama)</li>
              <li>Waktu penyelesaian tercepat (jika skor dan jumlah benar sama)</li>
            </ol>
            <p className="text-[#94A3B8] text-[11px] mt-1.5">
              Peringkat diperbarui secara berkala setiap 5 menit.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-[#00D9FF] text-black font-tech font-bold text-sm tracking-wider uppercase hover:bg-[#38bdf8] transition-all"
        >
          Saya Siap Bertanding
        </button>
      </div>
    </div>
  );
};
