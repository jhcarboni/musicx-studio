import React, { useState } from 'react';
import { 
  Play, Square, Sliders, Music, Download, 
  Grid, Plus, Layers, Sparkles, Loader2, Globe 
} from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { audioEngine } from '../../audio/AudioEngine';
import { exportSongToWAV } from '../../audio/WavExporter';
import { LcdDisplay } from '../common/LcdDisplay';

export const TopToolbar: React.FC = () => {
  const {
    bpm, isPlaying, playMode, activePatternId, patterns,
    activeWindow, setBpm, setPlayMode, setActivePatternId,
    setActiveWindow, createNewPattern, loadDemoSong
  } = useProjectStore();

  const { t, language, setLanguage } = useLanguageStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.stop();
    } else {
      audioEngine.start();
    }
  };

  const handleExportWAV = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      const blob = await exportSongToWAV(16);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `musicx_studio_master_${Date.now()}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro na exportação:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="h-14 bg-fl-panel border-b border-fl-border px-4 flex items-center justify-between shadow-md shrink-0 select-none">
      <div className="flex items-center gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🎛️</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold tracking-wider text-white">
              MUSICX STUDIO
            </span>
            <span className="text-[10px] px-1.5 py-0.2 bg-fl-accent/20 text-fl-accent rounded border border-fl-accent/30 font-mono font-bold">
              v2.0 PRO
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-fl-border" />

        {/* Transport Controls */}
        <div className="flex items-center gap-1.5 bg-fl-surface px-2 py-1 rounded-md border border-fl-border">
          <button
            onClick={handleTogglePlay}
            className={`p-1.5 rounded transition-all flex items-center gap-1 text-xs font-semibold ${
              isPlaying 
                ? 'bg-fl-green text-black shadow-lg shadow-fl-green/30 animate-pulse' 
                : 'bg-fl-panel text-gray-200 hover:bg-fl-border hover:text-white'
            }`}
            title={`${isPlaying ? t.pause : t.play} (Space)`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
          <button
            onClick={() => audioEngine.stop()}
            className="p-1.5 rounded bg-fl-panel hover:bg-fl-border text-gray-300 hover:text-fl-red transition-all"
            title={`${t.stop} (Enter)`}
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* PAT / SONG Radio Toggle */}
          <div className="flex items-center ml-2 bg-fl-bg rounded p-0.5 border border-fl-border text-[11px] font-mono">
            <button
              onClick={() => setPlayMode('PAT')}
              className={`px-2 py-0.5 rounded transition-all ${
                playMode === 'PAT' ? 'bg-fl-accent text-white font-bold shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              PAT
            </button>
            <button
              onClick={() => setPlayMode('SONG')}
              className={`px-2 py-0.5 rounded transition-all ${
                playMode === 'SONG' ? 'bg-fl-accent text-white font-bold shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              SONG
            </button>
          </div>
        </div>

        {/* LCD BPM Display */}
        <LcdDisplay
          label="BPM"
          value={bpm}
          min={40}
          max={240}
          onChange={setBpm}
        />

        {/* Pattern Selector */}
        <div className="flex items-center gap-1 bg-fl-surface px-2 py-1 rounded border border-fl-border text-xs">
          <span className="text-gray-400 text-[11px]">{t.pattern}:</span>
          <button 
            onClick={() => setActivePatternId(Math.max(1, activePatternId - 1))}
            className="px-1 text-gray-400 hover:text-white font-bold"
          >
            ‹
          </button>
          <span className="font-mono text-fl-accent font-bold px-1">{t.pattern} {activePatternId}</span>
          <button 
            onClick={() => setActivePatternId(Math.min(patterns.length, activePatternId + 1))}
            className="px-1 text-gray-400 hover:text-white font-bold"
          >
            ›
          </button>
          <button
            onClick={createNewPattern}
            className="ml-1 p-0.5 text-gray-400 hover:text-fl-green transition-colors"
            title={t.newPattern}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Window View Toggles & Actions */}
      <div className="flex items-center gap-2">
        {/* Navigation Tabs */}
        <div className="flex items-center bg-fl-surface p-1 rounded-md border border-fl-border text-xs">
          <button
            onClick={() => setActiveWindow('rack')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeWindow === 'rack' ? 'bg-fl-panel text-fl-accent font-semibold shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> {t.rack}
          </button>
          <button
            onClick={() => setActiveWindow('pianoroll')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeWindow === 'pianoroll' ? 'bg-fl-panel text-fl-accent font-semibold shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" /> {t.pianoroll}
          </button>
          <button
            onClick={() => setActiveWindow('mixer')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeWindow === 'mixer' ? 'bg-fl-panel text-fl-accent font-semibold shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> {t.mixer}
          </button>
          <button
            onClick={() => setActiveWindow('playlist')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeWindow === 'playlist' ? 'bg-fl-panel text-fl-accent font-semibold shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> {t.playlist}
          </button>
        </div>

        {/* Demo Song Button */}
        <button
          onClick={() => {
            loadDemoSong();
            setPlayMode('SONG');
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-fl-surface hover:bg-fl-border border border-fl-border rounded-md text-xs font-semibold text-fl-green transition-all"
          title={t.loadDemoSong}
        >
          <Sparkles className="w-3.5 h-3.5" /> {t.demoSong}
        </button>

        {/* Export WAV Button */}
        <button
          onClick={handleExportWAV}
          disabled={isExporting}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            isExporting
              ? 'bg-fl-surface border border-fl-accent text-fl-accent animate-pulse cursor-wait'
              : 'bg-fl-surface hover:bg-fl-border border border-fl-border text-fl-accent hover:shadow-fl-glow'
          }`}
          title={t.exportWav}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t.exporting}
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" /> {t.exportWav}
            </>
          )}
        </button>

        {/* Language Switcher Selector (PT-BR default / EN selectable) */}
        <div className="flex items-center bg-fl-surface p-1 rounded-md border border-fl-border text-xs font-mono">
          <Globe className="w-3.5 h-3.5 text-gray-400 mr-1 ml-0.5" />
          <button
            onClick={() => setLanguage('pt-BR')}
            className={`px-1.5 py-0.5 rounded transition-all ${
              language === 'pt-BR'
                ? 'bg-fl-accent text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Mudar idioma para Português (Brasil)"
          >
            PT
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-1.5 py-0.5 rounded transition-all ${
              language === 'en'
                ? 'bg-fl-accent text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Switch language to English"
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
};
