// Web Audio API Ringtone & Call Audio Synthesizer (Works 100% offline, zero external file dependencies)

class CallSoundManager {
  constructor() {
    this.ctx = null;
    this.outgoingRingInterval = null;
    this.incomingRingInterval = null;
  }

  _initCtx() {
    try {
      if (!this.ctx || this.ctx.state === "closed") {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch (e) {
      console.warn("AudioContext init warning:", e);
      return null;
    }
  }

  // Play realistic outgoing dialing ringback tone (440Hz + 480Hz US/UK phone cadence)
  startOutgoingRing() {
    this.stopAll();
    const ctx = this._initCtx();
    if (!ctx) return;

    const playBursts = () => {
      if (!this.ctx || this.ctx.state === "closed") return;
      try {
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.09, now + 0.08);
        gain.gain.setValueAtTime(0.09, now + 1.8);
        gain.gain.linearRampToValueAtTime(0.0001, now + 2.0);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 2.0);
        osc2.stop(now + 2.0);
      } catch (e) {
        console.warn("Outgoing ring sound error:", e);
      }
    };

    playBursts();
    this.outgoingRingInterval = setInterval(playBursts, 4000);
  }

  // Play pleasant incoming ringtone melody (glowing polyphonic harmonic chime)
  startIncomingRing() {
    this.stopAll();
    const ctx = this._initCtx();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25]; // C5, E5, G5, C6, G5, E5

    const playMelody = () => {
      if (!this.ctx || this.ctx.state === "closed") return;
      try {
        const baseTime = this.ctx.currentTime;
        notes.forEach((freq, idx) => {
          const startTime = baseTime + idx * 0.17;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.0001, startTime);
          gain.gain.linearRampToValueAtTime(0.12, startTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.32);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.34);
        });
      } catch (e) {
        console.warn("Incoming ring error:", e);
      }
    };

    playMelody();
    this.incomingRingInterval = setInterval(playMelody, 2200);
  }

  // Play connect chime when user accepts
  playConnectChime() {
    this.stopAll();
    const ctx = this._initCtx();
    if (!ctx) return;
    try {
      const baseTime = ctx.currentTime;
      [587.33, 880].forEach((freq, i) => {
        const startTime = baseTime + i * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.26);
      });
    } catch (e) {}
  }

  // Play disconnect tone when call ends
  playDisconnectTone() {
    this.stopAll();
    const ctx = this._initCtx();
    if (!ctx) return;
    try {
      const baseTime = ctx.currentTime;
      [440, 370, 311].forEach((freq, i) => {
        const startTime = baseTime + i * 0.11;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.15);
      });
    } catch (e) {}
  }

  // Stop all active ringtones
  stopAll() {
    if (this.outgoingRingInterval) {
      clearInterval(this.outgoingRingInterval);
      this.outgoingRingInterval = null;
    }
    if (this.incomingRingInterval) {
      clearInterval(this.incomingRingInterval);
      this.incomingRingInterval = null;
    }
  }

  stopAllSounds() {
    this.stopAll();
  }
}

export const callSounds = new CallSoundManager();
export default callSounds;

