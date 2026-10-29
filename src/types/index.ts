export type PlayMode = 'PAT' | 'SONG';

export type ActiveWindow = 'rack' | 'pianoroll' | 'mixer' | 'playlist';

export interface Note {
  midi: number;
  name: string;
  step: number;
  duration: number; // in steps (e.g. 1, 2, 4)
  velocity: number; // 0.0 to 1.0
}

export type InstrumentType = 'synth' | 'soundfont' | 'custom_sf2';

export interface Channel {
  id: string;
  name: string;
  vol: number; // 0.0 to 1.0
  pan: number; // -1.0 to 1.0
  muted: boolean;
  solo: boolean;
  trackIdx: number; // 1 to 4 (Mixer track index)
  color?: string;
  customBuffer: AudioBuffer | null;
  instrumentType?: InstrumentType;
  soundfontPreset?: string;
  soundfontLoaded?: boolean;
  pattern: number[]; // 16 steps: 0 or 1
  velocities: number[]; // 16 steps: 0.0 to 1.0
  notes: Note[];
}

export interface Pattern {
  id: number;
  name: string;
  color: string;
  channels: {
    [channelId: string]: {
      pattern: number[];
      velocities: number[];
      notes: Note[];
    };
  };
}

export interface PlaylistClip {
  id: string;
  trackIdx: number; // 0 to 3
  bar: number;      // 0 to 15
  lengthBars: number;
  patternId: number;
  color: string;
}

export interface MixerTrack {
  id: number; // 0: Master, 1-4: Inserts
  name: string;
  vol: number; // 0.0 to 1.2
  pan: number; // -1.0 to 1.0
  muted: boolean;
  solo: boolean;
  eqLow: number;  // -12 to +12 dB
  eqMid: number;  // -12 to +12 dB
  eqHigh: number; // -12 to +12 dB
  revSend: number; // 0 to 1
  delSend: number; // 0 to 1
  distSend: number; // 0 to 1
}
