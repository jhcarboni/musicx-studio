import React from 'react';
import { useMixerStore } from '../../store/useMixerStore';
import { MixerStrip } from './MixerStrip';
import { AudioVisualizer } from './AudioVisualizer';
import { Sliders, Volume2, ShieldCheck } from 'lucide-react';

export const Mixer: React.FC = () => {
  const { tracks } = useMixerStore();

  const masterTrack = tracks.find(t => t.id === 0);
  const insertTracks = tracks.filter(t => t.id !== 0);

  return (
    <div className="bg-fl-panel border border-fl-border rounded-xl shadow-2xl overflow-hidden flex flex-col space-y-4 p-4">
      {/* Mixer Header */}
      <div className="flex items-center justify-between pb-3 border-b border-fl-border">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-fl-accent" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Mixer & Processador DSP — Canais Independentes
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1 text-fl-green">
            <ShieldCheck className="w-3.5 h-3.5" />
            Master Limiter Ativo (-0.5 dB)
          </span>
          <span className="text-gray-400">
            Saída: <strong>44.1 kHz Estéreo</strong>
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
          <span>Cada canal possui EQ de 3 bandas, fader calibrado em dB e barramentos de Reverb, Delay e Distorção.</span>
        </div>
        <span className="text-gray-400">Roteamento: 100% Nativo Web Audio</span>
      </div>
    </div>
  );
};
