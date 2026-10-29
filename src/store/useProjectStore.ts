import { create } from 'zustand';
import { Channel, Pattern, PlaylistClip, Note, PlayMode, ActiveWindow } from '../types';

interface ProjectState {
  bpm: number;
  swing: number; // 0.0 to 1.0
  isPlaying: boolean;
  playMode: PlayMode;
  currentStep: number; // 0 to 15
  currentBar: number;  // 0 to 15
  activePatternId: number;
  activeWindow: ActiveWindow;
  activeChannelId: string;
  channels: Channel[];
  patterns: Pattern[];
  playlistClips: PlaylistClip[];

  // Actions
  setBpm: (bpm: number) => void;
  setSwing: (swing: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlayMode: (mode: PlayMode) => void;
  setCurrentStep: (step: number) => void;
  setCurrentBar: (bar: number) => void;
  setActivePatternId: (id: number) => void;
  setActiveWindow: (window: ActiveWindow) => void;
  setActiveChannelId: (id: string) => void;
  toggleStep: (channelId: string, stepIndex: number) => void;
  setVelocity: (channelId: string, stepIndex: number, velocity: number) => void;
  setChannelVol: (channelId: string, vol: number) => void;
  setChannelPan: (channelId: string, pan: number) => void;
  toggleChannelMute: (channelId: string) => void;
  toggleChannelSolo: (channelId: string) => void;
  setCustomBuffer: (channelId: string, buffer: AudioBuffer, name: string) => void;
  setChannelSoundFont: (channelId: string, presetId: string, presetName: string) => void;
  setCustomSoundFont: (channelId: string, sfId: string, name: string) => void;
  resetChannelToSynth: (channelId: string) => void;
  createNewPattern: () => void;
  addNote: (channelId: string, note: Note) => void;
  removeNote: (channelId: string, midi: number, step: number) => void;
  togglePlaylistClip: (trackIdx: number, bar: number) => void;
  loadDemoSong: () => void;
}

const DEFAULT_CHANNELS: Channel[] = [
  {
    id: 'kick',
    name: 'Kick 808',
    vol: 0.9,
    pan: 0,
    muted: false,
    solo: false,
    trackIdx: 1,
    color: '#ff851b',
    customBuffer: null,
    velocities: [0.95, 0.70, 0.70, 0.70, 0.95, 0.70, 0.70, 0.70, 0.95, 0.70, 0.70, 0.70, 0.95, 0.70, 0.70, 0.70],
    pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    notes: []
  },
  {
    id: 'snare',
    name: 'Snare Hard',
    vol: 0.75,
    pan: 0,
    muted: false,
    solo: false,
    trackIdx: 2,
    color: '#3b82f6',
    customBuffer: null,
    velocities: [0.70, 0.70, 0.70, 0.70, 0.90, 0.70, 0.70, 0.70, 0.70, 0.70, 0.70, 0.70, 0.90, 0.70, 0.70, 0.70],
    pattern: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    notes: []
  },
  {
    id: 'hihat',
    name: 'HiHat Clsd',
    vol: 0.65,
    pan: 0.1,
    muted: false,
    solo: false,
    trackIdx: 3,
    color: '#00ffcc',
    customBuffer: null,
    velocities: [0.80, 0.50, 0.70, 0.50, 0.80, 0.50, 0.70, 0.50, 0.80, 0.50, 0.70, 0.50, 0.80, 0.50, 0.70, 0.50],
    pattern: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    notes: []
  },
  {
    id: 'clap',
    name: 'Clap 909',
    vol: 0.7,
    pan: -0.1,
    muted: false,
    solo: false,
    trackIdx: 4,
    color: '#a855f7',
    customBuffer: null,
    velocities: [0.70, 0.70, 0.70, 0.70, 0.70, 0.70, 0.70, 0.70, 0.70, 0.70, 0.70, 0.70, 0.85, 0.70, 0.70, 0.70],
    pattern: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    notes: []
  }
];

export const useProjectStore = create<ProjectState>((set, get) => ({
  bpm: 130,
  swing: 0,
  isPlaying: false,
  playMode: 'PAT',
  currentStep: 0,
  currentBar: 0,
  activePatternId: 1,
  activeWindow: 'rack',
  activeChannelId: 'kick',
  channels: DEFAULT_CHANNELS,
  patterns: [
    {
      id: 1,
      name: 'Pattern 1',
      color: '#ff851b',
      channels: {
        kick: { pattern: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0], velocities: Array(16).fill(0.8), notes: [] },
        snare: { pattern: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], velocities: Array(16).fill(0.8), notes: [] },
        hihat: { pattern: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1], velocities: Array(16).fill(0.7), notes: [] },
        clap: { pattern: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0], velocities: Array(16).fill(0.8), notes: [] }
      }
    }
  ],
  playlistClips: [
    { id: 'clip-1-0', trackIdx: 0, bar: 0, lengthBars: 1, patternId: 1, color: '#ff851b' },
    { id: 'clip-1-1', trackIdx: 0, bar: 1, lengthBars: 1, patternId: 1, color: '#ff851b' },
    { id: 'clip-1-2', trackIdx: 0, bar: 2, lengthBars: 1, patternId: 1, color: '#ff851b' },
    { id: 'clip-1-3', trackIdx: 0, bar: 3, lengthBars: 1, patternId: 1, color: '#ff851b' },
  ],

  setBpm: (bpm) => set({ bpm: Math.min(240, Math.max(40, bpm)) }),
  setSwing: (swing) => set({ swing: Math.min(1, Math.max(0, swing)) }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlayMode: (playMode) => set({ playMode }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setCurrentBar: (currentBar) => set({ currentBar }),
  setActiveWindow: (activeWindow) => set({ activeWindow }),
  setActiveChannelId: (activeChannelId) => set({ activeChannelId }),

  setActivePatternId: (id) => {
    const { patterns, channels } = get();
    // Salva o pattern atual
    const currentPatId = get().activePatternId;
    const updatedPatterns = patterns.map(p => {
      if (p.id === currentPatId) {
        const channelState: any = {};
        channels.forEach(ch => {
          channelState[ch.id] = {
            pattern: [...ch.pattern],
            velocities: [...ch.velocities],
            notes: [...ch.notes]
          };
        });
        return { ...p, channels: channelState };
      }
      return p;
    });

    // Carrega o novo pattern
    const targetPat = updatedPatterns.find(p => p.id === id);
    if (targetPat) {
      const updatedChannels = channels.map(ch => {
        const saved = targetPat.channels[ch.id];
        if (saved) {
          return {
            ...ch,
            pattern: [...saved.pattern],
            velocities: [...saved.velocities],
            notes: [...saved.notes]
          };
        }
        return ch;
      });
      set({ activePatternId: id, patterns: updatedPatterns, channels: updatedChannels });
    } else {
      set({ activePatternId: id, patterns: updatedPatterns });
    }
  },

  toggleStep: (channelId, stepIndex) => set((state) => ({
    channels: state.channels.map(ch => {
      if (ch.id === channelId) {
        const newPattern = [...ch.pattern];
        newPattern[stepIndex] = newPattern[stepIndex] === 1 ? 0 : 1;
        return { ...ch, pattern: newPattern };
      }
      return ch;
    })
  })),

  setVelocity: (channelId, stepIndex, velocity) => set((state) => ({
    channels: state.channels.map(ch => {
      if (ch.id === channelId) {
        const newVels = [...ch.velocities];
        newVels[stepIndex] = Math.min(1, Math.max(0, velocity));
        return { ...ch, velocities: newVels };
      }
      return ch;
    })
  })),

  setChannelVol: (channelId, vol) => set((state) => ({
    channels: state.channels.map(ch => ch.id === channelId ? { ...ch, vol } : ch)
  })),

  setChannelPan: (channelId, pan) => set((state) => ({
    channels: state.channels.map(ch => ch.id === channelId ? { ...ch, pan } : ch)
  })),

  toggleChannelMute: (channelId) => set((state) => ({
    channels: state.channels.map(ch => ch.id === channelId ? { ...ch, muted: !ch.muted } : ch)
  })),

  toggleChannelSolo: (channelId) => set((state) => {
    const isCurrentlySolo = state.channels.find(ch => ch.id === channelId)?.solo;
    return {
      channels: state.channels.map(ch => ({
        ...ch,
        solo: ch.id === channelId ? !isCurrentlySolo : false
      }))
    };
  }),

  setCustomBuffer: (channelId, buffer, name) => set((state) => ({
    channels: state.channels.map(ch => ch.id === channelId ? {
      ...ch,
      customBuffer: buffer,
      name,
      instrumentType: undefined,
      soundfontPreset: undefined
    } : ch)
  })),

  setChannelSoundFont: (channelId, presetId, presetName) => set((state) => ({
    channels: state.channels.map(ch => ch.id === channelId ? {
      ...ch,
      instrumentType: 'soundfont',
      soundfontPreset: presetId,
      soundfontLoaded: true,
      name: presetName,
      customBuffer: null
    } : ch)
  })),

  setCustomSoundFont: (channelId, sfId, name) => set((state) => ({
    channels: state.channels.map(ch => ch.id === channelId ? {
      ...ch,
      instrumentType: 'custom_sf2',
      soundfontPreset: sfId,
      soundfontLoaded: true,
      name,
      customBuffer: null
    } : ch)
  })),

  resetChannelToSynth: (channelId) => set((state) => {
    const defaultNames: Record<string, string> = {
      kick: 'Kick 808',
      snare: 'Snare Hard',
      hihat: 'HiHat Clsd',
      clap: 'Clap 909'
    };
    return {
      channels: state.channels.map(ch => ch.id === channelId ? {
        ...ch,
        instrumentType: 'synth',
        soundfontPreset: undefined,
        soundfontLoaded: false,
        name: defaultNames[ch.id] || ch.name,
        customBuffer: null
      } : ch)
    };
  }),

  createNewPattern: () => {
    const { patterns } = get();
    const newId = patterns.length + 1;
    const colors = ['#ff851b', '#3b82f6', '#00ffcc', '#a855f7', '#2ecc40', '#eab308'];
    const newPattern: Pattern = {
      id: newId,
      name: `Pattern ${newId}`,
      color: colors[(newId - 1) % colors.length],
      channels: {}
    };
    set({ patterns: [...patterns, newPattern] });
    get().setActivePatternId(newId);
  },

  addNote: (channelId, note) => set((state) => ({
    channels: state.channels.map(ch => {
      if (ch.id === channelId) {
        const filtered = ch.notes.filter(n => !(n.midi === note.midi && n.step === note.step));
        return { ...ch, notes: [...filtered, note] };
      }
      return ch;
    })
  })),

  removeNote: (channelId, midi, step) => set((state) => ({
    channels: state.channels.map(ch => {
      if (ch.id === channelId) {
        return { ...ch, notes: ch.notes.filter(n => !(n.midi === midi && n.step === step)) };
      }
      return ch;
    })
  })),

  togglePlaylistClip: (trackIdx, bar) => set((state) => {
    const existing = state.playlistClips.find(c => c.trackIdx === trackIdx && c.bar === bar);
    if (existing) {
      return { playlistClips: state.playlistClips.filter(c => c.id !== existing.id) };
    }
    const currentPattern = state.patterns.find(p => p.id === state.activePatternId);
    const newClip: PlaylistClip = {
      id: `clip-${trackIdx}-${bar}-${Date.now()}`,
      trackIdx,
      bar,
      lengthBars: 1,
      patternId: state.activePatternId,
      color: currentPattern?.color || '#ff851b'
    };
    return { playlistClips: [...state.playlistClips, newClip] };
  }),

  loadDemoSong: () => {
    const demoClips: PlaylistClip[] = [
      { id: 'd0', trackIdx: 0, bar: 0, lengthBars: 1, patternId: 1, color: '#ff851b' },
      { id: 'd1', trackIdx: 0, bar: 1, lengthBars: 1, patternId: 1, color: '#ff851b' },
      { id: 'd2', trackIdx: 0, bar: 2, lengthBars: 1, patternId: 1, color: '#ff851b' },
      { id: 'd3', trackIdx: 0, bar: 3, lengthBars: 1, patternId: 1, color: '#ff851b' },
      { id: 'd4', trackIdx: 1, bar: 2, lengthBars: 1, patternId: 1, color: '#3b82f6' },
      { id: 'd5', trackIdx: 1, bar: 3, lengthBars: 1, patternId: 1, color: '#3b82f6' },
      { id: 'd6', trackIdx: 2, bar: 0, lengthBars: 1, patternId: 1, color: '#00ffcc' },
      { id: 'd7', trackIdx: 2, bar: 1, lengthBars: 1, patternId: 1, color: '#00ffcc' },
      { id: 'd8', trackIdx: 2, bar: 2, lengthBars: 1, patternId: 1, color: '#00ffcc' },
      { id: 'd9', trackIdx: 2, bar: 3, lengthBars: 1, patternId: 1, color: '#00ffcc' },
      { id: 'd10', trackIdx: 3, bar: 3, lengthBars: 1, patternId: 1, color: '#a855f7' }
    ];
    set({ playlistClips: demoClips, playMode: 'SONG' });
  }
}));
