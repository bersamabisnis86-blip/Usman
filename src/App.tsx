/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { MenuOverlay } from './components/MenuOverlay';
import { PauseModal } from './components/PauseModal';
import { TouchControls } from './components/TouchControls';
import { GameMode, ActivePowerup } from './types/game';
import { sounds } from './utils/audio';
import {
  getStats,
  saveGameEnd,
  getSelectedCharacter,
  saveSelectedCharacter,
  getSelectedBasket,
  saveSelectedBasket,
} from './utils/storage';

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'over'>('menu');
  const [isPaused, setIsPaused] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('classic');

  // Skins
  const [characterSkinId, setCharacterSkinId] = useState<string>(getSelectedCharacter);
  const [basketSkinId, setBasketSkinId] = useState<string>(getSelectedBasket);

  // In-game stats
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [activePowerup, setActivePowerup] = useState<ActivePowerup | null>(null);

  // Match ending results
  const [stats, setStats] = useState(getStats);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [lastCaughtCount, setLastCaughtCount] = useState(0);
  const [lastMaxCombo, setLastMaxCombo] = useState(0);

  // Sound settings
  const [isMuted, setIsMuted] = useState(() => sounds.getMuted());
  const [isBgmActive, setIsBgmActive] = useState(false);

  // Touch controls active detection (optional visibility)
  const [showTouchButtons, setShowTouchButtons] = useState(false);

  useEffect(() => {
    // Detect mobile touch screen for virtual arrows
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setShowTouchButtons(isTouchDevice);
  }, []);

  // Handle character skin change
  const handleSelectCharacter = (id: string) => {
    setCharacterSkinId(id);
    saveSelectedCharacter(id);
  };

  // Handle basket skin change
  const handleSelectBasket = (id: string) => {
    setBasketSkinId(id);
    saveSelectedBasket(id);
  };

  // Toggle mute
  const handleToggleMute = useCallback(() => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (muted) {
      setIsBgmActive(false);
    }
  }, []);

  // Toggle BGM
  const handleToggleBgm = useCallback(() => {
    if (isBgmActive) {
      sounds.stopBGM();
      setIsBgmActive(false);
    } else {
      sounds.startBGM();
      setIsBgmActive(true);
    }
  }, [isBgmActive]);

  // Start new game
  const startGame = useCallback(() => {
    sounds.init();
    setScore(0);
    setLives(3);
    setCombo(0);
    setLevel(0);
    setTimeLeft(60);
    setActivePowerup(null);
    setIsPaused(false);
    setIsNewRecord(false);
    setLastCaughtCount(0);
    setLastMaxCombo(0);
    setGameState('playing');

    if (isBgmActive) {
      sounds.startBGM();
    }
  }, [isBgmActive]);

  // Game over callback
  const handleGameOver = useCallback(
    (finalScore: number, caughtCount: number, maxCombo: number) => {
      setLastCaughtCount(caughtCount);
      setLastMaxCombo(maxCombo);

      const recordInfo = saveGameEnd(gameMode, finalScore, caughtCount, maxCombo);
      setIsNewRecord(recordInfo.isNewRecord);
      setStats(getStats());
      setGameState('over');
      setIsPaused(false);
    },
    [gameMode]
  );

  // Score change
  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  // Escape key for pause
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gameState === 'playing') {
        setIsPaused((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState]);

  // Virtual buttons key dispatcher
  const moveLeftRef = useRef<number | null>(null);
  const moveRightRef = useRef<number | null>(null);

  const handleMoveLeft = useCallback((isDown: boolean) => {
    window.dispatchEvent(new KeyboardEvent(isDown ? 'keydown' : 'keyup', { key: 'ArrowLeft' }));
  }, []);

  const handleMoveRight = useCallback((isDown: boolean) => {
    window.dispatchEvent(new KeyboardEvent(isDown ? 'keydown' : 'keyup', { key: 'ArrowRight' }));
  }, []);

  const currentBest =
    gameMode === 'classic'
      ? stats.bestClassic
      : gameMode === 'timed'
      ? stats.bestTimed
      : stats.bestFrenzy;

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#7fd1ff] font-['Fredoka','Arial_Rounded_MT_Bold',sans-serif]">
      {/* 2D Canvas Game Core */}
      <GameCanvas
        isPlaying={gameState === 'playing'}
        isPaused={isPaused}
        gameMode={gameMode}
        characterSkinId={characterSkinId}
        basketSkinId={basketSkinId}
        score={score}
        lives={lives}
        combo={combo}
        level={level}
        timeLeft={timeLeft}
        activePowerup={activePowerup}
        onScoreChange={handleScoreChange}
        onLivesChange={setLives}
        onComboChange={setCombo}
        onLevelChange={setLevel}
        onTimeChange={setTimeLeft}
        onPowerupChange={setActivePowerup}
        onGameOver={handleGameOver}
      />

      {/* In-Game HUD */}
      {gameState === 'playing' && (
        <>
          <HUD
            score={score}
            best={currentBest}
            lives={lives}
            combo={combo}
            level={level}
            gameMode={gameMode}
            timeLeft={timeLeft}
            activePowerup={activePowerup}
            isMuted={isMuted}
            isBgmActive={isBgmActive}
            onToggleMute={handleToggleMute}
            onToggleBgm={handleToggleBgm}
            onPause={() => setIsPaused(true)}
          />

          {/* Touch virtual arrow buttons on touch devices */}
          {showTouchButtons && (
            <TouchControls onMoveLeft={handleMoveLeft} onMoveRight={handleMoveRight} />
          )}
        </>
      )}

      {/* Pause Menu Modal */}
      {gameState === 'playing' && isPaused && (
        <PauseModal
          onResume={() => setIsPaused(false)}
          onRestart={startGame}
          onHome={() => {
            setIsPaused(false);
            setGameState('menu');
          }}
          isMuted={isMuted}
          isBgmActive={isBgmActive}
          onToggleMute={handleToggleMute}
          onToggleBgm={handleToggleBgm}
        />
      )}

      {/* Main Menu & Game Over Overlay */}
      {gameState !== 'playing' && (
        <MenuOverlay
          state={gameState}
          score={score}
          stats={stats}
          isNewRecord={isNewRecord}
          gameMode={gameMode}
          characterSkinId={characterSkinId}
          basketSkinId={basketSkinId}
          lastCaughtCount={lastCaughtCount}
          lastMaxCombo={lastMaxCombo}
          onStartGame={startGame}
          onSelectMode={setGameMode}
          onSelectCharacter={handleSelectCharacter}
          onSelectBasket={handleSelectBasket}
        />
      )}
    </div>
  );
}
