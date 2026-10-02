import { GameStats, GameMode } from '../types/game';

const STATS_KEY = 'tsj_game_stats_v2';
const CHAR_KEY = 'tsj_char_skin';
const BASKET_KEY = 'tsj_basket_skin';

export function getStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        bestClassic: parsed.bestClassic || 0,
        bestTimed: parsed.bestTimed || 0,
        bestFrenzy: parsed.bestFrenzy || 0,
        totalCaught: parsed.totalCaught || 0,
        totalBombsAvoided: parsed.totalBombsAvoided || 0,
        maxCombo: parsed.maxCombo || 0,
        gamesPlayed: parsed.gamesPlayed || 0,
      };
    }
    // Also migrate old key tsj_best if present
    const oldBest = +(localStorage.getItem('tsj_best') || 0);
    return {
      bestClassic: oldBest,
      bestTimed: 0,
      bestFrenzy: 0,
      totalCaught: 0,
      totalBombsAvoided: 0,
      maxCombo: 0,
      gamesPlayed: 0,
    };
  } catch {
    return {
      bestClassic: 0,
      bestTimed: 0,
      bestFrenzy: 0,
      totalCaught: 0,
      totalBombsAvoided: 0,
      maxCombo: 0,
      gamesPlayed: 0,
    };
  }
}

export function saveGameEnd(mode: GameMode, score: number, caughtCount: number, peakCombo: number): { isNewRecord: boolean; currentBest: number } {
  const stats = getStats();
  stats.gamesPlayed++;
  stats.totalCaught += caughtCount;
  if (peakCombo > stats.maxCombo) {
    stats.maxCombo = peakCombo;
  }

  let isNewRecord = false;
  let currentBest = 0;

  if (mode === 'classic') {
    if (score > stats.bestClassic) {
      stats.bestClassic = score;
      isNewRecord = true;
      try { localStorage.setItem('tsj_best', String(score)); } catch {}
    }
    currentBest = stats.bestClassic;
  } else if (mode === 'timed') {
    if (score > stats.bestTimed) {
      stats.bestTimed = score;
      isNewRecord = true;
    }
    currentBest = stats.bestTimed;
  } else if (mode === 'frenzy') {
    if (score > stats.bestFrenzy) {
      stats.bestFrenzy = score;
      isNewRecord = true;
    }
    currentBest = stats.bestFrenzy;
  }

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }

  return { isNewRecord, currentBest };
}

export function getSelectedCharacter(): string {
  try {
    return localStorage.getItem(CHAR_KEY) || 'budi';
  } catch {
    return 'budi';
  }
}

export function saveSelectedCharacter(id: string) {
  try {
    localStorage.setItem(CHAR_KEY, id);
  } catch {}
}

export function getSelectedBasket(): string {
  try {
    return localStorage.getItem(BASKET_KEY) || 'keranjang';
  } catch {
    return 'keranjang';
  }
}

export function saveSelectedBasket(id: string) {
  try {
    localStorage.setItem(BASKET_KEY, id);
  } catch {}
}
