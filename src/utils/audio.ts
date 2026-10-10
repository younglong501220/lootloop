// Web Audio API Retro Sound Effects Engine

class RetroSoundFX {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.35;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted() {
    return this.isMuted;
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume() {
    return this.volume;
  }

  // Play a simple synthesized sound
  private playTone(freqs: number[], durations: number[], type: OscillatorType = 'sine', decay = 0.1) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      let startTime = now;

      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const dur = durations[idx] || 0.1;
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(this.volume * 0.5, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur + decay);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + dur + decay);

        startTime += dur;
      });
    } catch {
      // Audio might fail if user hasn't interacted with page
    }
  }

  // Sword attack / slice sound
  public playAttack() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // silent catch
    }
  }

  // Shield block / metallic deflection
  public playBlock() {
    if (this.isMuted) return;
    this.playTone([200, 320, 180], [0.03, 0.04, 0.05], 'square', 0.08);
  }

  // Hit taken / hurt sound
  public playHit() {
    this.playTone([160, 90], [0.06, 0.08], 'sawtooth', 0.05);
  }

  // Critical hit impact
  public playCrit() {
    this.playTone([350, 600, 880], [0.04, 0.05, 0.1], 'triangle', 0.12);
  }

  // Step movement tick
  public playStep() {
    this.playTone([150], [0.02], 'sine', 0.01);
  }

  // Potion drink / heal sparkle
  public playHeal() {
    this.playTone([400, 520, 660, 880], [0.05, 0.05, 0.06, 0.12], 'sine', 0.15);
  }

  // Chest open / Rare loot
  public playChest() {
    this.playTone([330, 440, 550, 660], [0.06, 0.06, 0.08, 0.18], 'triangle', 0.2);
  }

  // Pick up or move item in backpack
  public playItemPickup() {
    this.playTone([440, 560], [0.03, 0.04], 'sine', 0.02);
  }

  // Place item successfully
  public playItemPlace() {
    this.playTone([300, 420], [0.04, 0.05], 'triangle', 0.03);
  }

  // Rotate item
  public playRotate() {
    this.playTone([500, 400], [0.02, 0.03], 'square', 0.02);
  }

  // Synergy activated chime!
  public playSynergy() {
    this.playTone([523.25, 659.25, 783.99, 1046.5], [0.06, 0.06, 0.07, 0.2], 'sine', 0.25);
  }

  // Active skill rune cast burst!
  public playSkillCast() {
    this.playTone([330, 494, 659, 988], [0.04, 0.04, 0.06, 0.18], 'square', 0.15);
  }

  // Preset configuration loaded
  public playPresetApply() {
    this.playTone([440, 554, 659, 880], [0.05, 0.05, 0.07, 0.15], 'triangle', 0.18);
  }

  // Loop completed fanfare
  public playLoopComplete() {
    this.playTone([392, 523.25, 659.25, 783.99], [0.08, 0.08, 0.08, 0.28], 'triangle', 0.3);
  }

  // Game over death jingle
  public playGameOver() {
    this.playTone([300, 260, 220, 150], [0.15, 0.15, 0.18, 0.35], 'sawtooth', 0.4);
  }
}

export const soundFX = new RetroSoundFX();
