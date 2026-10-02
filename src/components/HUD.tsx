import React from 'react';
import { Volume2, VolumeX, Music, Pause, Sparkles, Heart } from 'lucide-react';
import { GameMode, ActivePowerup } from '../types/game';

interface HUDProps {
  score: number;
  best: number;
  lives: number;
  combo: number;
  level: number;
  gameMode: GameMode;
  timeLeft: number;
  activePowerup: ActivePowerup | null;
  isMuted: boolean;
  isBgmActive: boolean;
  onToggleMute: () => void;
  onToggleBgm: () => void;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  best,
  lives,
  combo,
  level,
  gameMode,
  timeLeft,
  activePowerup,
  isMuted,
  isBgmActive,
  onToggleMute,
  onToggleBgm,
  onPause,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 pointer-events-none p-3 pt-[calc(env(safe-area-inset-top,0px)+12px)] flex items-start justify-between">
      {/* Score & Level & Combo */}
      <div className="flex flex-col gap-1 drop-shadow-md">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white text-shadow-blue tracking-wide">
            Skor: {score}
          </span>
          <span className="bg-amber-400 text-amber-950 font-bold text-xs sm:text-sm px-2 py-0.5 rounded-full shadow-sm">
            Lv. {level + 1}
          </span>
        </div>

        <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm font-semibold text-shadow-sm">
          <span>Terbaik: {best}</span>
          {gameMode !== 'classic' && (
            <span className="bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px] uppercase tracking-wider">
              {gameMode === 'timed' ? 'Mode Kilat' : 'Hujan Badai'}
            </span>
          )}
        </div>

        {/* Combo Badge */}
        {combo >= 2 && (
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs sm:text-sm px-2.5 py-0.5 rounded-full shadow-md animate-bounce w-fit mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200" />
            <span>KOMBO x{combo >= 15 ? 3 : combo >= 5 ? 2 : 1.5} ({combo} berturut-turut!)</span>
          </div>
        )}

        {/* Active Powerup Banner */}
        {activePowerup && (
          <div className="mt-1 flex items-center gap-2 bg-indigo-600/90 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-xs shadow-md border border-indigo-400/50">
            <span className="text-base">
              {activePowerup.type === 'star' ? '⭐' : activePowerup.type === 'magnet' ? '🧲' : '⏰'}
            </span>
            <div className="flex flex-col">
              <span className="font-bold">
                {activePowerup.type === 'star'
                  ? 'Bintang Kebal (2x Skor)'
                  : activePowerup.type === 'magnet'
                  ? 'Magnet Makanan'
                  : 'Waktu Perlambat'}
              </span>
              <div className="w-24 h-1.5 bg-indigo-950/60 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-yellow-300 transition-all duration-100 ease-linear rounded-full"
                  style={{
                    width: `${Math.max(0, (activePowerup.duration / activePowerup.maxDuration) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Controls & Lives / Timer */}
      <div className="flex flex-col items-end gap-2">
        {/* Lives or Time Remaining */}
        <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-sm border border-white/30 text-white font-bold text-base sm:text-lg">
          {gameMode === 'timed' ? (
            <div className="flex items-center gap-1.5 text-amber-200">
              <span className="text-lg">⏱️</span>
              <span className={`text-shadow-sm font-black text-xl ${timeLeft <= 10 ? 'text-red-300 animate-pulse' : ''}`}>
                {timeLeft}s
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((heartIndex) => (
                <Heart
                  key={heartIndex}
                  className={`w-6 h-6 transition-transform duration-200 ${
                    heartIndex <= lives
                      ? 'fill-red-500 text-red-600 scale-100 drop-shadow'
                      : 'fill-gray-600/40 text-gray-500/50 scale-90'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Buttons (Pause, Sound, Music) */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={onToggleBgm}
            aria-label="Musik Latar"
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 border-white/80 transition-transform active:scale-95 ${
              isBgmActive ? 'bg-purple-500 text-white' : 'bg-white/80 text-gray-600'
            }`}
            title={isBgmActive ? 'Matikan Musik' : 'Nyalakan Musik'}
          >
            <Music className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleMute}
            aria-label="Efek Suara"
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 border-white/80 transition-transform active:scale-95 ${
              isMuted ? 'bg-rose-500 text-white' : 'bg-white text-sky-700'
            }`}
            title={isMuted ? 'Nyalakan Efek Suara' : 'Bisukan Efek Suara'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={onPause}
            aria-label="Jeda Permainan"
            className="w-10 h-10 rounded-full bg-white text-sky-700 flex items-center justify-center shadow-md border-2 border-white/80 transition-transform active:scale-95"
            title="Jeda (Pause)"
          >
            <Pause className="w-5 h-5 fill-sky-700" />
          </button>
        </div>
      </div>
    </header>
  );
};
