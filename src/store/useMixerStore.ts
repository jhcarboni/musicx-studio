import { create } from 'zustand';
import { MixerTrack } from '../types';

interface MixerState {
  tracks: MixerTrack[];
  selectedTrackId: number;

  // Actions
  setTrackVol: (trackId: number, vol: number) => void;
  setTrackPan: (trackId: number, pan: number) => void;
  toggleTrackMute: (trackId: number) => void;
  toggleTrackSolo: (trackId: number) => void;
  setEq: (trackId: number, band: 'eqLow' | 'eqMid' | 'eqHigh', val: number) => void;
  setSend: (trackId: number, effect: 'revSend' | 'delSend' | 'distSend', val: number) => void;
  selectTrack: (trackId: number) => void;
}

const DEFAULT_TRACKS: MixerTrack[] = [
  {
    id: 0,
    name: 'Master',
    vol: 1.0,
    pan: 0,
    muted: false,
    solo: false,
    eqLow: 0,
    eqMid: 0,
    eqHigh: 0,
    revSend: 0,
    delSend: 0,
    distSend: 0
  },
  {
    id: 1,
    name: 'Kick Insert',
    vol: 0.9,
    pan: 0,
    muted: false,
    solo: false,
    eqLow: 2,
    eqMid: -1,
    eqHigh: 0,
    revSend: 0.05,
    delSend: 0,
    distSend: 0.15
  },
  {
    id: 2,
    name: 'Snare Insert',
    vol: 0.85,
    pan: 0,
    muted: false,
    solo: false,
    eqLow: -2,
    eqMid: 1,
    eqHigh: 2,
    revSend: 0.25,
    delSend: 0.1,
    distSend: 0.05
  },
  {
    id: 3,
    name: 'HiHat Insert',
    vol: 0.75,
    pan: 0.1,
    muted: false,
    solo: false,
    eqLow: -4,
    eqMid: 0,
    eqHigh: 3,
    revSend: 0.15,
    delSend: 0.2,
    distSend: 0
  },
  {
    id: 4,
    name: 'Clap Insert',
    vol: 0.8,
    pan: -0.1,
    muted: false,
    solo: false,
    eqLow: -3,
    eqMid: 1,
    eqHigh: 1,
    revSend: 0.35,
    delSend: 0.15,
    distSend: 0.1
  }
];

export const useMixerStore = create<MixerState>((set) => ({
  tracks: DEFAULT_TRACKS,
  selectedTrackId: 0,

  setTrackVol: (trackId, vol) => set((state) => ({
    tracks: state.tracks.map(t => t.id === trackId ? { ...t, vol: Math.max(0, Math.min(1.2, vol)) } : t)
  })),

  setTrackPan: (trackId, pan) => set((state) => ({
    tracks: state.tracks.map(t => t.id === trackId ? { ...t, pan: Math.max(-1, Math.min(1, pan)) } : t)
  })),

  toggleTrackMute: (trackId) => set((state) => ({
    tracks: state.tracks.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t)
  })),

  toggleTrackSolo: (trackId) => set((state) => {
    const isCurrentlySolo = state.tracks.find(t => t.id === trackId)?.solo;
    return {
      tracks: state.tracks.map(t => ({
        ...t,
        solo: t.id === trackId ? !isCurrentlySolo : false
      }))
    };
  }),

  setEq: (trackId, band, val) => set((state) => ({
    tracks: state.tracks.map(t => t.id === trackId ? { ...t, [band]: Math.max(-12, Math.min(12, val)) } : t)
  })),

  setSend: (trackId, effect, val) => set((state) => ({
    tracks: state.tracks.map(t => t.id === trackId ? { ...t, [effect]: Math.max(0, Math.min(1, val)) } : t)
  })),

  selectTrack: (trackId) => set({ selectedTrackId: trackId })
}));
