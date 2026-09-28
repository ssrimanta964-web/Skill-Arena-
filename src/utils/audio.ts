// Web Audio API Synthesizer for SkillArena
// Zero external asset dependencies - ultra-low latency & works offline 100%

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = false;
  private soundVolume: number = 0.7;
  private musicVolume: number = 0.3;
  private musicInterval: number | null = null;
  private musicStep: number = 0;

  constructor() {
    // AudioContext will be initialized on first user gesture to comply with browser autoplay policy
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public updateSettings(settings: {
    soundEnabled: boolean;
    soundVolume: number;
    musicEnabled: boolean;
    musicVolume: number;
  }) {
    this.soundEnabled = settings.soundEnabled;
    this.soundVolume = settings.soundVolume;
    this.musicEnabled = settings.musicEnabled;
    this.musicVolume = settings.musicVolume;

    if (!this.musicEnabled && this.musicInterval !== null) {
      this.stopMusic();
    } else if (this.musicEnabled && this.musicInterval === null) {
      this.startMusic();
    }
  }

  public playClick(freq = 800) {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.25 * this.soundVolume, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // AudioContext safe fail
    }
  }

  public playCountdown(isFinal = false) {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = isFinal ? 880 : 440;
      osc.type = isFinal ? 'square' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const dur = isFinal ? 0.35 : 0.15;
      gain.gain.setValueAtTime(0.3 * this.soundVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {}
  }

  public playSuccess() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.2 * this.soundVolume, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.2);
      });
    } catch {}
  }

  public playFail() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);

      gain.gain.setValueAtTime(0.3 * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  public playCombo(comboCount: number) {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const baseFreq = 440;
      const pitch = Math.min(baseFreq * Math.pow(1.06, comboCount), 1800);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);

      gain.gain.setValueAtTime(0.2 * this.soundVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public playGunshot() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Transient noise crack
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1200, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.1);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4 * this.soundVolume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);

      // 2. Heavy low punch oscillator
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

      oscGain.gain.setValueAtTime(0.5 * this.soundVolume, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  public playEmptyClick() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

      gain.gain.setValueAtTime(0.2 * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {}
  }

  public playSimonTone(toneIndex: number, duration = 0.3) {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      // Classic Simon frequencies: 415Hz (G#4), 310Hz (D#4), 252Hz (B3), 209Hz (G#3)
      const freqs = [329.63, 440.0, 554.37, 659.25];
      const freq = freqs[toneIndex % freqs.length];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.25 * this.soundVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  public playLevelUp() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Majestic chord arpeggio
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.25 * this.soundVolume, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch {}
  }

  public vibrate(ms = 35) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch {}
    }
  }

  // Soft procedural ambient lo-fi synthesizer background loop
  public startMusic() {
    if (!this.musicEnabled) return;
    if (this.musicInterval !== null) return;

    const chords = [
      [220, 261.63, 329.63, 392], // Am7
      [174.61, 220, 261.63, 329.63], // Fmaj7
      [130.81, 164.81, 196, 246.94], // Cmaj7
      [196, 246.94, 293.66, 349.23], // G7
    ];

    this.musicStep = 0;
    const playChord = () => {
      if (!this.musicEnabled) return;
      const ctx = this.initCtx();
      if (!ctx) return;

      const chord = chords[this.musicStep % chords.length];
      this.musicStep++;

      const now = ctx.currentTime;
      chord.forEach((freq) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.04 * this.musicVolume, now + 0.8);
          gain.gain.linearRampToValueAtTime(0.001, now + 2.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 2.9);
        } catch {}
      });
    };

    playChord();
    this.musicInterval = window.setInterval(playChord, 3000);
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundManager = new SoundManager();
