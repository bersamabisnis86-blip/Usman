/**
 * Web Audio API synthesizer for 'Tangkap Si Jatuh!'
 * Clean procedural audio with zero external asset latency.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmPlaying: boolean = false;
  private bgmInterval: number | null = null;
  private bgmStep: number = 0;

  constructor() {
    // Check saved mute pref
    try {
      this.isMuted = localStorage.getItem('tsj_muted') === 'true';
    } catch {
      this.isMuted = false;
    }
  }

  public init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('AudioContext init failed', e);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('tsj_muted', String(this.isMuted));
    } catch {
      // ignore
    }
    if (this.isMuted) {
      this.stopBGM();
    }
    return this.isMuted;
  }

  private tone(
    f1: number,
    f2: number,
    duration: number,
    type: OscillatorType = 'sine',
    vol: number = 0.15,
    delay: number = 0
  ) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(f1, t);
      if (f2 !== f1) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(f2, 10), t + duration);
      }

      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {
      // Audio error catch
    }
  }

  public yummy() {
    this.tone(520, 880, 0.1, 'sine', 0.18);
    this.tone(740, 1180, 0.12, 'sine', 0.15, 0.08);
  }

  public bonusCatch() {
    this.tone(600, 1200, 0.08, 'triangle', 0.2);
    this.tone(900, 1500, 0.1, 'sine', 0.2, 0.06);
    this.tone(1200, 1800, 0.12, 'sine', 0.2, 0.12);
  }

  public eww() {
    this.tone(320, 90, 0.45, 'sawtooth', 0.14);
    this.tone(200, 60, 0.35, 'triangle', 0.15, 0.08);
    if ('vibrate' in navigator) {
      try { navigator.vibrate(100); } catch {}
    }
  }

  public boom() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * 0.45);
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();

      // Deep sub-impact
      this.tone(140, 35, 0.4, 'sine', 0.3);

      if ('vibrate' in navigator) {
        try { navigator.vibrate([150, 50, 150]); } catch {}
      }
    } catch {
      // ignore
    }
  }

  public levelUp() {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.tone(freq, freq * 1.02, 0.15, 'square', 0.08, idx * 0.09);
    });
  }

  public gameOver() {
    const notes = [440, 415, 392, 330];
    notes.forEach((freq, idx) => {
      this.tone(freq, freq * 0.95, 0.25, 'triangle', 0.18, idx * 0.18);
    });
  }

  public powerup() {
    const freqs = [659, 784, 988, 1318];
    freqs.forEach((freq, idx) => {
      this.tone(freq, freq, 0.12, 'sine', 0.15, idx * 0.06);
    });
  }

  public combo(streak: number) {
    const base = 440 * Math.pow(1.05946, Math.min(streak, 12));
    this.tone(base, base * 1.2, 0.12, 'sine', 0.15);
  }

  public buttonClick() {
    this.tone(800, 1000, 0.04, 'sine', 0.08);
  }

  // Optional background cheerful arcade chip loop
  public startBGM() {
    if (this.isMuted || this.bgmPlaying) return;
    this.init();
    this.bgmPlaying = true;
    this.bgmStep = 0;

    // Upbeat pentatonic playful melody
    const melody = [
      523.25, 0, 659.25, 523.25,
      783.99, 0, 659.25, 0,
      880.00, 783.99, 659.25, 523.25,
      587.33, 0, 783.99, 0
    ];

    if (this.bgmInterval) window.clearInterval(this.bgmInterval);
    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.bgmPlaying) return;
      const note = melody[this.bgmStep % melody.length];
      if (note > 0) {
        this.tone(note, note, 0.08, 'sine', 0.035);
      }
      // Light bass accompaniment on quarter beats
      if (this.bgmStep % 4 === 0) {
        this.tone(130.81, 130.81, 0.12, 'triangle', 0.04);
      }
      this.bgmStep++;
    }, 180);
  }

  public stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmInterval) {
      window.clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public isBgmActive(): boolean {
    return this.bgmPlaying;
  }
}

export const sounds = new SoundEngine();
