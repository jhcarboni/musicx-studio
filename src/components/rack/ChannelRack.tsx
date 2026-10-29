import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { ChannelRow } from './ChannelRow';
import { Grid, SlidersHorizontal, Info } from 'lucide-react';

export const ChannelRack: React.FC = () => {
  const { channels, swing, setSwing, patterns, activePatternId } = useProjectStore();
  const currentPattern = patterns.find(p => p.id === activePatternId);

  return (
    <div className="bg-fl-panel border border-fl-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
      {/* Rack Header */}
      <div className="bg-fl-surface px-4 py-2.5 border-b border-fl-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-fl-accent" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Channel Rack — {currentPattern?.name || `Pattern ${activePatternId}`}
          </span>
        </div>

        {/* Swing Groove Slider */}
        <div className="flex items-center gap-2 bg-fl-bg px-3 py-1 rounded border border-fl-border text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-fl-accent" />
          <span className="text-[11px] text-gray-400 font-mono">Swing:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={swing}
            onChange={(e) => setSwing(Number(e.target.value))}
            className="w-20 accent-fl-accent cursor-pointer h-1.5 bg-fl-border rounded-lg"
          />
          <span className="text-[11px] font-mono text-fl-accent font-bold w-9 text-right">
            {Math.round(swing * 100)}%
          </span>
        </div>
      </div>

      {/* Step Numbers Legend (1 to 16) */}
      <div className="flex items-center gap-3 px-3 pt-2 pb-1 text-[10px] font-mono text-gray-400">
        <div className="w-56 shrink-0 pl-3">CANAL / CONTROLES</div>
        <div className="flex-1 grid grid-cols-16 gap-1 text-center">
          {Array.from({ length: 16 }).map((_, i) => {
            const isBeatStart = i % 4 === 0;
            return (
              <span 
                key={i} 
                className={isBeatStart ? 'text-fl-accent font-bold' : 'text-gray-500'}
              >
                {i + 1}
              </span>
            );
          })}
        </div>
      </div>

      {/* Channel Rows */}
      <div className="p-3 space-y-2.5 flex-1">
        {channels.map((channel) => (
          <ChannelRow key={channel.id} channel={channel} />
        ))}
      </div>

      {/* Rack Footer Tip */}
      <div className="bg-fl-surface/50 px-4 py-2 border-t border-fl-border/40 flex items-center justify-between text-[11px] text-gray-400 font-mono">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-fl-accent" />
          <span>Arraste e solte arquivos <strong>.wav</strong> ou <strong>.mp3</strong> do seu computador em qualquer canal.</span>
        </div>
        <span className="text-gray-400">4 Canais DSP Ativos</span>
      </div>
    </div>
  );
};
