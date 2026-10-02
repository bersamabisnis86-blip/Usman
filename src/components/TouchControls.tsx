import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TouchControlsProps {
  onMoveLeft: (isDown: boolean) => void;
  onMoveRight: (isDown: boolean) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onMoveLeft, onMoveRight }) => {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-20 pointer-events-none px-4 flex justify-between items-center select-none pb-[env(safe-area-inset-bottom,0px)]">
      <button
        type="button"
        aria-label="Gerak Kiri"
        onPointerDown={(e) => {
          e.preventDefault();
          onMoveLeft(true);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          onMoveLeft(false);
        }}
        onPointerCancel={(e) => {
          e.preventDefault();
          onMoveLeft(false);
        }}
        className="pointer-events-auto w-16 h-16 rounded-2xl bg-white/70 active:bg-white text-sky-900 border-2 border-white/90 shadow-lg backdrop-blur-xs flex items-center justify-center transition-all active:scale-90"
      >
        <ChevronLeft className="w-10 h-10 stroke-[3]" />
      </button>

      <button
        type="button"
        aria-label="Gerak Kanan"
        onPointerDown={(e) => {
          e.preventDefault();
          onMoveRight(true);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          onMoveRight(false);
        }}
        onPointerCancel={(e) => {
          e.preventDefault();
          onMoveRight(false);
        }}
        className="pointer-events-auto w-16 h-16 rounded-2xl bg-white/70 active:bg-white text-sky-900 border-2 border-white/90 shadow-lg backdrop-blur-xs flex items-center justify-center transition-all active:scale-90"
      >
        <ChevronRight className="w-10 h-10 stroke-[3]" />
      </button>
    </div>
  );
};
