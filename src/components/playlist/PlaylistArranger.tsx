import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { Layers, Sparkles, Trash2, Info } from 'lucide-react';

export const PlaylistArranger: React.FC = () => {
  const {
    playlistClips, togglePlaylistClip, patterns, activePatternId,
    isPlaying, playMode, currentBar, setPlayMode, loadDemoSong
  } = useProjectStore();

  const currentPattern = patterns.find(p => p.id === activePatternId);
  const trackNames = ['Track 1 (Drums)', 'Track 2 (Snare / FX)', 'Track 3 (Hats)', 'Track 4 (Melody / Clap)'];

  return (
    <div className="bg-fl-panel border border-fl-border rounded-xl shadow-2xl overflow-hidden flex flex-col select-none">
      {/* Playlist Header */}
      <div className="bg-fl-surface px-4 py-2.5 border-b border-fl-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
            <Layers className="w-4 h-4 text-fl-accent" />
            <span>Playlist / Arranjador Timeline</span>
          </div>

          {/* Active Pattern Clip Indicator */}
          <div className="flex items-center gap-2 bg-fl-bg px-2.5 py-1 rounded border border-fl-border text-xs">
            <span className="text-gray-400 text-[11px]">Pincel Ativo:</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-white">
              <span 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: currentPattern?.color || '#ff851b' }} 
              />
              <span className="text-fl-accent">{currentPattern?.name || `Pattern ${activePatternId}`}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              loadDemoSong();
              setPlayMode('SONG');
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-fl-bg hover:bg-fl-border text-fl-green border border-fl-border font-semibold transition-all"
            title="Carregar arranjo demo completo de 16 compassos"
          >
            <Sparkles className="w-3.5 h-3.5" /> Carregar Demo Song
          </button>
        </div>
      </div>

      {/* Timeline Bar Ruler (1 to 16 Bars) */}
      <div className="flex items-center bg-fl-surface/60 border-b border-fl-border px-3 py-1.5 text-[11px] font-mono text-gray-400 relative">
        <div className="w-44 shrink-0 font-bold pl-1">PISTA</div>
        <div className="flex-1 grid grid-cols-16 gap-1 text-center relative">
          {Array.from({ length: 16 }).map((_, barIdx) => {
            const isCurrentBar = isPlaying && playMode === 'SONG' && currentBar === barIdx;
            return (
              <div
                key={barIdx}
                className={`py-0.5 rounded transition-colors relative ${
                  isCurrentBar 
                    ? 'bg-fl-lcd text-black font-extrabold shadow-lcd-glow' 
                    : (barIdx % 4 === 0) 
                      ? 'text-fl-accent font-bold' 
                      : 'text-gray-400'
                }`}
              >
                <span>{barIdx + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Playlist Tracks Grid */}
      <div className="p-3 space-y-2 bg-fl-bg divide-y divide-fl-border/20">
        {trackNames.map((trackName, trackIdx) => (
          <div key={trackIdx} className="pt-2 first:pt-0 flex items-stretch h-12 gap-2">
            {/* Track Header Title */}
            <div className="w-44 shrink-0 bg-fl-surface px-2.5 py-1 rounded border border-fl-border flex items-center justify-between text-xs font-semibold text-gray-300">
              <span className="truncate">{trackName}</span>
              <span className="text-[10px] font-mono text-gray-400">Trk {trackIdx + 1}</span>
            </div>

            {/* 16 Bar Grid Cells */}
            <div className="flex-1 grid grid-cols-16 gap-1 relative">
              {Array.from({ length: 16 }).map((_, barIdx) => {
                const clip = playlistClips.find(c => c.trackIdx === trackIdx && c.bar === barIdx);
                const isCurrentBar = isPlaying && playMode === 'SONG' && currentBar === barIdx;
                const pattern = clip ? patterns.find(p => p.id === clip.patternId) : null;

                return (
                  <div
                    key={barIdx}
                    onClick={() => togglePlaylistClip(trackIdx, barIdx)}
                    className={`rounded border transition-all cursor-pointer relative flex items-center justify-center overflow-hidden ${
                      clip
                        ? 'border-white/30 shadow-md font-bold text-[10px] text-white hover:brightness-110'
                        : Math.floor(barIdx / 4) % 2 === 0
                          ? 'bg-fl-panel/60 border-fl-border/40 hover:bg-fl-surface/80 hover:border-gray-400'
                          : 'bg-fl-surface/30 border-fl-border/20 hover:bg-fl-surface/80 hover:border-gray-400'
                    } ${isCurrentBar ? 'ring-2 ring-fl-lcd ring-offset-1 ring-offset-fl-bg' : ''}`}
                    style={clip ? { backgroundColor: clip.color || '#ff851b' } : {}}
                    title={clip ? `Remover ${pattern?.name || 'Clip'} no Compasso ${barIdx + 1}` : `Adicionar no Compasso ${barIdx + 1}`}
                  >
                    {clip && (
                      <span className="truncate px-1 drop-shadow font-mono text-[9px]">
                        {pattern?.name || `Pat ${clip.patternId}`}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Playlist Footer Tip */}
      <div className="bg-fl-surface/50 px-4 py-2 border-t border-fl-border/40 flex items-center justify-between text-[11px] text-gray-400 font-mono">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-fl-accent" />
          <span>Clique em qualquer compasso vazio para pintar o clipe do pattern selecionado. Clique no clipe para remover.</span>
        </div>
        <span className="text-gray-400">Total: 16 Compassos</span>
      </div>
    </div>
  );
};
