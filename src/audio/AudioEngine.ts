import { useProjectStore } from '../store/useProjectStore';
import { useMixerStore } from '../store/useMixerStore';
import { soundFontManager } from './SoundFontManager';

interface MixerChannelNodes {
  input: GainNode;
  eqLow: BiquadFilterNode;
  eqMid: BiquadFilterNode;
  eqHigh: BiquadFilterNode;
  panner: StereoPannerNode;
  gain: GainNode;
  revSend: GainNode;
  delSend: GainNode;
  distSend: GainNode;
}

export class AudioEngine {
  private static instance: AudioEngine;
  public ctx: AudioContext | null = null;

  // Master bus
  public masterGain: GainNode | null = null;
  public masterLimiter: DynamicsCompressorNode | null = null;
  public analyser: AnalyserNode | null = null;

  // FX Busses
  public reverbBus: GainNode | null = null;
  public delayBus: GainNode | null = null;
  public distortionBus: GainNode | null = null;

  // Channels (0: not used, 1 to 4: inserts)
  private mixerNodes: Map<number, MixerChannelNodes> = new Map();

  // Scheduler state
  private timerId: number | null = null;
  private nextNoteTime = 0;
  private currentStep = 0;
  private currentBar = 0;
  private readonly lookaheadMs = 25;
  private readonly scheduleAheadTime = 0.1; // 100ms

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master Chain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1.0;

    this.masterLimiter = this.ctx.createDynamicsCompressor();
    this.masterLimiter.threshold.value = -0.5;
    this.masterLimiter.knee.value = 0.0;
    this.masterLimiter.ratio.value = 20.0;
    this.masterLimiter.attack.value = 0.001;
    this.masterLimiter.release.value = 0.1;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.85;

    this.masterGain.connect(this.masterLimiter);
    this.masterLimiter.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Initialize Shared Effects
    this.initEffects();

    // Initialize Mixer Inserts 1 to 16
    for (let i = 1; i <= 16; i++) {
      this.initMixerChannel(i);
    }
  }

  private initEffects() {
    if (!this.ctx || !this.masterGain) return;

    // 1. Reverb (Convolver with algorithmic impulse)
    this.reverbBus = this.ctx.createGain();
    const convolver = this.ctx.createConvolver();
    convolver.buffer = this.createReverbImpulse(1.8, 2.0);
    this.reverbBus.connect(convolver);
    convolver.connect(this.masterGain);

    // 2. Stereo Delay with Feedback
    this.delayBus = this.ctx.createGain();
    const delay = this.ctx.createDelay(1.0);
    delay.delayTime.value = 0.35; // ~tempo sync
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.38;
    this.delayBus.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(this.masterGain);

    // 3. Distortion (WaveShaper)
    this.distortionBus = this.ctx.createGain();
    const shaper = this.ctx.createWaveShaper();
    shaper.curve = this.createDistortionCurve(40) as any;
    shaper.oversample = '4x';
    this.distortionBus.connect(shaper);
    shaper.connect(this.masterGain);
  }

  private initMixerChannel(trackIdx: number) {
    if (!this.ctx || !this.masterGain) return;

    const input = this.ctx.createGain();

    // 3-Band EQ
    const eqLow = this.ctx.createBiquadFilter();
    eqLow.type = 'lowshelf';
    eqLow.frequency.value = 250;

    const eqMid = this.ctx.createBiquadFilter();
    eqMid.type = 'peaking';
    eqMid.frequency.value = 1200;
    eqMid.Q.value = 1.0;

    const eqHigh = this.ctx.createBiquadFilter();
    eqHigh.type = 'highshelf';
    eqHigh.frequency.value = 4500;

    const panner = this.ctx.createStereoPanner();
    const gain = this.ctx.createGain();

    // Sends
    const revSend = this.ctx.createGain();
    const delSend = this.ctx.createGain();
    const distSend = this.ctx.createGain();

    // Connect strip
    input.connect(eqLow);
    eqLow.connect(eqMid);
    eqMid.connect(eqHigh);
    eqHigh.connect(panner);
    panner.connect(gain);
    gain.connect(this.masterGain);

    // Connect sends to FX busses
    if (this.reverbBus) {
      eqHigh.connect(revSend);
      revSend.connect(this.reverbBus);
    }
    if (this.delayBus) {
      eqHigh.connect(delSend);
      delSend.connect(this.delayBus);
    }
    if (this.distortionBus) {
      eqHigh.connect(distSend);
      distSend.connect(this.distortionBus);
    }

    this.mixerNodes.set(trackIdx, {
      input,
      eqLow,
      eqMid,
      eqHigh,
      panner,
      gain,
      revSend,
      delSend,
      distSend
    });
  }

  public getChannelInput(trackIdx: number): GainNode | null {
    this.init();
    if (!this.mixerNodes.has(trackIdx)) {
      this.initMixerChannel(trackIdx);
    }
    const nodes = this.mixerNodes.get(trackIdx);
    return nodes ? nodes.input : this.masterGain;
  }

  public syncMixerParams() {
    const { tracks } = useMixerStore.getState();
    tracks.forEach((t) => {
      if (t.id === 0 && this.masterGain) {
        this.masterGain.gain.value = t.muted ? 0 : t.vol;
      } else {
        const nodes = this.mixerNodes.get(t.id);
        if (nodes) {
          nodes.gain.gain.value = t.muted ? 0 : t.vol;
          nodes.panner.pan.value = t.pan;
          nodes.eqLow.gain.value = t.eqLow;
          nodes.eqMid.gain.value = t.eqMid;
          nodes.eqHigh.gain.value = t.eqHigh;
          nodes.revSend.gain.value = t.revSend;
          nodes.delSend.gain.value = t.delSend;
          nodes.distSend.gain.value = t.distSend;
        }
      }
    });
  }

  // ==========================================
  // DRUM SYNTHESIZERS (Analog DSP Emulation)
  // ==========================================

  public playKick(time: number, velocity: number = 0.8, trackIdx = 1) {
    if (!this.ctx) return;
    const dest = this.getChannelInput(trackIdx);
    if (!dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);

    const gainVal = Math.max(0.01, velocity);
    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + 0.35);
  }

  public playSnare(time: number, velocity: number = 0.8, trackIdx = 2) {
    if (!this.ctx) return;
    const dest = this.getChannelInput(trackIdx);
    if (!dest) return;

    // Body tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.08);
    oscGain.gain.setValueAtTime(velocity * 0.7, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.12);

    // White noise snap
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(velocity * 0.85, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);

    noise.start(time);
    noise.stop(time + 0.18);
  }

  public playHiHat(time: number, velocity: number = 0.7, trackIdx = 3) {
    if (!this.ctx) return;
    const dest = this.getChannelInput(trackIdx);
    if (!dest) return;

    const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
    const fundamental = 40;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 10000;

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 7500;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity * 0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    bandpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(dest);

    ratios.forEach(ratio => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'square';
      osc.frequency.value = fundamental * ratio;
      osc.connect(bandpass);
      osc.start(time);
      osc.stop(time + 0.06);
    });
  }

  public playClap(time: number, velocity: number = 0.8, trackIdx = 4) {
    if (!this.ctx) return;
    const dest = this.getChannelInput(trackIdx);
    if (!dest) return;

    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 2.0;

    const gain = this.ctx.createGain();
    const vel = velocity * 0.75;
    // Micro bursts
    gain.gain.setValueAtTime(vel, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.01);
    gain.gain.setValueAtTime(vel, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.025);
    gain.gain.setValueAtTime(vel, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(time);
    noise.stop(time + 0.23);
  }

  public playSynthNote(time: number, freq: number, duration: number, velocity = 0.8, trackIdx = 1) {
    if (!this.ctx) return;
    const dest = this.getChannelInput(trackIdx);
    if (!dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    const durSeconds = Math.max(0.1, duration);
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(velocity * 0.6, time + 0.02);
    gain.gain.setValueAtTime(velocity * 0.5, time + durSeconds - 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, time + durSeconds);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + durSeconds);
  }

  public playCustomBuffer(time: number, buffer: AudioBuffer, velocity = 0.8, trackIdx = 1) {
    if (!this.ctx) return;
    const dest = this.getChannelInput(trackIdx);
    if (!dest) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const gain = this.ctx.createGain();
    gain.gain.value = velocity;

    source.connect(gain);
    gain.connect(dest);

    source.start(time);
  }

  // ==========================================
  // TRANSPORT & SCHEDULER
  // ==========================================

  public start() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.syncMixerParams();

    this.currentStep = 0;
    this.currentBar = 0;
    this.nextNoteTime = this.ctx!.currentTime + 0.05;
    useProjectStore.getState().setIsPlaying(true);
    useProjectStore.getState().setCurrentStep(0);
    useProjectStore.getState().setCurrentBar(0);

    this.timerId = window.setInterval(() => this.schedulerLoop(), this.lookaheadMs);
  }

  public stop() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.currentStep = 0;
    this.currentBar = 0;
    useProjectStore.getState().setIsPlaying(false);
    useProjectStore.getState().setCurrentStep(0);
    useProjectStore.getState().setCurrentBar(0);
  }

  private schedulerLoop() {
    if (!this.ctx) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.currentBar, this.nextNoteTime);
      this.advanceStep();
    }
  }

  private scheduleStep(step: number, bar: number, time: number) {
    const { playMode, channels, playlistClips, patterns, activePatternId } = useProjectStore.getState();

    // Sincroniza parâmetros de mixer em tempo real
    this.syncMixerParams();

    if (playMode === 'PAT') {
      // Loop do Pattern ativo
      channels.forEach(ch => {
        if (ch.muted) return;
        if (ch.pattern[step] === 1) {
          const vel = (ch.velocities[step] ?? 0.8) * ch.vol;
          this.triggerChannelSound(ch, time, vel, step);
        }
      });
    } else {
      // Modo SONG: reproduz clipes da timeline
      const activeClipsOnBar = playlistClips.filter(c => c.bar === bar);
      activeClipsOnBar.forEach(clip => {
        const pattern = patterns.find(p => p.id === clip.patternId);
        if (pattern) {
          channels.forEach(ch => {
            if (ch.muted) return;
            const patChannelData = pattern.channels[ch.id];
            const hasStep = patChannelData ? patChannelData.pattern[step] === 1 : ch.pattern[step] === 1;
            if (hasStep) {
              const vel = ((patChannelData?.velocities[step]) ?? ch.velocities[step] ?? 0.8) * ch.vol;
              this.triggerChannelSound(ch, time, vel, step);
            }
          });
        }
      });
    }

    // Notifica UI do passo atual
    window.setTimeout(() => {
      useProjectStore.getState().setCurrentStep(step);
      useProjectStore.getState().setCurrentBar(bar);
    }, Math.max(0, (time - this.ctx!.currentTime) * 1000));
  }

  public playNotePreview(channel: any, midi: number, duration: number = 0.5, velocity: number = 0.8) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const dest = this.getChannelInput(channel.trackIdx) || this.masterGain!;
    const now = this.ctx.currentTime;

    if (channel.instrumentType === 'soundfont' || channel.instrumentType === 'custom_sf2') {
      soundFontManager.playNote(channel, midi, now, duration, velocity * channel.vol, dest, this.ctx);
    } else if (channel.synthSound === 'kick' || channel.id === 'kick') {
      this.playKick(now, velocity * channel.vol, channel.trackIdx);
    } else if (channel.synthSound === 'snare' || channel.id === 'snare') {
      this.playSnare(now, velocity * channel.vol, channel.trackIdx);
    } else if (channel.synthSound === 'hihat' || channel.id === 'hihat') {
      this.playHiHat(now, velocity * channel.vol, channel.trackIdx);
    } else if (channel.synthSound === 'clap' || channel.id === 'clap') {
      this.playClap(now, velocity * channel.vol, channel.trackIdx);
    } else {
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      this.playSynthNote(now, freq, duration, velocity * channel.vol, channel.trackIdx);
    }
  }

  private triggerChannelSound(ch: any, time: number, vel: number, step: number) {
    const dest = this.getChannelInput(ch.trackIdx) || this.masterGain!;

    // 1. Toca instrumento SoundFont (.sf2 ou Presets como Piano, Rhodes, Strings, Bass)
    if (ch.instrumentType === 'soundfont' || ch.instrumentType === 'custom_sf2') {
      const notesAtStep = ch.notes?.filter((n: any) => n.step === step);
      if (notesAtStep && notesAtStep.length > 0) {
        notesAtStep.forEach((note: any) => {
          const noteDurationSec = note.duration * (60.0 / useProjectStore.getState().bpm / 4);
          soundFontManager.playNote(ch, note.midi, time, noteDurationSec, note.velocity * ch.vol, dest, this.ctx!);
        });
      } else {
        // Disparo via Step Sequencer: toca nota padrão C4 (MIDI 60)
        const noteDurationSec = 60.0 / useProjectStore.getState().bpm / 4;
        soundFontManager.playNote(ch, 60, time, noteDurationSec, vel, dest, this.ctx!);
      }
      return;
    }

    // 2. Samples customizados soltos (.wav/.mp3)
    if (ch.customBuffer) {
      this.playCustomBuffer(time, ch.customBuffer, vel, ch.trackIdx);
    } else if (ch.synthSound === 'kick' || ch.id === 'kick' || ch.id.startsWith('kick')) {
      this.playKick(time, vel, ch.trackIdx);
    } else if (ch.synthSound === 'snare' || ch.id === 'snare' || ch.id.startsWith('snare')) {
      this.playSnare(time, vel, ch.trackIdx);
    } else if (ch.synthSound === 'hihat' || ch.id === 'hihat' || ch.id.startsWith('hihat')) {
      this.playHiHat(time, vel, ch.trackIdx);
    } else if (ch.synthSound === 'clap' || ch.id === 'clap' || ch.id.startsWith('clap')) {
      this.playClap(time, vel, ch.trackIdx);
    } else {
      const noteDurationSec = 60.0 / useProjectStore.getState().bpm / 4;
      this.playSynthNote(time, 261.63, noteDurationSec, vel, ch.trackIdx);
    }

    // Toca notas do piano roll se houver para sintetizador analógico
    if (ch.notes && ch.notes.length > 0) {
      const notesAtStep = ch.notes.filter((n: any) => n.step === step);
      notesAtStep.forEach((note: any) => {
        const freq = 440 * Math.pow(2, (note.midi - 69) / 12);
        const noteDurationSec = note.duration * (60.0 / useProjectStore.getState().bpm / 4);
        this.playSynthNote(time, freq, noteDurationSec, note.velocity * ch.vol, ch.trackIdx);
      });
    }
  }

  private advanceStep() {
    const { bpm, swing, playMode } = useProjectStore.getState();
    const secondsPer16th = (60.0 / bpm) / 4.0;

    // Swing em passos ímpares
    let stepDuration = secondsPer16th;
    if (this.currentStep % 2 !== 0 && swing > 0) {
      stepDuration += swing * (secondsPer16th * 0.4);
    }

    this.nextNoteTime += stepDuration;
    this.currentStep++;

    if (this.currentStep >= 16) {
      this.currentStep = 0;
      if (playMode === 'SONG') {
        this.currentBar = (this.currentBar + 1) % 16;
      }
    }
  }

  // ==========================================
  // HELPERS (Reverb impulse, Distortion curve)
  // ==========================================

  private createReverbImpulse(duration: number, decay: number): AudioBuffer {
    const rate = this.ctx!.sampleRate;
    const length = rate * duration;
    const impulse = this.ctx!.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const dec = Math.pow(1 - n, decay);
      left[i] = (Math.random() * 2 - 1) * dec;
      right[i] = (Math.random() * 2 - 1) * dec;
    }
    return impulse;
  }

  private createDistortionCurve(amount: number): Float32Array {
    const k = amount;
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; i++) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
}

export const audioEngine = AudioEngine.getInstance();
