import React, { useEffect, useRef } from 'react';
import { FallingItem, CharacterMood, Particle, FloatingPop, Cloud, GameMode, ActivePowerup } from '../types/game';
import { sounds } from '../utils/audio';

interface GameCanvasProps {
  isPlaying: boolean;
  isPaused: boolean;
  gameMode: GameMode;
  characterSkinId: string;
  basketSkinId: string;
  score: number;
  lives: number;
  combo: number;
  level: number;
  timeLeft: number;
  activePowerup: ActivePowerup | null;
  onScoreChange: (newScore: number, added: number) => void;
  onLivesChange: (newLives: number) => void;
  onComboChange: (newCombo: number) => void;
  onLevelChange: (newLevel: number) => void;
  onTimeChange: (newTime: number) => void;
  onPowerupChange: (powerup: ActivePowerup | null) => void;
  onGameOver: (finalScore: number, caughtCount: number, maxCombo: number) => void;
}

const FRUITS = [
  { e: '🍎', n: 'Apel', p: 10 },
  { e: '🍌', n: 'Pisang', p: 10 },
  { e: '🍓', n: 'Stroberi', p: 10 },
  { e: '🍉', n: 'Semangka', p: 10 },
  { e: '🍊', n: 'Jeruk', p: 10 },
  { e: '🍇', n: 'Anggur', p: 10 },
  { e: '🍍', n: 'Nanas', p: 10 },
];

const VEGGIES = [
  { e: '🥕', n: 'Wortel', p: 10 },
  { e: '🥦', n: 'Brokoli', p: 10 },
  { e: '🍅', n: 'Tomat', p: 10 },
  { e: '🌽', n: 'Jagung', p: 10 },
  { e: '🥑', n: 'Alpukat', p: 10 },
];

const MEATS = [
  { e: '🍗', n: 'Ayam Goreng', p: 15 },
  { e: '🌭', n: 'Sosis', p: 15 },
  { e: '🥩', n: 'Steak', p: 15 },
  { e: '🍔', n: 'Burger', p: 15 },
  { e: '🍕', n: 'Pizza', p: 15 },
];

const POWERUPS = [
  { e: '🌟', n: 'Bintang Pelangi', type: 'star' as const },
  { e: '🧲', n: 'Magnet Makanan', type: 'magnet' as const },
  { e: '⏰', n: 'Jam Perlambat', type: 'slow' as const },
  { e: '💖', n: 'Hati Tambahan', type: 'heart' as const },
];

const BASKET_EMOJIS: Record<string, string> = {
  keranjang: '🧺',
  troli: '🛒',
  kardus: '📦',
  mangkuk: '🥣',
  topi: '👒',
};

export const GameCanvas: React.FC<GameCanvasProps> = ({
  isPlaying,
  isPaused,
  gameMode,
  characterSkinId,
  basketSkinId,
  score,
  lives,
  combo,
  level,
  timeLeft,
  activePowerup,
  onScoreChange,
  onLivesChange,
  onComboChange,
  onLevelChange,
  onTimeChange,
  onPowerupChange,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable game state kept in refs for high-performance 60FPS canvas loop
  const stateRef = useRef({
    px: 0,
    tx: 0,
    py: 0,
    scale: 1,
    heightScale: 1,
    mood: 'n' as CharacterMood,
    moodTimer: 0,
    shake: 0,
    flash: 0,
    spawnTimer: 0,
    timeAcc: 0,
    items: [] as FallingItem[],
    particles: [] as Particle[],
    pops: [] as FloatingPop[],
    clouds: [] as Cloud[],
    keys: {} as Record<string, boolean>,
    nextItemId: 1,
    nextPopId: 1,
    caughtCount: 0,
    peakCombo: 0,
    // Prop syncs
    isPlaying,
    isPaused,
    gameMode,
    characterSkinId,
    basketSkinId,
    score,
    lives,
    combo,
    level,
    timeLeft,
    activePowerup,
  });

  // Keep stateRef in sync with React props
  useEffect(() => {
    stateRef.current.isPlaying = isPlaying;
    stateRef.current.isPaused = isPaused;
    stateRef.current.gameMode = gameMode;
    stateRef.current.characterSkinId = characterSkinId;
    stateRef.current.basketSkinId = basketSkinId;
    stateRef.current.score = score;
    stateRef.current.lives = lives;
    stateRef.current.combo = combo;
    stateRef.current.level = level;
    stateRef.current.timeLeft = timeLeft;
    stateRef.current.activePowerup = activePowerup;
  }, [isPlaying, isPaused, gameMode, characterSkinId, basketSkinId, score, lives, combo, level, timeLeft, activePowerup]);

  // Setup initial clouds
  useEffect(() => {
    const clouds: Cloud[] = [];
    for (let i = 0; i < 6; i++) {
      clouds.push({
        x: i * 220,
        y: 40 + Math.random() * 160,
        scale: 0.65 + Math.random() * 0.7,
        speed: 8 + Math.random() * 14,
      });
    }
    stateRef.current.clouds = clouds;
  }, []);

  // Reset internal game loop counters when game restarts
  useEffect(() => {
    if (isPlaying) {
      stateRef.current.items = [];
      stateRef.current.particles = [];
      stateRef.current.pops = [];
      stateRef.current.mood = 'n';
      stateRef.current.moodTimer = 0;
      stateRef.current.shake = 0;
      stateRef.current.flash = 0;
      stateRef.current.spawnTimer = 0.3;
      stateRef.current.timeAcc = 0;
      stateRef.current.caughtCount = 0;
      stateRef.current.peakCombo = 0;
    }
  }, [isPlaying]);

  // Resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;

      const s = Math.max(0.65, Math.min(1.15, Math.min(w, h * 0.75) / 520));
      const k = Math.max(0.75, Math.min(1.25, h / 700));

      stateRef.current.scale = s;
      stateRef.current.heightScale = k;
      stateRef.current.py = h - 130 * s;

      if (!stateRef.current.px) {
        stateRef.current.px = w / 2;
        stateRef.current.tx = w / 2;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Controls (Pointer + Keyboard)
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      stateRef.current.tx = e.clientX;
    };

    const handlePointerDown = (e: PointerEvent) => {
      stateRef.current.tx = e.clientX;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key] = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Helper functions for particles and text pops
  const addPop = (text: string, color: string, x: number, y: number, scale = 1) => {
    stateRef.current.pops.push({
      id: stateRef.current.nextPopId++,
      text,
      color,
      x,
      y,
      life: 1,
      scale,
    });
  };

  const addBurst = (
    n: number,
    colors: string[],
    speed: number,
    type: 'spark' | 'cloud' | 'star' | 'heart',
    life: number,
    originX?: number,
    originY?: number
  ) => {
    const s = stateRef.current;
    const ox = originX ?? s.px;
    const oy = originY ?? s.py;

    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const sp = (0.3 + Math.random() * 0.7) * speed;
      s.particles.push({
        x: ox,
        y: oy,
        vx: Math.cos(angle) * sp,
        vy: Math.sin(angle) * sp - (type === 'cloud' ? 40 : 0),
        life,
        maxLife: life,
        radius: 4 + Math.random() * 9,
        color: colors[i % colors.length],
        type,
      });
    }
  };

  // Main Game Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const s = stateRef.current;
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(loop);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Update game state if running and not paused
      if (s.isPlaying && !s.isPaused) {
        // Keyboard controls
        if (s.keys['ArrowLeft'] || s.keys['a'] || s.keys['A']) {
          s.tx -= 720 * dt;
        }
        if (s.keys['ArrowRight'] || s.keys['d'] || s.keys['D']) {
          s.tx += 720 * dt;
        }

        // Clamp target position
        s.tx = Math.max(50, Math.min(w - 50, s.tx));

        // Smooth position interpolation
        s.px += (s.tx - s.px) * Math.min(1, dt * 20);

        // Power-up timer countdown
        if (s.activePowerup) {
          const newDur = s.activePowerup.duration - dt;
          if (newDur <= 0) {
            onPowerupChange(null);
            s.activePowerup = null;
          } else {
            s.activePowerup.duration = newDur;
          }
        }

        // Timed mode countdown
        if (s.gameMode === 'timed') {
          s.timeAcc += dt;
          if (s.timeAcc >= 1) {
            s.timeAcc -= 1;
            const newT = s.timeLeft - 1;
            onTimeChange(newT);
            s.timeLeft = newT;
            if (newT <= 0) {
              // Time over!
              sounds.gameOver();
              onGameOver(s.score, s.caughtCount, s.peakCombo);
            }
          }
        }

        // Mood timers & screenshake
        s.moodTimer -= dt;
        if (s.moodTimer <= 0) s.mood = 'n';
        s.shake -= dt;
        s.flash -= dt;

        // Queasy cloud emission when sick
        if (s.mood === 's' && Math.random() < dt * 16) {
          addBurst(1, ['#8bc34a', '#9ccc65'], 35, 'cloud', 1.2, s.px, s.py - 10 * s.scale);
        }

        // Star power rainbow emission
        if (s.activePowerup?.type === 'star' && Math.random() < dt * 25) {
          addBurst(1, ['#ff4d4d', '#ffca28', '#29b6f6', '#ab47bc'], 60, 'star', 0.6, s.px + (Math.random() - 0.5) * 60, s.py + 40);
        }

        // Item Spawning
        s.spawnTimer -= dt;
        if (s.spawnTimer <= 0) {
          // Determine spawn rate based on level & frenzy mode
          let baseDelay = Math.max(0.38, 0.9 - s.level * 0.05);
          if (s.gameMode === 'frenzy') {
            baseDelay = Math.max(0.24, 0.55 - s.level * 0.035);
          }
          if (s.activePowerup?.type === 'slow') {
            baseDelay *= 1.4;
          }
          s.spawnTimer = baseDelay;

          // Spawn item
          const rand = Math.random();
          let itemCategory: FallingItem['category'] = 'fruit';
          let itemEmoji = '🍎';
          let itemName = 'Apel';
          let itemPoints = 10;
          let isPowerup = false;
          let powerupType: FallingItem['powerupType'];

          // 6% chance for powerup
          if (rand < 0.06) {
            const p = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
            itemCategory = 'powerup';
            itemEmoji = p.e;
            itemName = p.n;
            itemPoints = 25;
            isPowerup = true;
            powerupType = p.type;
          } else if (rand < 0.36) {
            const f = FRUITS[Math.floor(Math.random() * FRUITS.length)];
            itemCategory = 'fruit';
            itemEmoji = f.e;
            itemName = f.n;
            itemPoints = f.p;
          } else if (rand < 0.62) {
            const v = VEGGIES[Math.floor(Math.random() * VEGGIES.length)];
            itemCategory = 'veg';
            itemEmoji = v.e;
            itemName = v.n;
            itemPoints = v.p;
          } else if (rand < 0.78) {
            const m = MEATS[Math.floor(Math.random() * MEATS.length)];
            itemCategory = 'meat';
            itemEmoji = m.e;
            itemName = m.n;
            itemPoints = m.p;
          } else if (rand < 0.90) {
            itemCategory = 'poop';
            itemEmoji = '💩';
            itemName = 'Kotoran';
            itemPoints = -10;
          } else {
            itemCategory = 'bomb';
            itemEmoji = '💣';
            itemName = 'Bom';
            itemPoints = 0;
          }

          // Falling speed
          let speedBase = (Math.min(130 + s.level * 28, 450) + Math.random() * 45) * s.heightScale;
          if (s.gameMode === 'frenzy') {
            speedBase *= 1.25;
          }

          s.items.push({
            id: s.nextItemId++,
            category: itemCategory,
            emoji: itemEmoji,
            name: itemName,
            points: itemPoints,
            x: 40 + Math.random() * (w - 80),
            y: -50,
            speed: speedBase,
            rotation: Math.random() * 6,
            rotationSpeed: (Math.random() - 0.5) * 3,
            isPowerup,
            powerupType,
          });
        }

        // Update items (fall & hit detection)
        const hitBasketY = s.py + 45 * s.scale;
        const hitWidth = 62 * s.scale;

        const effectiveDt = s.activePowerup?.type === 'slow' ? dt * 0.55 : dt;

        for (let i = s.items.length - 1; i >= 0; i--) {
          const item = s.items[i];

          // Magnet powerup pull
          if (s.activePowerup?.type === 'magnet' && (item.category === 'fruit' || item.category === 'veg' || item.category === 'meat' || item.category === 'powerup')) {
            const dx = s.px - item.x;
            item.x += dx * Math.min(1, dt * 5.5);
          }

          item.y += item.speed * effectiveDt;
          item.rotation += item.rotationSpeed * effectiveDt;

          // Check catch collision with basket
          if (
            item.y >= hitBasketY - 25 * s.scale &&
            item.y <= hitBasketY + 45 * s.scale &&
            Math.abs(item.x - s.px) < hitWidth
          ) {
            // Caught!
            s.items.splice(i, 1);
            s.caughtCount++;

            // Handle catch logic
            if (item.category === 'powerup') {
              sounds.powerup();
              addBurst(18, ['#ffeb3b', '#00e5ff', '#ff4081', '#fff'], 220, 'star', 0.8, s.px, hitBasketY);

              if (item.powerupType === 'star') {
                const buff: ActivePowerup = { type: 'star', duration: 7, maxDuration: 7 };
                s.activePowerup = buff;
                onPowerupChange(buff);
                addPop('⭐ Bintang Kebal (2x Skor)!', '#ffd600', s.px, s.py - 70 * s.scale, 1.2);
              } else if (item.powerupType === 'magnet') {
                const buff: ActivePowerup = { type: 'magnet', duration: 6, maxDuration: 6 };
                s.activePowerup = buff;
                onPowerupChange(buff);
                addPop('🧲 Magnet Makanan Aktif!', '#29b6f6', s.px, s.py - 70 * s.scale, 1.2);
              } else if (item.powerupType === 'slow') {
                const buff: ActivePowerup = { type: 'slow', duration: 6, maxDuration: 6 };
                s.activePowerup = buff;
                onPowerupChange(buff);
                addPop('⏰ Waktu Diperlambat!', '#00e676', s.px, s.py - 70 * s.scale, 1.2);
              } else if (item.powerupType === 'heart') {
                if (s.lives < 3) {
                  const newLives = s.lives + 1;
                  s.lives = newLives;
                  onLivesChange(newLives);
                  addPop('💖 +1 Nyawa!', '#ff4081', s.px, s.py - 70 * s.scale, 1.3);
                } else {
                  const bonus = 50;
                  const newScore = s.score + bonus;
                  s.score = newScore;
                  onScoreChange(newScore, bonus);
                  addPop('💖 Darah Penuh! +50', '#ff4081', s.px, s.py - 70 * s.scale, 1.2);
                }
              }
              continue;
            }

            if (item.category === 'fruit' || item.category === 'veg' || item.category === 'meat') {
              // Good food catch
              const newCombo = s.combo + 1;
              s.combo = newCombo;
              onComboChange(newCombo);
              if (newCombo > s.peakCombo) s.peakCombo = newCombo;

              // Combo multiplier & Star multiplier
              let multiplier = 1;
              if (newCombo >= 15) multiplier = 3;
              else if (newCombo >= 5) multiplier = 2;

              if (s.activePowerup?.type === 'star') {
                multiplier *= 2;
              }

              const pts = item.points * multiplier;
              const newScore = s.score + pts;
              s.score = newScore;
              onScoreChange(newScore, pts);

              s.mood = item.category === 'meat' ? 'l' : 'h';
              s.moodTimer = 0.55;

              sounds.yummy();
              if (newCombo % 5 === 0) {
                sounds.combo(newCombo);
              }

              addBurst(10, ['#ffd23f', '#fff', '#ff9800'], 140, 'spark', 0.5, s.px, hitBasketY);

              // Floating message
              const compliments = ['Yummy! 😋', 'Nyam! 👍', 'Sedap! ✨', 'Hore! 🎉', 'Mantap! 🔥'];
              const praise = compliments[Math.floor(Math.random() * compliments.length)];
              const comboSuffix = multiplier > 1 ? ` (x${multiplier})` : '';
              addPop(`${praise} +${pts}${comboSuffix}`, '#ff8a00', s.px, s.py - 60 * s.scale);

              // Level up check (every 100 points)
              const newLevel = Math.floor(newScore / 100);
              if (newLevel > s.level) {
                s.level = newLevel;
                onLevelChange(newLevel);
                sounds.levelUp();
                addPop(`Level Naik! Lv.${newLevel + 1} 🚀`, '#7b3ff2', s.px, s.py - 100 * s.scale, 1.3);
                addBurst(25, ['#7b3ff2', '#00e5ff', '#ffd600', '#ff4081'], 240, 'star', 0.9, s.px, s.py);
              }
            } else if (item.category === 'poop') {
              // Star invincibility deflects poop
              if (s.activePowerup?.type === 'star') {
                sounds.bonusCatch();
                const bonus = 20;
                const newScore = s.score + bonus;
                s.score = newScore;
                onScoreChange(newScore, bonus);
                addBurst(14, ['#ffd600', '#fff'], 160, 'star', 0.6, s.px, hitBasketY);
                addPop('Kebal! Kotoran Dilenyapkan! +20', '#ffd600', s.px, s.py - 60 * s.scale);
                continue;
              }

              // Bad poop catch
              s.combo = 0;
              onComboChange(0);

              const penalty = 10;
              const newScore = Math.max(0, s.score - penalty);
              s.score = newScore;
              onScoreChange(newScore, -penalty);

              s.mood = 's';
              s.moodTimer = 1.4;
              s.shake = 0.4;

              sounds.eww();
              addBurst(16, ['#8bc34a', '#a5d64a', '#6fa832', '#795548'], 80, 'cloud', 1.4, s.px, hitBasketY);

              const ewws = ['Iiih, bau! 🤢', 'Ewwww! 🪰', 'Uwekk! 🤮', 'Kena tumpahan! 💩'];
              const text = ewws[Math.floor(Math.random() * ewws.length)];
              addPop(`${text} -10`, '#5a8f1c', s.px, s.py - 60 * s.scale);
            } else if (item.category === 'bomb') {
              // Star invincibility explodes bomb safely into coins!
              if (s.activePowerup?.type === 'star') {
                sounds.bonusCatch();
                const bonus = 50;
                const newScore = s.score + bonus;
                s.score = newScore;
                onScoreChange(newScore, bonus);
                addBurst(20, ['#ffd600', '#ff9800', '#fff'], 250, 'spark', 0.7, s.px, hitBasketY);
                addPop('⭐ Bintang Menjinakkan Bom! +50', '#ffd600', s.px, s.py - 70 * s.scale, 1.2);
                continue;
              }

              // Normal bomb hit!
              s.combo = 0;
              onComboChange(0);

              s.mood = 'b';
              s.moodTimer = 1.6;
              s.shake = 0.65;
              s.flash = 0.28;

              sounds.boom();
              addBurst(38, ['#ff4d4d', '#ffa63d', '#ffe14d', '#ff7bd5', '#7bd8ff'], 360, 'spark', 0.85, s.px, hitBasketY);
              addPop('DUAR! 💥 Kena Bom!', '#e53935', s.px, s.py - 70 * s.scale, 1.3);

              if (s.gameMode === 'timed') {
                // In timed mode, bombs deduct 30 points instead of instant lives
                const newScore = Math.max(0, s.score - 30);
                s.score = newScore;
                onScoreChange(newScore, -30);
              } else {
                const newLives = s.lives - 1;
                s.lives = newLives;
                onLivesChange(newLives);

                if (newLives <= 0) {
                  // Game Over
                  sounds.gameOver();
                  onGameOver(s.score, s.caughtCount, s.peakCombo);
                }
              }
            }

            continue;
          }

          // Out of screen at bottom
          if (item.y > h + 60) {
            s.items.splice(i, 1);
          }
        }
      }

      // Update particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.type === 'cloud') {
          p.vy -= 22 * dt;
        }
        if (p.life <= 0) {
          s.particles.splice(i, 1);
        }
      }

      // Update text pops
      for (let i = s.pops.length - 1; i >= 0; i--) {
        const pop = s.pops[i];
        pop.life -= dt * 0.9;
        pop.y -= 48 * dt;
        if (pop.life <= 0) {
          s.pops.splice(i, 1);
        }
      }

      // Update clouds
      s.clouds.forEach((c) => {
        c.x += c.speed * dt;
        if (c.x > w + 160) {
          c.x = -180;
          c.y = 40 + Math.random() * 160;
        }
      });

      // -------------------------------------------------------------
      // RENDERING CANVAS
      // -------------------------------------------------------------
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Sky Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      if (s.activePowerup?.type === 'star') {
        grad.addColorStop(0, '#7986cb');
        grad.addColorStop(0.5, '#ba68c8');
        grad.addColorStop(1, '#ffb74d');
      } else if (s.mood === 'b') {
        grad.addColorStop(0, '#546e7a');
        grad.addColorStop(1, '#cfd8dc');
      } else {
        grad.addColorStop(0, '#5ec2ff');
        grad.addColorStop(1, '#d6f1ff');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Sun in the sky
      ctx.save();
      ctx.fillStyle = '#fff4a3';
      ctx.beginPath();
      ctx.arc(w - 70, 70, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      s.clouds.forEach((c) => {
        const parts = [
          [0, 0, 34],
          [34, 6, 26],
          [-34, 8, 24],
          [12, -14, 24],
        ];
        parts.forEach(([ox, oy, r]) => {
          ctx.beginPath();
          ctx.arc(c.x + ox * c.scale, c.y + oy * c.scale, r * c.scale, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // Grassy Ground with cute layered hill lines
      const groundH = 40 * s.scale;
      ctx.fillStyle = '#66bb6a';
      ctx.beginPath();
      ctx.moveTo(0, h - groundH);
      ctx.quadraticCurveTo(w * 0.5, h - groundH - 12, w, h - groundH);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      ctx.fillStyle = '#4caf50';
      ctx.fillRect(0, h - groundH * 0.5, w, groundH * 0.5);

      // Screenshake transform
      ctx.save();
      if (s.shake > 0) {
        ctx.translate((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12);
      }

      // Render Falling Items
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const itemFontSize = Math.round(48 * s.scale);
      ctx.font = `${itemFontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif`;

      s.items.forEach((it) => {
        ctx.save();
        ctx.translate(it.x, it.y);
        ctx.rotate(it.rotation * 0.25);

        // Power-up glow
        if (it.isPowerup) {
          ctx.save();
          ctx.shadowColor = '#ffd600';
          ctx.shadowBlur = 18;
          ctx.fillText(it.emoji, 0, 0);
          ctx.restore();
        } else {
          ctx.fillText(it.emoji, 0, 0);
        }

        ctx.restore();
      });

      // Render Character + Basket
      const charScale = s.scale;
      ctx.save();
      ctx.translate(s.px, s.py + Math.sin(now * 0.006) * 3 * charScale);
      ctx.scale(charScale, charScale);

      // Draw custom face
      drawCharacterFace(ctx, s.mood, now * 0.001, s.characterSkinId);
      ctx.restore();

      // Render Basket Emoji
      const basketEmoji = BASKET_EMOJIS[s.basketSkinId] || '🧺';
      ctx.save();
      ctx.translate(s.px, s.py + 58 * charScale);
      const basketFontSize = Math.round(62 * charScale);
      ctx.font = `${basketFontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Star rainbow aura around basket when star active
      if (s.activePowerup?.type === 'star') {
        ctx.save();
        ctx.shadowColor = '#ffd600';
        ctx.shadowBlur = 24;
        ctx.fillText(basketEmoji, 0, 0);
        ctx.restore();
      } else {
        ctx.fillText(basketEmoji, 0, 0);
      }
      ctx.restore();

      // Render Particles
      s.particles.forEach((p) => {
        const alpha = Math.max(p.life / p.maxLife, 0);
        ctx.globalAlpha = p.type === 'cloud' ? alpha * 0.6 : alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        const r = p.radius * (p.type === 'cloud' ? 2 - alpha : 1);
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Render Floating Text Pops
      const popFontBase = Math.round(26 * Math.max(s.scale, 0.85));
      ctx.lineWidth = 5;
      ctx.lineJoin = 'round';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      s.pops.forEach((pop) => {
        const alpha = Math.min(1, pop.life * 1.8);
        ctx.globalAlpha = alpha;
        const currentSize = Math.round(popFontBase * (pop.scale || 1));
        ctx.font = `bold ${currentSize}px 'Fredoka', 'Arial Rounded MT Bold', sans-serif`;

        ctx.strokeStyle = '#ffffff';
        ctx.strokeText(pop.text, pop.x, pop.y);
        ctx.fillStyle = pop.color;
        ctx.fillText(pop.text, pop.x, pop.y);
      });
      ctx.globalAlpha = 1;

      ctx.restore(); // end shake

      // Screen flash for bombs
      if (s.flash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, s.flash * 3)})`;
        ctx.fillRect(0, 0, w, h);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-auto touch-none"
    />
  );
};

// -------------------------------------------------------------
// PROCEDURAL CHARACTER RENDERING
// Supports skin tone, hair, blushing cheeks, expressions, skins
// -------------------------------------------------------------
function drawCharacterFace(
  x: CanvasRenderingContext2D,
  mood: CharacterMood,
  timeSec: number,
  skinId: string
) {
  const isBad = mood === 'b';
  const isSick = mood === 's';
  const isHappy = mood === 'h' || mood === 'l';

  const skinTone = isBad ? '#3a3a3a' : isSick ? '#b5e86a' : '#ffd7b0';
  const outlineColor = isBad ? '#fff' : '#3b2314';

  x.lineCap = 'round';
  x.lineWidth = 3;
  x.strokeStyle = outlineColor;

  // Shoes / feet
  x.fillStyle = '#333';
  [-1, 1].forEach((s) => {
    x.beginPath();
    x.ellipse(s * 12, 86, 9, 5, 0, 0, Math.PI * 2);
    x.fill();
  });

  // Torso / Shirt
  let shirtColor = isBad ? '#222' : '#ff7043';
  if (skinId === 'siti') shirtColor = '#ec407a';
  if (skinId === 'dino') shirtColor = '#26a69a';
  if (skinId === 'kucing') shirtColor = '#ffb300';

  x.fillStyle = shirtColor;
  x.beginPath();
  x.ellipse(0, 58, 27, 30, 0, 0, Math.PI * 2);
  x.fill();
  x.stroke();

  // Hands / Arms
  x.fillStyle = skinTone;
  [-1, 1].forEach((s) => {
    x.beginPath();
    x.arc(s * 30, isHappy ? 36 : 52, 9, 0, Math.PI * 2);
    x.fill();
    x.stroke();
  });

  // Hair Back
  let hairColor = '#5b3a29';
  if (skinId === 'siti') hairColor = '#2d1b11';
  if (skinId === 'dino') hairColor = '#8d6e63';
  if (skinId === 'kucing') hairColor = '#fff3e0';

  if (isBad) {
    // Spiky shocked hair when bombed
    x.strokeStyle = '#000';
    x.lineWidth = 6;
    for (let i = -2; i <= 2; i++) {
      x.beginPath();
      x.moveTo(i * 11, -28);
      x.lineTo(i * 17, -62 + Math.abs(i) * 5);
      x.stroke();
    }
    x.strokeStyle = outlineColor;
    x.lineWidth = 3;
  } else {
    x.fillStyle = hairColor;
    x.beginPath();
    x.arc(0, -4, 38, 0, Math.PI * 2);
    x.fill();
  }

  // Ears
  x.fillStyle = skinTone;
  [-1, 1].forEach((s) => {
    x.beginPath();
    x.arc(s * 34, 2, 7, 0, Math.PI * 2);
    x.fill();
    x.stroke();
  });

  // Head Circle
  x.fillStyle = skinTone;
  x.beginPath();
  x.arc(0, 0, 34, 0, Math.PI * 2);
  x.fill();
  x.stroke();

  // Front Hair / Accessories based on skin
  if (!isBad) {
    x.fillStyle = hairColor;
    x.beginPath();
    x.ellipse(0, -12, 34, 22, 0, Math.PI, Math.PI * 2);
    x.fill();

    if (skinId === 'siti') {
      // Pigtails & pink ribbon
      [-1, 1].forEach((s) => {
        x.fillStyle = hairColor;
        x.beginPath();
        x.arc(s * 36, -20, 12, 0, Math.PI * 2);
        x.fill();
        x.fillStyle = '#ff4081';
        x.beginPath();
        x.arc(s * 32, -26, 6, 0, Math.PI * 2);
        x.fill();
      });
    } else if (skinId === 'dino') {
      // Adventurer cap
      x.fillStyle = '#558b2f';
      x.beginPath();
      x.ellipse(0, -28, 38, 14, 0, 0, Math.PI * 2);
      x.fill();
      x.fillRect(-22, -42, 44, 18);
      x.fillStyle = '#33691e';
      x.fillRect(-22, -28, 44, 4);
    } else if (skinId === 'kucing') {
      // Cat ears
      [-1, 1].forEach((s) => {
        x.fillStyle = '#ff9800';
        x.beginPath();
        x.moveTo(s * 14, -30);
        x.lineTo(s * 32, -50);
        x.lineTo(s * 34, -24);
        x.closePath();
        x.fill();
        x.stroke();
        // Inner pink ear
        x.fillStyle = '#ff80ab';
        x.beginPath();
        x.moveTo(s * 18, -30);
        x.lineTo(s * 28, -44);
        x.lineTo(s * 30, -26);
        x.closePath();
        x.fill();
      });
    } else {
      // Budi - Cute classic hair tuft
      x.beginPath();
      x.arc(0, -40, 8, 0, Math.PI * 2);
      x.fill();
    }

    // Rosy Blushing Cheeks
    if (!isSick) {
      x.fillStyle = 'rgba(255, 105, 135, 0.45)';
      [-1, 1].forEach((s) => {
        x.beginPath();
        x.arc(s * 20, 12, 6, 0, Math.PI * 2);
        x.fill();
      });
    }
  }

  // Eyes
  [-1, 1].forEach((s) => {
    const ex = s * 13;
    const ey = 0;
    x.lineWidth = 2.5;
    x.strokeStyle = outlineColor;

    if (isHappy) {
      // Happy curved arcs ^_^
      x.beginPath();
      x.arc(ex, ey + 3, 6, Math.PI * 1.1, Math.PI * 1.9);
      x.stroke();
    } else if (isSick) {
      // Dizzy spiral eyes
      x.beginPath();
      for (let a = 0; a < 12; a += 0.3) {
        const r = a * 0.6;
        x.lineTo(ex + Math.cos(a + timeSec * 10) * r, ey + Math.sin(a + timeSec * 10) * r);
      }
      x.stroke();
    } else if (isBad) {
      // Shocked wide eyes
      x.fillStyle = '#fff';
      x.beginPath();
      x.arc(ex, ey, 8, 0, Math.PI * 2);
      x.fill();
      x.stroke();
      x.fillStyle = '#000';
      x.beginPath();
      x.arc(ex, ey, 3, 0, Math.PI * 2);
      x.fill();
    } else {
      // Normal cute eyes with light reflection
      x.fillStyle = outlineColor;
      x.beginPath();
      x.arc(ex, ey, 5.5, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = '#fff';
      x.beginPath();
      x.arc(ex + 1.8, ey - 1.8, 2, 0, Math.PI * 2);
      x.fill();
    }
  });

  // Mouth Expressions
  x.strokeStyle = outlineColor;
  x.lineWidth = 3;
  x.beginPath();

  if (mood === 'h') {
    // Open joyful mouth with tongue
    x.fillStyle = '#e0405a';
    x.arc(0, 14, 11, 0, Math.PI);
    x.closePath();
    x.fill();
    x.stroke();
  } else if (mood === 'l') {
    // Licking mouth with animated pink tongue
    x.arc(0, 13, 9, 0.2, Math.PI - 0.2);
    x.stroke();
    x.fillStyle = '#ff7aa2';
    x.beginPath();
    x.ellipse(6, 25 + Math.sin(timeSec * 20) * 1.5, 5, 7, 0, 0, Math.PI * 2);
    x.fill();
    x.stroke();
  } else if (isSick) {
    // Queasy zigzag mouth + green bubble
    x.moveTo(-11, 25);
    for (let i = 1; i <= 4; i++) {
      x.lineTo(-11 + i * 5.5, 25 + (i % 2 ? -4 : 4));
    }
    x.stroke();

    x.fillStyle = skinTone;
    x.beginPath();
    x.arc(0, 9, 9, 0, Math.PI * 2);
    x.fill();
    x.stroke();
    x.beginPath();
    x.moveTo(-5, 6);
    x.lineTo(5, 6);
    x.stroke();
  } else if (isBad) {
    // Shocked circle mouth :O
    x.arc(0, 24, 7, 0, Math.PI * 2);
    x.stroke();
  } else {
    // Gentle smiling mouth :)
    x.arc(0, 10, 9, 0.25, Math.PI - 0.25);
    x.stroke();
  }
}
