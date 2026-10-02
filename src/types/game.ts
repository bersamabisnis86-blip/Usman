export type ItemCategory = 'fruit' | 'veg' | 'meat' | 'powerup' | 'poop' | 'bomb';

export interface FallingItem {
  id: number;
  category: ItemCategory;
  emoji: string;
  name: string;
  points: number;
  x: number;
  y: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  isPowerup?: boolean;
  powerupType?: 'star' | 'magnet' | 'slow' | 'heart';
}

export type CharacterMood = 'n' | 'h' | 'l' | 's' | 'b'; // normal, happy, licking, sick, bomb-shocked

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
  type: 'spark' | 'cloud' | 'star' | 'heart';
}

export interface FloatingPop {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
  life: number;
  scale?: number;
}

export interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
}

export type GameMode = 'classic' | 'timed' | 'frenzy';

export interface CharacterSkin {
  id: string;
  name: string;
  hairColor: string;
  shirtColor: string;
  special?: 'girl' | 'cat' | 'adventurer' | 'classic';
  previewEmoji: string;
}

export interface BasketSkin {
  id: string;
  name: string;
  emoji: string;
}

export interface ActivePowerup {
  type: 'star' | 'magnet' | 'slow';
  duration: number; // seconds remaining
  maxDuration: number;
}

export interface GameStats {
  bestClassic: number;
  bestTimed: number;
  bestFrenzy: number;
  totalCaught: number;
  totalBombsAvoided: number;
  maxCombo: number;
  gamesPlayed: number;
}
