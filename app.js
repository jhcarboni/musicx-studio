// ==========================================
// PIANO ROLL NOTE DEFINITIONS & CONFIGURATION
// ==========================================
// 25 notes from C4 (48) down to C2 (36)
const PR_NOTE_MAP = [
  { midi: 48, name: 'C4', isBlack: false },
  { midi: 47, name: 'B3', isBlack: false },
  { midi: 46, name: 'A#3', isBlack: true },
  { midi: 45, name: 'A3', isBlack: false },
  { midi: 44, name: 'G#3', isBlack: true },
  { midi: 43, name: 'G3', isBlack: false },
  { midi: 42, name: 'F#3', isBlack: true },
  { midi: 41, name: 'F3', isBlack: false },
  { midi: 40, name: 'E3', isBlack: false },
  { midi: 39, name: 'D#3', isBlack: true },
  { midi: 38, name: 'D3', isBlack: false },
  { midi: 37, name: 'C#3', isBlack: true },
  { midi: 36, name: 'C3', isBlack: false },
  { midi: 35, name: 'B2', isBlack: false },
  { midi: 34, name: 'A#2', isBlack: true },
  { midi: 33, name: 'A2', isBlack: false },
  { midi: 32, name: 'G#2', isBlack: true },
  { midi: 31, name: 'G2', isBlack: false },
  { midi: 30, name: 'F#2', isBlack: true },
  { midi: 29, name: 'F2', isBlack: false },
  { midi: 28, name: 'E2', isBlack: false },
  { midi: 27, name: 'D#2', isBlack: true },
  { midi: 26, name: 'D2', isBlack: false },
  { midi: 25, name: 'C#2', isBlack: true },
  { midi: 24, name: 'C2', isBlack: false }
];

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// ==========================================
// AUDIO CORE & MIXER DSP ARCHITECTURE
// ==========================================
let audioCtx = null;

// Channel Rack Instrument Definitions
const channels = [
  { 
    id: 'kick', name: 'Kick 808', vol: 0.9, pan: 0, muted: false, trackIdx: 1, notes: [],
    velocities: [0.95, 0.70, 0.70, 0.70, 0.95, 0.70, 0.70, 0.70, 0.95, 0.70, 0.70, 0.70, 0.95, 0.70, 0.70, 0.70],
    pattern: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0] 
  },
  { 
    id: 'snare', name: 'Snare Hard', vol: 0.75, pan: 0, muted: false, trackIdx: 2, notes: [],
    velocities: [0.70, 0.70, 0.70, 0.70, 0.90, 0.70, 0.70, 0.70, 0.70, 0.70, 0.70, 0.70, 0.90, 0.70, 0.70, 0.70],
    pattern: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] 
  },
  { 
    id: 'hat', name: 'Hat Closed', vol: 0.6, pan: 0.1, muted: false, trackIdx: 3, notes: [],
    velocities: [0.90, 0.45, 0.75, 0.45, 0.90, 0.45, 0.75, 0.45, 0.90, 0.45, 0.75, 0.45, 0.90, 0.45, 0.75, 0.45],
    pattern: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0] 
  },
  { 
    id: 'clap', name: 'Clap 90s', vol: 0.7, pan: -0.1, muted: false, trackIdx: 4, notes: [],
    velocities: [0.70, 0.70, 0.70, 0.70, 0.85, 0.70, 0.70, 0.70, 0.70, 0.70, 0.70, 0.70, 0.85, 0.70, 0.70, 0.70],
    pattern: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] 
  },
  { 
    id: 'bass', 
    name: '303 Bass', 
    vol: 0.85, 
    pan: 0, 
    muted: false, 
    trackIdx: 5, 
    notes: [
      { step: 0, midi: 24 }, // C2
      { step: 3, midi: 27 }, // D#2
      { step: 6, midi: 31 }, // G2
      { step: 9, midi: 34 }, // A#2
      { step: 12, midi: 36 }, // C3
      { step: 14, midi: 31 }  // G2
    ], 
    velocities: [0.95, 0.75, 0.75, 0.85, 0.75, 0.75, 0.90, 0.75, 0.75, 0.85, 0.75, 0.75, 0.95, 0.75, 0.85, 0.75],
    pattern: [1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,1,0] 
  }
];

// Mixer Tracks Configuration (0 = Master, 1-5 = Channels)
const mixerTracks = [
  { id: 'master', name: 'Master', isMaster: true, vol: 0.85, pan: 0, muted: false },
  { id: 'kick', name: 'Kick', isMaster: false, vol: 0.90, pan: 0, muted: false },
  { id: 'snare', name: 'Snare', isMaster: false, vol: 0.85, pan: 0, muted: false },
  { id: 'hat', name: 'Hat', isMaster: false, vol: 0.75, pan: 0.1, muted: false },
  { id: 'clap', name: 'Clap', isMaster: false, vol: 0.80, pan: -0.1, muted: false },
  { id: 'bass', name: '303 Bass', isMaster: false, vol: 0.85, pan: 0, muted: false }
];

// Master Effects State
const fxState = {
  delay: { on: false, time: 0.23, feedback: 0.45, mix: 0.35 },
  reverb: { on: false, decay: 1.8, mix: 0.30 },
  distortion: { on: false, drive: 25, mix: 0.40 },
  filter: { on: false, type: 'lowpass', cutoff: 3500, q: 2.5 }
};

let masterBus = null;
const trackNodes = new Map();

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    buildMixerDSP();
    startVuMeterLoop();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Algorithmic Stereo Room Reverb Impulse
function createReverbBuffer(ctx, duration = 1.8, decay = 2.0) {
  const sampleRate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(sampleRate * duration));
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);
  for (let i = 0; i < length; i++) {
    const n = length - i;
    left[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
    right[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
  }
  return impulse;
}

// WaveShaper S-Curve for Warm Overdrive Distortion
function makeDistortionCurve(amount = 25) {
  const k = Math.max(1, amount);
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function buildMixerDSP() {
  const masterInput = audioCtx.createGain();
  const masterDryGain = audioCtx.createGain();
  const masterFaderGain = audioCtx.createGain();
  const masterAnalyser = audioCtx.createAnalyser();
  masterAnalyser.fftSize = 128;

  // Master Limiter to avoid digital clipping
  const masterLimiter = audioCtx.createDynamicsCompressor();
  masterLimiter.threshold.setValueAtTime(-0.5, audioCtx.currentTime);
  masterLimiter.knee.setValueAtTime(3, audioCtx.currentTime);
  masterLimiter.ratio.setValueAtTime(20, audioCtx.currentTime);
  masterLimiter.attack.setValueAtTime(0.001, audioCtx.currentTime);
  masterLimiter.release.setValueAtTime(0.05, audioCtx.currentTime);

  // FX: DJ Filter
  const filterNode = audioCtx.createBiquadFilter();
  filterNode.type = fxState.filter.type;
  filterNode.frequency.setValueAtTime(fxState.filter.cutoff, audioCtx.currentTime);
  filterNode.Q.setValueAtTime(fxState.filter.q, audioCtx.currentTime);

  // FX: Distortion
  const distNode = audioCtx.createWaveShaper();
  distNode.curve = makeDistortionCurve(fxState.distortion.drive);
  distNode.oversample = '4x';
  const distWetGain = audioCtx.createGain();
  distWetGain.gain.setValueAtTime(0, audioCtx.currentTime);

  // FX: Delay
  const delayNode = audioCtx.createDelay(1.0);
  delayNode.delayTime.setValueAtTime(fxState.delay.time, audioCtx.currentTime);
  const delayFeedback = audioCtx.createGain();
  delayFeedback.gain.setValueAtTime(fxState.delay.feedback, audioCtx.currentTime);
  const delayDampFilter = audioCtx.createBiquadFilter();
  delayDampFilter.type = 'lowpass';
  delayDampFilter.frequency.setValueAtTime(3200, audioCtx.currentTime);
  const delayWetGain = audioCtx.createGain();
  delayWetGain.gain.setValueAtTime(0, audioCtx.currentTime);

  delayNode.connect(delayDampFilter);
  delayDampFilter.connect(delayFeedback);
  delayFeedback.connect(delayNode);
  delayDampFilter.connect(delayWetGain);

  // FX: Reverb
  const reverbNode = audioCtx.createConvolver();
  reverbNode.buffer = createReverbBuffer(audioCtx, fxState.reverb.decay, 2.0);
  const reverbWetGain = audioCtx.createGain();
  reverbWetGain.gain.setValueAtTime(0, audioCtx.currentTime);
  reverbNode.connect(reverbWetGain);

  // Routing Master Input -> Filter -> Master FX Matrix
  masterInput.connect(filterNode);
  
  filterNode.connect(masterDryGain);
  filterNode.connect(distNode);
  distNode.connect(distWetGain);
  filterNode.connect(delayNode);
  filterNode.connect(reverbNode);

  // Master summing junction
  const masterSum = audioCtx.createGain();
  masterDryGain.connect(masterSum);
  distWetGain.connect(masterSum);
  delayWetGain.connect(masterSum);
  reverbWetGain.connect(masterSum);

  // Master Sum -> Master Fader -> Analyser -> Limiter -> Destination
  masterFaderGain.gain.setValueAtTime(mixerTracks[0].vol, audioCtx.currentTime);
  masterSum.connect(masterFaderGain);
  masterFaderGain.connect(masterAnalyser);
  masterAnalyser.connect(masterLimiter);
  masterLimiter.connect(audioCtx.destination);

  masterBus = {
    input: masterInput,
    dryGain: masterDryGain,
    filter: filterNode,
    distortion: distNode,
    distWet: distWetGain,
    delay: delayNode,
    delayFeedback: delayFeedback,
    delayWet: delayWetGain,
    reverb: reverbNode,
    reverbWet: reverbWetGain,
    fader: masterFaderGain,
    analyser: masterAnalyser
  };

  trackNodes.set('master', {
    input: masterInput,
    fader: masterFaderGain,
    analyser: masterAnalyser,
    currentPeak: 0
  });

  // Build Channel Insert Strips 1 to 5
  mixerTracks.slice(1).forEach(tr => {
    const trackInput = audioCtx.createGain();
    const trackFader = audioCtx.createGain();
    const trackPan = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
    const trackAnalyser = audioCtx.createAnalyser();
    trackAnalyser.fftSize = 128;

    trackFader.gain.setValueAtTime(tr.vol, audioCtx.currentTime);
    trackInput.connect(trackFader);
    trackFader.connect(trackAnalyser);

    if (trackPan) {
      trackPan.pan.setValueAtTime(tr.pan, audioCtx.currentTime);
      trackAnalyser.connect(trackPan);
      trackPan.connect(masterInput);
    } else {
      trackAnalyser.connect(masterInput);
    }

    trackNodes.set(tr.id, {
      input: trackInput,
      fader: trackFader,
      panner: trackPan,
      analyser: trackAnalyser,
      currentPeak: 0
    });
  });

  updateFxNodes();
}

function updateFxNodes() {
  if (!masterBus) return;
  const now = audioCtx.currentTime;

  masterBus.delay.delayTime.setTargetAtTime(fxState.delay.time, now, 0.02);
  masterBus.delayFeedback.gain.setTargetAtTime(fxState.delay.feedback, now, 0.02);
  masterBus.delayWet.gain.setTargetAtTime(fxState.delay.on ? fxState.delay.mix : 0, now, 0.02);

  masterBus.reverbWet.gain.setTargetAtTime(fxState.reverb.on ? fxState.reverb.mix : 0, now, 0.02);
  masterBus.distWet.gain.setTargetAtTime(fxState.distortion.on ? fxState.distortion.mix : 0, now, 0.02);

  if (fxState.filter.on) {
    masterBus.filter.type = fxState.filter.type;
    masterBus.filter.frequency.setTargetAtTime(fxState.filter.cutoff, now, 0.02);
    masterBus.filter.Q.setTargetAtTime(fxState.filter.q, now, 0.02);
  } else {
    masterBus.filter.type = 'allpass';
  }
}

function getChannelDestination(channelId) {
  initAudio();
  const trackNode = trackNodes.get(channelId);
  return trackNode ? trackNode.input : (masterBus ? masterBus.input : audioCtx.destination);
}

// ==========================================
// INSTRUMENT SYNTHESIS ENGINES (WITH PITCH)
// ==========================================
function playKick(time, vol, pan, freq) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const dest = getChannelDestination('kick');

  const startPitch = freq ? freq * 2.2 : 150;
  osc.frequency.setValueAtTime(startPitch, time);
  osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.4);

  gain.gain.setValueAtTime(vol, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(time);
  osc.stop(time + 0.45);
}

function playSnare(time, vol, pan) {
  const bufferSize = audioCtx.sampleRate * 0.2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1000, time);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(vol * 0.8, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);

  const dest = getChannelDestination('snare');
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  noise.start(time);
  noise.stop(time + 0.2);
}

function playHat(time, vol, pan) {
  const bufferSize = audioCtx.sampleRate * 0.05;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(7000, time);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(vol * 0.5, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

  const dest = getChannelDestination('hat');
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  noise.start(time);
  noise.stop(time + 0.06);
}

function playClap(time, vol, pan) {
  const bufferSize = audioCtx.sampleRate * 0.25;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, time);
  filter.Q.setValueAtTime(2, time);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(vol * 0.7, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

  const dest = getChannelDestination('clap');
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  noise.start(time);
  noise.stop(time + 0.25);
}

function playBass(time, vol, pan, freq) {
  const baseFreq = freq || 65.41;
  const osc = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(baseFreq, time);

  // Dynamic resonant acid filter sweep
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(baseFreq * 8, time);
  filter.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, time + 0.22);
  filter.Q.setValueAtTime(4.0, time);

  gain.gain.setValueAtTime(vol * 0.75, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

  const dest = getChannelDestination('bass');
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  osc.start(time);
  osc.stop(time + 0.3);
}

function triggerSample(channelId, time, vol, pan, freq) {
  if (channelId === 'kick') playKick(time, vol, pan, freq);
  else if (channelId === 'snare') playSnare(time, vol, pan);
  else if (channelId === 'hat') playHat(time, vol, pan);
  else if (channelId === 'clap') playClap(time, vol, pan);
  else if (channelId === 'bass') playBass(time, vol, pan, freq);
}

// ==========================================
// SEQUENCER CLOCK (Lookahead Scheduler)
// ==========================================
let isPlaying = false;
let currentStep = 0;
let bpm = 130;
let nextNoteTime = 0.0;
const lookahead = 25.0;
const scheduleAheadTime = 0.1;
let timerID = null;

function nextNote() {
  const secondsPerBeat = 60.0 / bpm;
  const secondsPerStep = secondsPerBeat / 4;
  nextNoteTime += secondsPerStep;
  currentStep = (currentStep + 1) % 16;
}

let swing = 0; // 0 to 100%

function scheduleStep(stepNumber, time) {
  const secondsPerBeat = 60.0 / bpm;
  const secondsPerStep = secondsPerBeat / 4;

  // FL Studio Swing: delays off-beat 16th steps (1, 3, 5, 7, 9, 11, 13, 15)
  const isOddStep = (stepNumber % 2 === 1);
  const swingDelay = isOddStep ? (swing / 100) * (secondsPerStep * 0.5) : 0;
  const noteTime = time + swingDelay;

  channels.forEach(ch => {
    if (!ch.muted) {
      const stepVel = (ch.velocities && ch.velocities[stepNumber] !== undefined) ? ch.velocities[stepNumber] : 0.85;
      const hitVol = ch.vol * stepVel;

      if (ch.notes && ch.notes.length > 0) {
        const stepNotes = ch.notes.filter(n => n.step === stepNumber);
        stepNotes.forEach(n => {
          const freq = midiToFreq(n.midi);
          triggerSample(ch.id, noteTime, hitVol, ch.pan, freq);
        });
      } else if (ch.pattern[stepNumber]) {
        triggerSample(ch.id, noteTime, hitVol, ch.pan);
      }
    }
  });

  const delay = Math.max(0, (noteTime - audioCtx.currentTime) * 1000);
  setTimeout(() => {
    updateVisualCursor(stepNumber);
  }, delay);
}

function scheduler() {
  while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
    scheduleStep(currentStep, nextNoteTime);
    nextNote();
  }
  if (isPlaying) {
    timerID = setTimeout(scheduler, lookahead);
  }
}

function play() {
  initAudio();
  if (isPlaying) return;
  isPlaying = true;
  currentStep = 0;
  nextNoteTime = audioCtx.currentTime + 0.05;
  document.getElementById('btnPlay').classList.add('active');
  scheduler();
}

function stop() {
  isPlaying = false;
  clearTimeout(timerID);
  currentStep = 0;
  document.getElementById('btnPlay').classList.remove('active');
  updateVisualCursor(-1);
}

// ==========================================
// RENDER UI: CHANNEL RACK
// ==========================================
function renderRack() {
  const container = document.getElementById('channelsContainer');
  container.innerHTML = '';

  channels.forEach((ch, chIdx) => {
    const row = document.createElement('div');
    row.className = 'channel-row';

    const meta = document.createElement('div');
    meta.className = 'chan-meta';

    const trackBadge = document.createElement('span');
    trackBadge.className = 'chan-track-idx';
    trackBadge.textContent = ch.trackIdx;
    trackBadge.title = `Roteado para a Pista ${ch.trackIdx} do Mixer`;

    const muteBtn = document.createElement('div');
    muteBtn.className = 'chan-mute' + (ch.muted ? ' muted' : '');
    muteBtn.onclick = () => {
      ch.muted = !ch.muted;
      muteBtn.classList.toggle('muted', ch.muted);
    };

    const nameBtn = document.createElement('div');
    nameBtn.className = 'chan-name-btn';
    nameBtn.textContent = ch.name;
    nameBtn.title = 'Clique para testar o som';
    nameBtn.onclick = () => {
      initAudio();
      const previewFreq = ch.notes && ch.notes.length > 0 ? midiToFreq(ch.notes[0].midi) : undefined;
      triggerSample(ch.id, audioCtx.currentTime, ch.vol, ch.pan, previewFreq);
    };

    const prBtn = document.createElement('button');
    prBtn.className = 'chan-pr-btn';
    prBtn.textContent = '🎹 Roll';
    prBtn.title = `Abrir o Piano Roll de ${ch.name}`;
    prBtn.onclick = () => {
      document.getElementById('prTargetSelect').value = ch.id;
      currentPrChannelId = ch.id;
      renderPianoRoll();
      const prWin = document.getElementById('pianoRollWindow');
      prWin.style.display = 'flex';
      document.getElementById('togglePrBtn').classList.add('active');
      prWin.scrollIntoView({ behavior: 'smooth' });
    };

    const volGroup = document.createElement('div');
    volGroup.className = 'knob-group';
    volGroup.innerHTML = `
      <span class="knob-label">V</span>
      <input type="range" class="slider-knob" min="0" max="1" step="0.05" value="${ch.vol}">
    `;
    volGroup.querySelector('input').oninput = (e) => ch.vol = parseFloat(e.target.value);

    meta.appendChild(trackBadge);
    meta.appendChild(muteBtn);
    meta.appendChild(nameBtn);
    meta.appendChild(prBtn);
    meta.appendChild(volGroup);
    row.appendChild(meta);

    const stepsDiv = document.createElement('div');
    stepsDiv.className = 'steps-container';

    for (let s = 0; s < 16; s++) {
      const pad = document.createElement('div');
      const isGroupA = Math.floor(s / 4) % 2 === 0;
      pad.className = `step-pad ${isGroupA ? 'group-a' : 'group-b'}`;
      const vel = (ch.velocities && ch.velocities[s] !== undefined) ? ch.velocities[s] : 0.85;

      if (ch.pattern[s]) {
        pad.classList.add('active');
        pad.style.opacity = 0.4 + (vel * 0.6);
      } else {
        pad.style.opacity = '1';
      }

      if (ch.notes && ch.notes.some(n => n.step === s)) {
        pad.classList.add('has-piano-notes');
      }
      pad.dataset.step = s;
      pad.dataset.channel = chIdx;

      pad.onclick = () => {
        ch.pattern[s] = ch.pattern[s] ? 0 : 1;
        pad.classList.toggle('active', !!ch.pattern[s]);
        initAudio();

        const stepVel = (ch.velocities && ch.velocities[s] !== undefined) ? ch.velocities[s] : 0.85;

        if (ch.pattern[s]) {
          pad.style.opacity = 0.4 + (stepVel * 0.6);
          // If turning on and no note in piano roll, create root note C2 (midi 24)
          if (ch.notes && !ch.notes.some(n => n.step === s)) {
            ch.notes.push({ step: s, midi: 24 });
            pad.classList.add('has-piano-notes');
          }
          const noteObj = ch.notes ? ch.notes.find(n => n.step === s) : null;
          const freq = noteObj ? midiToFreq(noteObj.midi) : undefined;
          triggerSample(ch.id, audioCtx.currentTime, ch.vol * stepVel, ch.pan, freq);
        } else {
          pad.style.opacity = '1';
          // If turning off, remove any notes at this step
          if (ch.notes) {
            ch.notes = ch.notes.filter(n => n.step !== s);
            pad.classList.remove('has-piano-notes');
          }
        }

        if (isGraphEditorOpen) {
          const velSlots = container.querySelectorAll(`.velocity-bar-slot[data-channel="${chIdx}"]`);
          if (velSlots[s]) {
            velSlots[s].classList.toggle('active-step', !!ch.pattern[s]);
          }
        }

        if (currentPrChannelId === ch.id) {
          renderPianoRoll();
        }
      };

      stepsDiv.appendChild(pad);
    }
    row.appendChild(stepsDiv);
    container.appendChild(row);

    if (isGraphEditorOpen) {
      const velRow = document.createElement('div');
      velRow.className = 'velocity-row';

      const velLabel = document.createElement('div');
      velLabel.className = 'velocity-label-col';
      velLabel.textContent = `VELOCITY (${ch.name})`;

      const velContainer = document.createElement('div');
      velContainer.className = 'velocity-bars-container';

      for (let s = 0; s < 16; s++) {
        const slot = document.createElement('div');
        slot.className = 'velocity-bar-slot' + (ch.pattern[s] ? ' active-step' : '');
        slot.dataset.step = s;
        slot.dataset.channel = chIdx;

        const fill = document.createElement('div');
        fill.className = 'velocity-fill';
        const currentVel = (ch.velocities && ch.velocities[s] !== undefined) ? ch.velocities[s] : 0.85;
        fill.style.height = `${Math.round(currentVel * 100)}%`;

        const tooltip = document.createElement('div');
        tooltip.className = 'velocity-tooltip';
        tooltip.textContent = `${Math.round(currentVel * 100)}%`;

        slot.appendChild(fill);
        slot.appendChild(tooltip);

        const applyVelocityFromEvent = (e) => {
          const rect = slot.getBoundingClientRect();
          const clamped = Math.max(0.1, Math.min(1.0, (rect.bottom - e.clientY) / rect.height));
          ch.velocities[s] = Math.round(clamped * 100) / 100;
          fill.style.height = `${Math.round(ch.velocities[s] * 100)}%`;
          tooltip.textContent = `${Math.round(ch.velocities[s] * 100)}%`;

          const stepPads = row.querySelectorAll('.step-pad');
          if (stepPads[s] && ch.pattern[s]) {
            stepPads[s].style.opacity = 0.4 + (ch.velocities[s] * 0.6);
          }

          initAudio();
          const previewFreq = ch.notes && ch.notes.length > 0 ? midiToFreq(ch.notes[0].midi) : undefined;
          triggerSample(ch.id, audioCtx.currentTime, ch.vol * ch.velocities[s], ch.pan, previewFreq);
        };

        slot.onmousedown = (e) => {
          isPaintingVelocity = true;
          applyVelocityFromEvent(e);
        };

        slot.onmouseenter = (e) => {
          if (isPaintingVelocity) {
            applyVelocityFromEvent(e);
          }
        };

        velContainer.appendChild(slot);
      }

      velRow.appendChild(velLabel);
      velRow.appendChild(velContainer);
      container.appendChild(velRow);
    }
  });
}

function updateVisualCursor(step) {
  // Update step pads in Channel Rack
  const pads = document.querySelectorAll('.step-pad');
  pads.forEach(p => {
    if (parseInt(p.dataset.step, 10) === step) {
      p.classList.add('current-step');
    } else {
      p.classList.remove('current-step');
    }
  });

  // Update LCD display
  const stepCounter = document.getElementById('stepCounterDisplay');
  if (step >= 0) {
    stepCounter.textContent = (step + 1).toString().padStart(2, '0');
  } else {
    stepCounter.textContent = '--';
  }

  // Update Piano Roll Playhead
  updatePianoRollPlayhead(step);
}

// ==========================================
// PIANO ROLL ENGINE & INTERFACE
// ==========================================
let currentPrChannelId = 'bass';

function renderPianoRollRuler() {
  const rulerSteps = document.getElementById('prRulerSteps');
  rulerSteps.innerHTML = '';
  for (let s = 0; s < 16; s++) {
    const bar = Math.floor(s / 4) + 1;
    const beat = (s % 4) + 1;
    const stepDiv = document.createElement('div');
    stepDiv.className = `pr-ruler-step ${beat === 1 ? 'beat-start' : ''}`;
    stepDiv.textContent = `${bar}.${beat}`;
    rulerSteps.appendChild(stepDiv);
  }
}

function renderPianoRoll() {
  const currentCh = channels.find(c => c.id === currentPrChannelId);
  if (!currentCh) return;

  const kbContainer = document.getElementById('prKeyboard');
  const gridContainer = document.getElementById('prGridContainer');
  
  // Retain playhead
  let playhead = document.getElementById('prPlayhead');
  if (!playhead) {
    playhead = document.createElement('div');
    playhead.id = 'prPlayhead';
    playhead.className = 'pr-playhead';
  }

  kbContainer.innerHTML = '';
  gridContainer.innerHTML = '';
  gridContainer.appendChild(playhead);

  PR_NOTE_MAP.forEach(noteItem => {
    // 1. Render Left Piano Key
    const key = document.createElement('div');
    key.className = `pr-key ${noteItem.isBlack ? 'black-key' : 'white-key'}`;
    key.textContent = noteItem.name;
    key.title = `Tocar ${noteItem.name}`;
    key.onmousedown = () => {
      initAudio();
      key.classList.add('active');
      triggerSample(currentCh.id, audioCtx.currentTime, currentCh.vol, currentCh.pan, midiToFreq(noteItem.midi));
    };
    key.onmouseup = () => key.classList.remove('active');
    key.onmouseleave = () => key.classList.remove('active');
    kbContainer.appendChild(key);

    // 2. Render Grid Row
    const row = document.createElement('div');
    row.className = `pr-row ${noteItem.isBlack ? 'black-row' : 'white-row'}`;
    row.dataset.midi = noteItem.midi;

    for (let s = 0; s < 16; s++) {
      const cell = document.createElement('div');
      const isBeatStart = (s % 4 === 0);
      cell.className = `pr-cell ${isBeatStart ? 'beat-bar' : ''}`;
      cell.dataset.step = s;
      cell.dataset.midi = noteItem.midi;

      // Check if there is an active note here
      const hasNote = currentCh.notes && currentCh.notes.some(n => n.step === s && n.midi === noteItem.midi);
      if (hasNote) {
        const chip = document.createElement('div');
        chip.className = 'pr-note-chip';
        chip.textContent = noteItem.name;
        cell.appendChild(chip);
      }

      cell.onclick = () => {
        initAudio();
        toggleNote(currentCh, s, noteItem.midi);
      };

      row.appendChild(cell);
    }
    gridContainer.appendChild(row);
  });
}

function toggleNote(channel, step, midi) {
  if (!channel.notes) channel.notes = [];

  const existingNoteIdx = channel.notes.findIndex(n => n.step === step && n.midi === midi);

  if (existingNoteIdx !== -1) {
    // Remove note
    channel.notes.splice(existingNoteIdx, 1);
  } else {
    // Monophonic on same step: remove previous note at this step
    channel.notes = channel.notes.filter(n => n.step !== step);
    // Add new note
    channel.notes.push({ step, midi });
    // Preview sound
    triggerSample(channel.id, audioCtx.currentTime, channel.vol, channel.pan, midiToFreq(midi));
  }

  // Sync Channel Rack pattern
  channel.pattern[step] = channel.notes.some(n => n.step === step) ? 1 : 0;

  renderPianoRoll();
  renderRack();
}

function updatePianoRollPlayhead(step) {
  const playhead = document.getElementById('prPlayhead');
  const grid = document.getElementById('prGridContainer');
  if (!playhead || !grid) return;

  if (step >= 0 && isPlaying) {
    playhead.style.display = 'block';
    const stepWidth = grid.clientWidth / 16;
    playhead.style.left = `${step * stepWidth}px`;
  } else {
    playhead.style.display = 'none';
  }
}

// Setup Piano Roll Tools
function setupPianoRollControls() {
  renderPianoRollRuler();

  const targetSelect = document.getElementById('prTargetSelect');
  targetSelect.onchange = (e) => {
    currentPrChannelId = e.target.value;
    renderPianoRoll();
  };

  // Octave Down
  document.getElementById('prOctaveDownBtn').onclick = () => {
    const ch = channels.find(c => c.id === currentPrChannelId);
    if (!ch || !ch.notes) return;
    ch.notes.forEach(n => {
      if (n.midi - 12 >= 24) n.midi -= 12;
    });
    renderPianoRoll();
    initAudio();
    if (ch.notes.length > 0) {
      triggerSample(ch.id, audioCtx.currentTime, ch.vol, ch.pan, midiToFreq(ch.notes[0].midi));
    }
  };

  // Octave Up
  document.getElementById('prOctaveUpBtn').onclick = () => {
    const ch = channels.find(c => c.id === currentPrChannelId);
    if (!ch || !ch.notes) return;
    ch.notes.forEach(n => {
      if (n.midi + 12 <= 48) n.midi += 12;
    });
    renderPianoRoll();
    initAudio();
    if (ch.notes.length > 0) {
      triggerSample(ch.id, audioCtx.currentTime, ch.vol, ch.pan, midiToFreq(ch.notes[0].midi));
    }
  };

  // Acid Preset
  document.getElementById('prPresetAcidBtn').onclick = () => {
    const ch = channels.find(c => c.id === currentPrChannelId);
    if (!ch) return;
    ch.notes = [
      { step: 0, midi: 24 }, // C2
      { step: 3, midi: 27 }, // D#2
      { step: 6, midi: 31 }, // G2
      { step: 9, midi: 34 }, // A#2
      { step: 12, midi: 36 }, // C3
      { step: 14, midi: 31 }  // G2
    ];
    ch.pattern = [1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,1,0];
    renderPianoRoll();
    renderRack();
    initAudio();
    triggerSample(ch.id, audioCtx.currentTime, ch.vol, ch.pan, midiToFreq(24));
  };

  // Clear All Notes
  document.getElementById('prClearBtn').onclick = () => {
    const ch = channels.find(c => c.id === currentPrChannelId);
    if (!ch) return;
    ch.notes = [];
    ch.pattern = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
    renderPianoRoll();
    renderRack();
  };

  // Close Piano Roll
  document.getElementById('prCloseBtn').onclick = () => {
    const prWin = document.getElementById('pianoRollWindow');
    prWin.style.display = 'none';
    document.getElementById('togglePrBtn').classList.remove('active');
  };
}

// ==========================================
// RENDER UI: MIXER TRACK STRIPS
// ==========================================
function renderMixerStrips() {
  const container = document.getElementById('mixerStripsContainer');
  container.innerHTML = '';

  mixerTracks.forEach((tr, idx) => {
    const strip = document.createElement('div');
    strip.className = 'mixer-strip' + (tr.isMaster ? ' master' : '');
    strip.id = `strip-${tr.id}`;

    strip.innerHTML = `
      <div class="strip-header">
        <span class="strip-num">${tr.isMaster ? 'M' : idx}</span>
        <span class="strip-name">${tr.name}</span>
      </div>

      <div class="strip-pan-group">
        <span class="strip-pan-label">PAN</span>
        <input type="range" class="strip-pan-slider" min="-1" max="1" step="0.1" value="${tr.pan}">
      </div>

      <div class="strip-fader-area">
        <div class="fader-vertical-wrap">
          <input type="range" class="fader-slider" min="0" max="1.25" step="0.01" value="${tr.vol}">
        </div>
        <canvas class="vu-meter-canvas" id="vu-${tr.id}" width="10" height="120"></canvas>
      </div>

      <div class="strip-db-readout" id="db-${tr.id}">
        ${Math.round(tr.vol * 100)}%
      </div>

      <div class="strip-mute-btn ${tr.muted ? 'muted' : ''}" id="mute-${tr.id}" title="Mute/Unmute"></div>
    `;

    // Pan handling
    const panSlider = strip.querySelector('.strip-pan-slider');
    panSlider.oninput = (e) => {
      tr.pan = parseFloat(e.target.value);
      initAudio();
      const node = trackNodes.get(tr.id);
      if (node && node.panner) {
        node.panner.pan.setTargetAtTime(tr.pan, audioCtx.currentTime, 0.02);
      }
    };

    // Fader handling
    const faderSlider = strip.querySelector('.fader-slider');
    const dbReadout = strip.querySelector(`#db-${tr.id}`);
    faderSlider.oninput = (e) => {
      tr.vol = parseFloat(e.target.value);
      dbReadout.textContent = `${Math.round(tr.vol * 100)}%`;
      initAudio();
      const node = trackNodes.get(tr.id);
      if (node) {
        const effectiveVol = tr.muted ? 0 : tr.vol;
        node.fader.gain.setTargetAtTime(effectiveVol, audioCtx.currentTime, 0.02);
      }
    };

    // Mute handling
    const muteBtn = strip.querySelector(`#mute-${tr.id}`);
    muteBtn.onclick = () => {
      tr.muted = !tr.muted;
      muteBtn.classList.toggle('muted', tr.muted);
      initAudio();
      const node = trackNodes.get(tr.id);
      if (node) {
        const effectiveVol = tr.muted ? 0 : tr.vol;
        node.fader.gain.setTargetAtTime(effectiveVol, audioCtx.currentTime, 0.02);
      }
    };

    container.appendChild(strip);
  });
}

// ==========================================
// REAL-TIME VU METER ANIMATION LOOP
// ==========================================
function startVuMeterLoop() {
  const timeData = new Uint8Array(128);

  function drawMeters() {
    mixerTracks.forEach(tr => {
      const node = trackNodes.get(tr.id);
      const canvas = document.getElementById(`vu-${tr.id}`);
      if (!node || !canvas) return;

      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      node.analyser.getByteTimeDomainData(timeData);
      let sum = 0;
      for (let i = 0; i < timeData.length; i++) {
        const sample = (timeData[i] - 128) / 128;
        sum += sample * sample;
      }
      const rms = Math.sqrt(sum / timeData.length);
      const targetLevel = Math.min(1.0, rms * 4.5);

      if (targetLevel > node.currentPeak) {
        node.currentPeak = targetLevel;
      } else {
        node.currentPeak = Math.max(0, node.currentPeak - 0.045);
      }

      ctx.fillStyle = '#0b0c0e';
      ctx.fillRect(0, 0, w, h);

      const numSegments = 24;
      const segH = 4;
      const segGap = 1;

      for (let i = 0; i < numSegments; i++) {
        const segRatio = i / numSegments;
        const y = h - (i + 1) * (segH + segGap);

        if (segRatio <= node.currentPeak) {
          if (i > 21) {
            ctx.fillStyle = '#ff3344'; // Clip Red
          } else if (i > 16) {
            ctx.fillStyle = '#ffaa00'; // Warning Amber
          } else {
            ctx.fillStyle = '#39d353'; // Signal Green
          }
        } else {
          ctx.fillStyle = '#181b20'; // Off segment
        }
        ctx.fillRect(1, y, w - 2, segH);
      }
    });

    requestAnimationFrame(drawMeters);
  }

  requestAnimationFrame(drawMeters);
}

// ==========================================
// FX SLOTS EVENT HANDLERS
// ==========================================
function setupFxControls() {
  const delayToggle = document.getElementById('fxDelayToggle');
  const delayTime = document.getElementById('delayTimeSlider');
  const delayFeedback = document.getElementById('delayFeedbackSlider');
  const delayMix = document.getElementById('delayMixSlider');

  delayToggle.onclick = () => {
    initAudio();
    fxState.delay.on = !fxState.delay.on;
    delayToggle.classList.toggle('on', fxState.delay.on);
    document.getElementById('slotDelay').classList.toggle('active-fx', fxState.delay.on);
    updateFxNodes();
  };
  delayTime.oninput = (e) => {
    fxState.delay.time = parseFloat(e.target.value);
    document.getElementById('delayTimeVal').textContent = `${Math.round(fxState.delay.time * 1000)}ms`;
    updateFxNodes();
  };
  delayFeedback.oninput = (e) => {
    fxState.delay.feedback = parseFloat(e.target.value);
    document.getElementById('delayFeedbackVal').textContent = `${Math.round(fxState.delay.feedback * 100)}%`;
    updateFxNodes();
  };
  delayMix.oninput = (e) => {
    fxState.delay.mix = parseFloat(e.target.value);
    document.getElementById('delayMixVal').textContent = `${Math.round(fxState.delay.mix * 100)}%`;
    updateFxNodes();
  };

  const reverbToggle = document.getElementById('fxReverbToggle');
  const reverbDecay = document.getElementById('reverbDecaySlider');
  const reverbMix = document.getElementById('reverbMixSlider');

  reverbToggle.onclick = () => {
    initAudio();
    fxState.reverb.on = !fxState.reverb.on;
    reverbToggle.classList.toggle('on', fxState.reverb.on);
    document.getElementById('slotReverb').classList.toggle('active-fx', fxState.reverb.on);
    updateFxNodes();
  };
  reverbDecay.oninput = (e) => {
    fxState.reverb.decay = parseFloat(e.target.value);
    document.getElementById('reverbDecayVal').textContent = `${fxState.reverb.decay.toFixed(1)}s`;
    if (audioCtx && masterBus) {
      masterBus.reverb.buffer = createReverbBuffer(audioCtx, fxState.reverb.decay, 2.0);
    }
  };
  reverbMix.oninput = (e) => {
    fxState.reverb.mix = parseFloat(e.target.value);
    document.getElementById('reverbMixVal').textContent = `${Math.round(fxState.reverb.mix * 100)}%`;
    updateFxNodes();
  };

  const distToggle = document.getElementById('fxDistToggle');
  const distDrive = document.getElementById('distDriveSlider');
  const distMix = document.getElementById('distMixSlider');

  distToggle.onclick = () => {
    initAudio();
    fxState.distortion.on = !fxState.distortion.on;
    distToggle.classList.toggle('on', fxState.distortion.on);
    document.getElementById('slotDist').classList.toggle('active-fx', fxState.distortion.on);
    updateFxNodes();
  };
  distDrive.oninput = (e) => {
    fxState.distortion.drive = parseFloat(e.target.value);
    document.getElementById('distDriveVal').textContent = fxState.distortion.drive;
    if (masterBus) {
      masterBus.distortion.curve = makeDistortionCurve(fxState.distortion.drive);
    }
  };
  distMix.oninput = (e) => {
    fxState.distortion.mix = parseFloat(e.target.value);
    document.getElementById('distMixVal').textContent = `${Math.round(fxState.distortion.mix * 100)}%`;
    updateFxNodes();
  };

  const filterToggle = document.getElementById('fxFilterToggle');
  const filterType = document.getElementById('filterTypeSelect');
  const filterCutoff = document.getElementById('filterCutoffSlider');
  const filterQ = document.getElementById('filterQSlider');

  filterToggle.onclick = () => {
    initAudio();
    fxState.filter.on = !fxState.filter.on;
    filterToggle.classList.toggle('on', fxState.filter.on);
    document.getElementById('slotFilter').classList.toggle('active-fx', fxState.filter.on);
    updateFxNodes();
  };
  filterType.onchange = (e) => {
    fxState.filter.type = e.target.value;
    updateFxNodes();
  };
  filterCutoff.oninput = (e) => {
    fxState.filter.cutoff = parseFloat(e.target.value);
    const valStr = fxState.filter.cutoff >= 1000 ? `${(fxState.filter.cutoff/1000).toFixed(1)}k` : `${fxState.filter.cutoff}Hz`;
    document.getElementById('filterCutoffVal').textContent = valStr;
    updateFxNodes();
  };
  filterQ.oninput = (e) => {
    fxState.filter.q = parseFloat(e.target.value);
    document.getElementById('filterQVal').textContent = fxState.filter.q.toFixed(1);
    updateFxNodes();
  };
}

// ==========================================
// TOP CONTROLS & BPM TWO-WAY SYNC
// ==========================================
document.getElementById('btnPlay').onclick = play;
document.getElementById('btnStop').onclick = stop;

const bpmSlider = document.getElementById('bpmSlider');
const bpmInput = document.getElementById('bpmInput');

function updateBpm(newBpm, syncInput = true, syncSlider = true) {
  bpm = Math.min(240, Math.max(40, newBpm));
  if (syncInput) bpmInput.value = bpm;
  if (syncSlider) bpmSlider.value = bpm;
}

bpmSlider.oninput = (e) => {
  updateBpm(parseInt(e.target.value, 10), true, false);
};

bpmInput.onfocus = () => {
  bpmInput.select();
};

bpmInput.oninput = (e) => {
  const val = parseInt(e.target.value, 10);
  if (!isNaN(val)) {
    bpm = Math.min(240, Math.max(40, val));
    bpmSlider.value = bpm;
  }
};

bpmInput.onblur = () => {
  let val = parseInt(bpmInput.value, 10);
  if (isNaN(val) || val < 40) val = 40;
  if (val > 240) val = 240;
  updateBpm(val, true, true);
};

bpmInput.onkeydown = (e) => {
  if (e.key === 'Enter') {
    bpmInput.blur();
  }
};

// Panel Toggle Buttons (Channel Rack / Piano Roll / Mixer)
const rackWin = document.getElementById('channelRackWindow');
const prWin = document.getElementById('pianoRollWindow');
const mixerWin = document.getElementById('mixerWindow');

const toggleRackBtn = document.getElementById('toggleRackBtn');
const togglePrBtn = document.getElementById('togglePrBtn');
const toggleMixerBtn = document.getElementById('toggleMixerBtn');

toggleRackBtn.onclick = () => {
  const isHidden = rackWin.style.display === 'none';
  rackWin.style.display = isHidden ? 'block' : 'none';
  toggleRackBtn.classList.toggle('active', isHidden);
};

togglePrBtn.onclick = () => {
  const isHidden = prWin.style.display === 'none';
  prWin.style.display = isHidden ? 'flex' : 'none';
  togglePrBtn.classList.toggle('active', isHidden);
  if (isHidden) {
    renderPianoRoll();
  }
};

toggleMixerBtn.onclick = () => {
  const isHidden = mixerWin.style.display === 'none';
  mixerWin.style.display = isHidden ? 'flex' : 'none';
  toggleMixerBtn.classList.toggle('active', isHidden);
};

// Swing Slider Control
const swingSlider = document.getElementById('swingSlider');
const swingVal = document.getElementById('swingVal');
swingSlider.oninput = (e) => {
  swing = parseInt(e.target.value, 10);
  swingVal.textContent = `${swing}%`;
};

// Graph Editor State & Toggle
let isGraphEditorOpen = false;
let isPaintingVelocity = false;
window.addEventListener('mouseup', () => isPaintingVelocity = false);

const toggleGraphEditorBtn = document.getElementById('toggleGraphEditorBtn');
toggleGraphEditorBtn.onclick = () => {
  isGraphEditorOpen = !isGraphEditorOpen;
  toggleGraphEditorBtn.classList.toggle('active', isGraphEditorOpen);
  renderRack();
};

// Initial Render
renderRack();
renderMixerStrips();
setupFxControls();
setupPianoRollControls();
renderPianoRoll();
