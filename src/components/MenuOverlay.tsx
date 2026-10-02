import React, { useState } from 'react';
import { Play, RotateCcw, Trophy, Sparkles, User, ShoppingBag, HelpCircle, Flame, Clock, Download, Smartphone, Laptop, CheckCircle2 } from 'lucide-react';
import { GameMode, GameStats } from '../types/game';
import { sounds } from '../utils/audio';
import { downloadStandaloneHtmlGame } from '../utils/downloadGame';

interface MenuOverlayProps {
  state: 'menu' | 'over';
  score: number;
  stats: GameStats;
  isNewRecord: boolean;
  gameMode: GameMode;
  characterSkinId: string;
  basketSkinId: string;
  lastCaughtCount: number;
  lastMaxCombo: number;
  onStartGame: () => void;
  onSelectMode: (mode: GameMode) => void;
  onSelectCharacter: (id: string) => void;
  onSelectBasket: (id: string) => void;
}

const CHARACTERS = [
  { id: 'budi', name: 'Budi', emoji: '👦', desc: 'Anak periang yang suka apel' },
  { id: 'siti', name: 'Siti', emoji: '👧', desc: 'Pita merah muda & lincah' },
  { id: 'dino', name: 'Dino', emoji: '🧒', desc: 'Topi petualang pemberani' },
  { id: 'kucing', name: 'Si Meng', emoji: '🐱', desc: 'Kucing lucu pecinta daging' },
];

const BASKETS = [
  { id: 'keranjang', name: 'Keranjang Anyam', emoji: '🧺' },
  { id: 'troli', name: 'Troli Belanja', emoji: '🛒' },
  { id: 'kardus', name: 'Kardus Hadiah', emoji: '📦' },
  { id: 'mangkuk', name: 'Mangkuk Cantik', emoji: '🥣' },
  { id: 'topi', name: 'Topi Jerami', emoji: '👒' },
];

export const MenuOverlay: React.FC<MenuOverlayProps> = ({
  state,
  score,
  stats,
  isNewRecord,
  gameMode,
  characterSkinId,
  basketSkinId,
  lastCaughtCount,
  lastMaxCombo,
  onStartGame,
  onSelectMode,
  onSelectCharacter,
  onSelectBasket,
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'customize' | 'howTo' | 'stats' | 'download'>('main');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const currentBest =
    gameMode === 'classic'
      ? stats.bestClassic
      : gameMode === 'timed'
      ? stats.bestTimed
      : stats.bestFrenzy;

  const handleStart = () => {
    sounds.buttonClick();
    onStartGame();
  };

  const handleDownload = () => {
    sounds.buttonClick();
    downloadStandaloneHtmlGame();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-sky-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white/95 rounded-3xl p-6 sm:p-8 text-sky-950 shadow-2xl border-4 border-white/80 my-auto animate-in fade-in zoom-in-95 duration-200">
        {state === 'over' ? (
          /* ================= GAME OVER VIEW ================= */
          <div className="text-center flex flex-col items-center gap-4">
            <div className="text-6xl animate-bounce">
              {score >= 200 ? '🏆' : score >= 100 ? '🎉' : '🥺'}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-sky-900 tracking-tight">
              {gameMode === 'timed' ? 'Waktu Habis!' : 'Yah, Game Selesai!'}
            </h1>

            {isNewRecord && (
              <div className="flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-900 font-extrabold px-4 py-1.5 rounded-full text-sm shadow-sm animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>REKOR BARU TERCIPTA!</span>
              </div>
            )}

            {/* Score Cards */}
            <div className="grid grid-cols-2 gap-3 w-full my-1">
              <div className="bg-sky-50 border-2 border-sky-100 rounded-2xl p-3 flex flex-col items-center">
                <span className="text-xs uppercase font-bold text-sky-600">Skor Kamu</span>
                <span className="text-3xl sm:text-4xl font-black text-sky-900">{score}</span>
              </div>
              <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-3 flex flex-col items-center">
                <span className="text-xs uppercase font-bold text-amber-600">Skor Terbaik</span>
                <span className="text-3xl sm:text-4xl font-black text-amber-900">{currentBest}</span>
              </div>
            </div>

            {/* Match Stats */}
            <div className="w-full bg-slate-50 rounded-2xl p-3 text-xs sm:text-sm text-slate-700 flex justify-around border border-slate-200">
              <div className="text-center">
                <span className="block text-slate-400 font-semibold">Benda Ditangkap</span>
                <span className="font-extrabold text-base text-slate-800">{lastCaughtCount} buah</span>
              </div>
              <div className="w-[1px] bg-slate-200 my-1" />
              <div className="text-center">
                <span className="block text-slate-400 font-semibold">Kombo Tertinggi</span>
                <span className="font-extrabold text-base text-orange-600">{lastMaxCombo}x</span>
              </div>
            </div>

            <p className="text-slate-600 text-sm font-medium">
              {score >= 250
                ? 'Kamu benar-benar master penangkap sejati! Luar biasa! 🌟'
                : score >= 100
                ? 'Hebat sekali! Refleksmu sangat cepat! 🎉'
                : 'Jangan menyerah! Ayo coba lagi, kamu pasti bisa! 💪'}
            </p>

            <button
              onClick={handleStart}
              className="w-full mt-2 bg-gradient-to-b from-amber-400 to-amber-500 text-amber-950 font-black text-xl sm:text-2xl py-4 rounded-2xl shadow-[0_6px_0_#b47e00] btn-bounce flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-6 h-6 stroke-[3]" />
              <span>Main Lagi!</span>
            </button>

            {/* Download button directly on game over */}
            <button
              onClick={handleDownload}
              className="w-full bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs cursor-pointer transition-all"
            >
              <Download className="w-4 h-4 text-sky-700" />
              <span>{downloadSuccess ? 'File Berhasil Diunduh! ✅' : 'Unduh Game File .HTML (Bisa Main Offline)'}</span>
            </button>
          </div>
        ) : (
          /* ================= MAIN MENU VIEW ================= */
          <div className="flex flex-col gap-4">
            {/* Header Title */}
            <div className="text-center">
              <span className="inline-block bg-sky-100 text-sky-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-1">
                Arcade Santai & Seru
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-sky-900 tracking-tight flex items-center justify-center gap-2">
                <span>🧒</span>
                <span>Tangkap Si Jatuh!</span>
              </h1>
              <p className="text-sky-700 text-sm mt-1 max-w-sm mx-auto">
                Tangkap makanan sehat & lezat, hindari kotoran dan bom berdentum!
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-sky-100/80 p-1 rounded-xl text-xs font-bold text-sky-800 overflow-x-auto">
              <button
                onClick={() => setActiveTab('main')}
                className={`flex-1 py-1.5 px-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === 'main' ? 'bg-white shadow-xs text-sky-950' : 'hover:bg-white/50'
                }`}
              >
                🎮 Main
              </button>
              <button
                onClick={() => setActiveTab('customize')}
                className={`flex-1 py-1.5 px-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === 'customize' ? 'bg-white shadow-xs text-sky-950' : 'hover:bg-white/50'
                }`}
              >
                🎨 Karakter
              </button>
              <button
                onClick={() => setActiveTab('howTo')}
                className={`flex-1 py-1.5 px-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === 'howTo' ? 'bg-white shadow-xs text-sky-950' : 'hover:bg-white/50'
                }`}
              >
                📖 Petunjuk
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-1.5 px-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === 'stats' ? 'bg-white shadow-xs text-sky-950' : 'hover:bg-white/50'
                }`}
              >
                🏆 Rekor
              </button>
              <button
                onClick={() => setActiveTab('download')}
                className={`flex-1 py-1.5 px-2 rounded-lg whitespace-nowrap transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'download' ? 'bg-emerald-500 text-white shadow-xs' : 'text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
              </button>
            </div>

            {/* TAB: MAIN (Play & Modes) */}
            {activeTab === 'main' && (
              <div className="flex flex-col gap-3">
                {/* Mode Selector */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Pilih Mode Permainan
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onSelectMode('classic')}
                      className={`p-2.5 rounded-xl border-2 text-left flex flex-col gap-1 transition-all ${
                        gameMode === 'classic'
                          ? 'border-sky-500 bg-sky-50 text-sky-950 ring-2 ring-sky-200'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-xl">❤️</span>
                      <span className="font-extrabold text-xs sm:text-sm">Klasik</span>
                      <span className="text-[10px] text-slate-500 leading-tight">3 nyawa bertahan</span>
                    </button>

                    <button
                      onClick={() => onSelectMode('timed')}
                      className={`p-2.5 rounded-xl border-2 text-left flex flex-col gap-1 transition-all ${
                        gameMode === 'timed'
                          ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-200'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-xl">⏱️</span>
                      <span className="font-extrabold text-xs sm:text-sm">Kilat 60s</span>
                      <span className="text-[10px] text-slate-500 leading-tight">Balap waktu skor</span>
                    </button>

                    <button
                      onClick={() => onSelectMode('frenzy')}
                      className={`p-2.5 rounded-xl border-2 text-left flex flex-col gap-1 transition-all ${
                        gameMode === 'frenzy'
                          ? 'border-purple-500 bg-purple-50 text-purple-950 ring-2 ring-purple-200'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-xl">🌪️</span>
                      <span className="font-extrabold text-xs sm:text-sm">Hujan Badai</span>
                      <span className="text-[10px] text-slate-500 leading-tight">Jatuh lebih deras</span>
                    </button>
                  </div>
                </div>

                {/* Current Loadout Pill */}
                <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {CHARACTERS.find((c) => c.id === characterSkinId)?.emoji || '👦'}
                    </span>
                    <div>
                      <span className="font-bold text-sky-950 block">
                        {CHARACTERS.find((c) => c.id === characterSkinId)?.name}
                      </span>
                      <span className="text-sky-700 text-[11px]">
                        Wadah: {BASKETS.find((b) => b.id === basketSkinId)?.name}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('customize')}
                    className="text-sky-600 hover:text-sky-800 font-bold underline cursor-pointer"
                  >
                    Ubah
                  </button>
                </div>

                {/* Big Mulai Button */}
                <button
                  onClick={handleStart}
                  className="w-full mt-2 bg-gradient-to-b from-amber-400 to-amber-500 text-amber-950 font-black text-2xl py-4 rounded-2xl shadow-[0_6px_0_#b47e00] btn-bounce flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Play className="w-7 h-7 fill-amber-950" />
                  <span>Mulai Main!</span>
                </button>

                {/* Quick Offline Download Pill */}
                <button
                  onClick={handleDownload}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{downloadSuccess ? 'File Diunduh! Buka di browser offline ✅' : 'Unduh Game File .HTML (Bisa Main Tanpa Internet)'}</span>
                </button>

                <p className="text-center text-[11px] text-slate-400">
                  Geser layar / mouse atau pakai tombol panah ⬅️ ➡️
                </p>
              </div>
            )}

            {/* TAB: CUSTOMIZE (Characters & Baskets) */}
            {activeTab === 'customize' && (
              <div className="flex flex-col gap-4 max-h-[360px] overflow-y-auto pr-1">
                {/* Character Picker */}
                <div>
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                    Pilih Karakter
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {CHARACTERS.map((char) => (
                      <button
                        key={char.id}
                        onClick={() => {
                          sounds.buttonClick();
                          onSelectCharacter(char.id);
                        }}
                        className={`p-2.5 rounded-xl border-2 flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                          characterSkinId === char.id
                            ? 'border-sky-500 bg-sky-50 text-sky-950 ring-2 ring-sky-200'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span className="text-3xl">{char.emoji}</span>
                        <div>
                          <span className="font-extrabold text-xs sm:text-sm block">{char.name}</span>
                          <span className="text-[10px] text-slate-500 leading-tight block">{char.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Basket Picker */}
                <div>
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                    Pilih Wadah Penangkap
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {BASKETS.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          sounds.buttonClick();
                          onSelectBasket(b.id);
                        }}
                        className={`p-2.5 rounded-xl border-2 flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                          basketSkinId === b.id
                            ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-200'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span className="text-3xl">{b.emoji}</span>
                        <div>
                          <span className="font-extrabold text-xs sm:text-sm block">{b.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('main')}
                  className="w-full bg-sky-600 text-white font-extrabold py-2.5 rounded-xl mt-1"
                >
                  Selesai & Lanjut Main
                </button>
              </div>
            )}

            {/* TAB: HOW TO PLAY */}
            {activeTab === 'howTo' && (
              <div className="flex flex-col gap-3 text-xs sm:text-sm text-slate-700 max-h-[360px] overflow-y-auto pr-1">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
                  <span className="text-2xl">🍎🥦🍗</span>
                  <div>
                    <span className="font-extrabold text-emerald-900 block">Benda Bagus (+10 & +15 Poin)</span>
                    <p className="text-emerald-700 text-xs">
                      Tangkap buah, sayuran, dan daging untuk mengumpulkan poin dan menaikkan kombo!
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                  <span className="text-2xl">⭐🧲⏰💖</span>
                  <div>
                    <span className="font-extrabold text-amber-900 block">Bonus Spesial Power-Up</span>
                    <p className="text-amber-700 text-xs">
                      Bintang Pelangi (kebal & 2x skor), Magnet (menarik makanan), Jam Es (memperlambat waktu), & Hati (+1 Nyawa).
                    </p>
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5">
                  <span className="text-2xl">💩💣</span>
                  <div>
                    <span className="font-extrabold text-rose-900 block">Hindari Bahaya!</span>
                    <p className="text-rose-700 text-xs">
                      💩 Kotoran membuat mual, kurangi 10 poin dan memutus kombo. 💣 Bom meledak dan mengurangi nyawa!
                    </p>
                  </div>
                </div>

                <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
                  <span className="font-extrabold text-sky-900 block mb-1">🎮 Cara Mengendalikan</span>
                  <ul className="list-disc list-inside text-xs text-sky-800 space-y-0.5">
                    <li>Geser jari di layar HP / seret kursor mouse di komputer.</li>
                    <li>Gunakan tombol panah ⬅️ / ➡️ atau tombol A / D di keyboard.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB: STATS & RECORDS */}
            {activeTab === 'stats' && (
              <div className="flex flex-col gap-3 text-xs sm:text-sm text-slate-700">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-center">
                    <span className="text-[11px] text-sky-600 font-bold block">Rekor Klasik</span>
                    <span className="text-2xl font-black text-sky-950">{stats.bestClassic}</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                    <span className="text-[11px] text-amber-600 font-bold block">Rekor Kilat</span>
                    <span className="text-2xl font-black text-amber-950">{stats.bestTimed}</span>
                  </div>
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
                    <span className="text-[11px] text-purple-600 font-bold block">Rekor Badai</span>
                    <span className="text-2xl font-black text-purple-950">{stats.bestFrenzy}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Total Benda Ditangkap:</span>
                    <span className="font-extrabold text-slate-800">{stats.totalCaught}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Kombo Terpanjang:</span>
                    <span className="font-extrabold text-orange-600">{stats.maxCombo}x berturut-turut</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Permainan Dimainkan:</span>
                    <span className="font-extrabold text-slate-800">{stats.gamesPlayed} kali</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('main')}
                  className="w-full bg-sky-600 text-white font-extrabold py-2.5 rounded-xl mt-1"
                >
                  Kembali ke Menu
                </button>
              </div>
            )}

            {/* TAB: DOWNLOAD (Panduan Download & Unduh File) */}
            {activeTab === 'download' && (
              <div className="flex flex-col gap-3 text-xs sm:text-sm text-slate-700 max-h-[380px] overflow-y-auto pr-1">
                {/* 1. Unduh File Offline Langsung */}
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-center flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl shadow-md">
                    <Download className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-emerald-950 text-base">
                    Unduh File Game Mandiri (.HTML)
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Satu file tunggal lengkap dengan suara dan animasi. Bisa langsung dibuka di browser HP / Laptop kapan saja <b>tanpa internet!</b>
                  </p>

                  <button
                    onClick={handleDownload}
                    className="w-full mt-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    {downloadSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                        <span>File Telah Diunduh!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Klik untuk Unduh Sekarang</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Cara Pasang di Layar HP (Add to Home Screen) */}
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold text-sky-950 text-sm">
                    <Smartphone className="w-4 h-4 text-sky-600" />
                    <span>Cara Pasang di HP (Seperti Aplikasi)</span>
                  </div>
                  <ol className="list-decimal list-inside text-xs text-sky-900 space-y-1 pl-1">
                    <li>Buka game ini di browser HP Anda (Chrome di Android, atau Safari di iPhone).</li>
                    <li>Di <b>Chrome Android</b>: Ketuk titik tiga di pojok kanan atas ➡️ pilih <b>"Tambahkan ke Layar Utama" (Add to Home screen)</b> atau <b>"Install App"</b>.</li>
                    <li>Di <b>Safari iPhone</b>: Ketuk tombol <b>Bagikan (Share)</b> di bawah ➡️ pilih <b>"Tambah ke Layar Utama"</b>.</li>
                    <li>Ikon game akan muncul di layar HP Anda dan bisa dimainkan layaknya aplikasi!</li>
                  </ol>
                </div>

                {/* 3. Cara Download Full Source Code di AI Studio */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                    <Laptop className="w-4 h-4 text-amber-600" />
                    <span>Download Kode Lengkap (Developers)</span>
                  </div>
                  <p className="text-xs text-amber-900">
                    Jika Anda ingin seluruh file proyek (React + Vite + TypeScript), klik ikon <b>Menu / Export / Download Code</b> di bilah atas Google AI Studio untuk mengunduh arsip ZIP atau ekspor langsung ke GitHub.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('main')}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl mt-1 text-xs"
                >
                  Kembali ke Permainan
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

