import React, { useState } from 'react';
import { useMixerStore } from '../../store/useMixerStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { MixerStrip } from './MixerStrip';
import { AudioVisualizer } from './AudioVisualizer';
import { Sliders, Volume2, ShieldCheck } from 'lucide-react';

export const Mixer: React.FC = () => {
  const { tracks } = useMixerStore();
  const { channels } = useProjectStore();
  const { t } = useLanguageStore();
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);

  const masterTrack = tracks.find(t => t.id === 0);
  const activeTrackIds = new Set(channels.map(c => c.trackIdx));
  
  const insertTracks = tracks
    .filter(t => t.id !== 0)
    .filter(t => !filterActiveOnly || activeTrackIds.has(t.id));

  return (
    <div className="bg-fl-panel border border-fl-border rounded-xl shadow-2xl overflow-hidden flex flex-col space-y-4 p-4">
      {/* Mixer Header */}
      <div className="flex items-center justify-between pb-3 border-b border-fl-border flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-fl-accent" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            {t.mixerTitle}
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-fl-surface border border-fl-border text-gray-300">
            {channels.length} {t.activeDspChannels} / 16
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          {/* Toggle Todos vs Ativos */}
          <div className="flex items-center bg-fl-bg rounded border border-fl-border p-0.5 text-[11px]">
            <button
              onClick={() => setFilterActiveOnly(false)}
              className={`px-2 py-0.5 rounded transition-all ${
                !filterActiveOnly ? 'bg-fl-surface text-fl-accent font-bold shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Todos (16)
            </button>
            <button
              onClick={() => setFilterActiveOnly(true)}
              className={`px-2 py-0.5 rounded transition-all ${
                filterActiveOnly ? 'bg-fl-accent text-white font-bold shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Ativos ({channels.length})
            </button>
          </div>

          <span className="hidden sm:flex items-center gap-1 text-fl-green">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t.masterLimiterActive}
          </span>
          <span className="hidden md:inline text-gray-400">
            {t.stereoOutput}
          </span>
        </div>
      </div>

      {/* Real-time Spectrum Analyzer & Oscilloscope Canvas */}
      <AudioVisualizer height={110} />

      {/* Mixer Strips Rack */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1">
        {/* Master Strip */}
        {masterTrack && (
          <div className="flex items-stretch gap-3 pr-3 border-r border-fl-border">
            <MixerStrip track={masterTrack} isMaster={true} />
          </div>
        )}

        {/* Insert Strips */}
        <div className="flex items-stretch gap-2.5 flex-1">
          {insertTracks.map((track) => (
            <MixerStrip key={track.id} track={track} isMaster={false} />
          ))}
        </div>
      </div>

      {/* Mixer Footer info */}
      <div className="pt-2 border-t border-fl-border/40 flex items-center justify-between text-[11px] font-mono text-gray-400">
        <div className="flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-fl-accent" />
          <span>{t.mixerTip}</span>
        </div>
        <span className="text-gray-400">{t.routingInfo}</span>
      </div>
    </div>
  );
};
