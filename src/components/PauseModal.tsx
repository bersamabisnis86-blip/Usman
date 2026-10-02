import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Music } from 'lucide-react';
import { sounds } from '../utils/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  isMuted: boolean;
  isBgmActive: boolean;
  onToggleMute: () => void;
  onToggleBgm: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  isMuted,
  isBgmActive,
  onToggleMute,
  onToggleBgm,
}) => {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-sky-950/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center text-sky-950 shadow-2xl border-4 border-white/80 animate-in fade-in zoom-in-95 duration-150">
        <h2 className="text-2xl sm:text-3xl font-black text-sky-900 mb-2">
          ⏸️ Permainan Dijeda
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-5">
          Tarik napas sejenak sebelum lanjut menangkap!
        </p>

        {/* Audio controls */}
        <div className="flex justify-center gap-3 mb-5">
          <button
            onClick={onToggleBgm}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isBgmActive ? 'bg-purple-100 text-purple-900 border border-purple-300' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Musik {isBgmActive ? 'Nyala' : 'Mati'}</span>
          </button>
          <button
            onClick={onToggleMute}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              !isMuted ? 'bg-sky-100 text-sky-900 border border-sky-300' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>Suara {isMuted ? 'Mati' : 'Nyala'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              sounds.buttonClick();
              onResume();
            }}
            className="w-full bg-amber-400 hover:bg-amber-500 text-amber-950 font-black py-3 rounded-2xl shadow-[0_4px_0_#b47e00] btn-bounce flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-amber-950" />
            <span>Lanjutkan Main</span>
          </button>

          <button
            onClick={() => {
              sounds.buttonClick();
              onRestart();
            }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Ulangi Babak Ini</span>
          </button>

          <button
            onClick={() => {
              sounds.buttonClick();
              onHome();
            }}
            className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold py-2.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <Home className="w-4 h-4" />
            <span>Keluar ke Menu Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};
