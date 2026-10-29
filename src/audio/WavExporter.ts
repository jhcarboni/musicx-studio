import { useProjectStore } from '../store/useProjectStore';

export async function exportSongToWAV(totalBars: number = 16): Promise<Blob> {
  const { bpm, channels, playlistClips, patterns } = useProjectStore.getState();

  const sampleRate = 44100;
  const secondsPerBeat = 60.0 / bpm;
  const secondsPerBar = secondsPerBeat * 4;
  const totalDuration = totalBars * secondsPerBar;

  const offlineCtx = new OfflineAudioContext(2, Math.ceil(sampleRate * totalDuration), sampleRate);

  // Master Gain & Limiter
  const masterGain = offlineCtx.createGain();
  masterGain.gain.value = 0.95;

  const limiter = offlineCtx.createDynamicsCompressor();
  limiter.threshold.value = -0.5;
  limiter.ratio.value = 20.0;

  masterGain.connect(limiter);
  limiter.connect(offlineCtx.destination);

  // Schedule each bar
  for (let bar = 0; bar < totalBars; bar++) {
    const barStartTime = bar * secondsPerBar;
    const activeClips = playlistClips.filter(c => c.bar === bar);

    activeClips.forEach(clip => {
      const pattern = patterns.find(p => p.id === clip.patternId);
      if (!pattern) return;

      channels.forEach(ch => {
        if (ch.muted) return;
        const patChannel = pattern.channels[ch.id];
        const patSteps = patChannel ? patChannel.pattern : ch.pattern;
        const patVels = patChannel ? patChannel.velocities : ch.velocities;

        for (let step = 0; step < 16; step++) {
          if (patSteps[step] === 1) {
            const stepTime = barStartTime + (step * (secondsPerBar / 16));
            const vel = (patVels[step] ?? 0.8) * ch.vol;

            if (ch.customBuffer) {
              const src = offlineCtx.createBufferSource();
              src.buffer = ch.customBuffer;
              const g = offlineCtx.createGain();
              g.gain.value = vel;
              src.connect(g);
              g.connect(masterGain);
              src.start(stepTime);
            } else if (ch.id === 'kick') {
              renderOfflineKick(offlineCtx, masterGain, stepTime, vel);
            } else if (ch.id === 'snare') {
              renderOfflineSnare(offlineCtx, masterGain, stepTime, vel);
            } else if (ch.id === 'hihat') {
              renderOfflineHiHat(offlineCtx, masterGain, stepTime, vel);
            } else if (ch.id === 'clap') {
              renderOfflineClap(offlineCtx, masterGain, stepTime, vel);
            }
          }
        }
      });
    });
  }

  const renderedBuffer = await offlineCtx.startRendering();
  return audioBufferToWavBlob(renderedBuffer);
}

function renderOfflineKick(ctx: OfflineAudioContext, dest: AudioNode, time: number, vel: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);
  gain.gain.setValueAtTime(Math.max(0.01, vel), time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(time);
  osc.stop(time + 0.35);
}

function renderOfflineSnare(ctx: OfflineAudioContext, dest: AudioNode, time: number, vel: number) {
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(180, time);
  osc.frequency.exponentialRampToValueAtTime(45, time + 0.08);
  oscGain.gain.setValueAtTime(vel * 0.7, time);
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
  osc.connect(oscGain);
  oscGain.connect(dest);
  osc.start(time);
  osc.stop(time + 0.12);

  const bufferSize = ctx.sampleRate * 0.18;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1000;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(vel * 0.85, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(dest);
  noise.start(time);
  noise.stop(time + 0.18);
}

function renderOfflineHiHat(ctx: OfflineAudioContext, dest: AudioNode, time: number, vel: number) {
  const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
  const fundamental = 40;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7500;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vel * 0.6, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  filter.connect(gain);
  gain.connect(dest);

  ratios.forEach(ratio => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = fundamental * ratio;
    osc.connect(filter);
    osc.start(time);
    osc.stop(time + 0.06);
  });
}

function renderOfflineClap(ctx: OfflineAudioContext, dest: AudioNode, time: number, vel: number) {
  const bufferSize = ctx.sampleRate * 0.25;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 2.0;

  const gain = ctx.createGain();
  const v = vel * 0.75;
  gain.gain.setValueAtTime(v, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.01);
  gain.gain.setValueAtTime(v, time + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.025);
  gain.gain.setValueAtTime(v, time + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  noise.start(time);
  noise.stop(time + 0.23);
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const numSamples = buffer.length;
  const dataByteLength = numSamples * blockAlign;
  const headerByteLength = 44;
  const totalLength = headerByteLength + dataByteLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataByteLength, true);

  const left = buffer.getChannelData(0);
  const right = numChannels > 1 ? buffer.getChannelData(1) : left;

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    let sL = Math.max(-1, Math.min(1, left[i]));
    let sR = Math.max(-1, Math.min(1, right[i]));
    view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7FFF, true);
    offset += 2;
    view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
