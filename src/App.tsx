import React, { useEffect } from 'react';
import { 
  Play, Square, Sliders, Music, Download, 
  CheckCircle2, Clock, Volume2, Activity,
  Grid, Plus, Layers, Sparkles
} from 'lucide-react';
import { useProjectStore } from './store/useProjectStore';
import { useMixerStore } from './store/useMixerStore';
import { audioEngine } from './audio/AudioEngine';
import { exportSongToWAV } from './audio/WavExporter';

export default function App() {
  const { 
    bpm, swing, isPlaying, playMode, currentStep, currentBar,
    activePatternId, activeWindow, activeChannelId, channels,
    patterns, setBpm, setSwing, setPlayMode, setActivePatternId,
    setActiveWindow, setActiveChannelId, toggleStep, setChannelVol,
    setChannelPan, toggleChannelMute, toggleChannelSolo, createNewPattern,
    loadDemoSong
  } = useProjectStore();

  const { tracks, selectedTrackId, setTrackVol } = useMixerStore();

  // Spacebar Play / Pause shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        if (isPlaying) {
          audioEngine.stop();
        } else {
          audioEngine.start();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.stop();
    } else {
      audioEngine.start();
    }
  };

  const handleExportWAV = async () => {
    try {
      const blob = await exportSongToWAV(16);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `musicx_studio_export_${Date.now()}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro na exportação:', err);
    }
  };

  const waves = [
    { id: 0, title: 'Onda 0: Fundação & Design System', desc: 'Vite + React + TypeScript + Tailwind CSS configurados', done: true },
    { id: 1, title: 'Onda 1: Audio Engine & Zustand Store', desc: 'Síntese pura desvinculada do ciclo React e sincronização atômica', done: true },
    { id: 2, title: 'Onda 2: Toolbar & Channel Rack 16 Steps', desc: 'Knobs táteis, sequenciador com drag-and-drop de samples', done: false },
    { id: 3, title: 'Onda 3: Mixer Dedicado & Analisador Canvas', desc: '5 tracks, sends de FX (Reverb/Delay/Dist) e espectro em tempo real', done: false },
    { id: 4, title: 'Onda 4: Piano Roll & Velocity Graph', desc: 'Grade melódica C2-B5, sintetizador polifônico e controle de dinâmica', done: false },
    { id: 5, title: 'Onda 5: Playlist Arranger & Export WAV', desc: 'Timeline horizontal de 16 compassos e renderizador estéreo offline', done: false },
  ];

  return (
    <div className="min-h-screen bg-fl-bg text-gray-200 flex flex-col font-sans selection:bg-fl-accent selection:text-white">
      {/* ========================================================= */}
      {/* FL STUDIO TOP TOOLBAR                                     */}
      {/* ========================================================= */}
      <header className="h-14 bg-fl-panel border-b border-fl-border px-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🎛️</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-white flex items-center gap-1.5">
                MUSICX STUDIO <span className="text-[10px] px-1.5 py-0.2 bg-fl-accent/20 text-fl-accent rounded border border-fl-accent/30 font-mono">v2.0 PRO</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono tracking-tight">REACT + TONE DSP CORE</span>
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
              title="Play / Pause (Space)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              onClick={() => audioEngine.stop()}
              className="p-1.5 rounded bg-fl-panel hover:bg-fl-border text-gray-300 hover:text-fl-red transition-all"
              title="Stop"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>

            {/* PAT / SONG Radio Toggle */}
            <div className="flex items-center ml-2 bg-fl-bg rounded p-0.5 border border-fl-border text-[11px] font-mono">
              <button
                onClick={() => setPlayMode('PAT')}
                className={`px-2 py-0.5 rounded transition-all ${
                  playMode === 'PAT' ? 'bg-fl-accent text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                PAT
              </button>
              <button
                onClick={() => setPlayMode('SONG')}
                className={`px-2 py-0.5 rounded transition-all ${
                  playMode === 'SONG' ? 'bg-fl-accent text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                SONG
              </button>
            </div>
          </div>

          {/* LCD BPM Display */}
          <div className="flex items-center gap-2 bg-fl-lcd-bg px-3 py-1 rounded border border-fl-lcd/30 shadow-lcd-glow">
            <span className="text-[10px] font-mono text-fl-lcd/70 uppercase">BPM</span>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-14 bg-transparent text-fl-lcd font-mono font-bold text-sm outline-none text-right"
              min="40"
              max="240"
            />
          </div>

          {/* Pattern Selector */}
          <div className="flex items-center gap-1 bg-fl-surface px-2 py-1 rounded border border-fl-border text-xs">
            <span className="text-gray-400 text-[11px]">Pattern:</span>
            <button 
              onClick={() => setActivePatternId(Math.max(1, activePatternId - 1))}
              className="px-1 text-gray-400 hover:text-white font-bold"
            >
              ‹
            </button>
            <span className="font-mono text-fl-accent font-bold px-1">Pattern {activePatternId}</span>
            <button 
              onClick={() => setActivePatternId(Math.min(patterns.length, activePatternId + 1))}
              className="px-1 text-gray-400 hover:text-white font-bold"
            >
              ›
            </button>
            <button
              onClick={createNewPattern}
              className="ml-1 p-0.5 text-gray-400 hover:text-fl-green"
              title="Novo Pattern"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Window View Toggles & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadDemoSong}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-fl-surface hover:bg-fl-border border border-fl-border rounded-md text-xs font-semibold text-fl-green transition-all"
            title="Carregar Demo Song Completo"
          >
            <Sparkles className="w-3.5 h-3.5" /> Demo Song
          </button>

          <button
            onClick={handleExportWAV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-fl-surface hover:bg-fl-border border border-fl-border rounded-md text-xs font-semibold text-fl-accent transition-all hover:shadow-fl-glow"
          >
            <Download className="w-3.5 h-3.5" /> Export WAV
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* WORKSPACE & MODERN CHANNEL RACK LIVE PREVIEW              */}
      {/* ========================================================= */}
      <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
        {/* Step Sequencer / Channel Rack Core Component Preview */}
        <div className="bg-fl-panel border border-fl-border rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-fl-surface px-4 py-2.5 border-b border-fl-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-fl-accent" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Channel Rack (Sequenciador 16 Passos)</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-gray-400">Compasso: <strong className="text-fl-lcd">{currentBar + 1}</strong>/16</span>
              <span className="text-gray-400">Passo: <strong className="text-fl-accent">{currentStep + 1}</strong>/16</span>
            </div>
          </div>

          {/* Channel Rows */}
          <div className="p-4 divide-y divide-fl-border/40 space-y-3">
            {channels.map((ch) => (
              <div key={ch.id} className="pt-3 first:pt-0 flex items-center gap-3">
                {/* Channel Controls (Mute, Solo, Name) */}
                <div className="w-48 flex items-center justify-between bg-fl-surface px-2.5 py-1.5 rounded border border-fl-border">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleChannelMute(ch.id)}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        ch.muted ? 'bg-fl-red text-white' : 'bg-fl-panel text-gray-400 hover:text-white'
                      }`}
                    >
                      M
                    </button>
                    <button
                      onClick={() => toggleChannelSolo(ch.id)}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        ch.solo ? 'bg-fl-green text-black' : 'bg-fl-panel text-gray-400 hover:text-white'
                      }`}
                    >
                      S
                    </button>
                    <span className="text-xs font-semibold text-white truncate max-w-[85px]">{ch.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">Trk {ch.trackIdx}</span>
                </div>

                {/* 16 Step Buttons */}
                <div className="flex-1 grid grid-cols-16 gap-1">
                  {ch.pattern.map((active, stepIdx) => {
                    const isBeatBlockA = Math.floor(stepIdx / 4) % 2 === 0;
                    const isCurrentPlayhead = isPlaying && currentStep === stepIdx;

                    return (
                      <button
                        key={stepIdx}
                        onClick={() => toggleStep(ch.id, stepIdx)}
                        className={`h-9 rounded transition-all duration-75 relative flex items-center justify-center border ${
                          active === 1
                            ? 'bg-fl-accent border-fl-accent text-white shadow-fl-glow/40'
                            : isBeatBlockA
                              ? 'bg-fl-step-off-a/80 border-fl-border/60 hover:border-gray-400'
                              : 'bg-fl-step-off-b/80 border-fl-border/40 hover:border-gray-400'
                        } ${isCurrentPlayhead ? 'ring-2 ring-fl-lcd ring-offset-1 ring-offset-fl-bg scale-105 z-10' : ''}`}
                      >
                        {active === 1 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap Progress Status */}
        <div className="bg-fl-panel border border-fl-border rounded-xl p-5 shadow-lg">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-fl-accent" />
            Progresso da Modernização em Ondas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {waves.map((wave) => (
              <div
                key={wave.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  wave.done 
                    ? 'bg-fl-surface/80 border-fl-green/50 shadow-sm' 
                    : wave.id === 2 
                      ? 'bg-fl-panel border-fl-accent/60 shadow-fl-glow/20' 
                      : 'bg-fl-panel/40 border-fl-border opacity-70'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span className={`text-xs font-mono font-bold ${wave.done ? 'text-fl-green' : wave.id === 2 ? 'text-fl-accent' : 'text-gray-400'}`}>
                    ONDA {wave.id}
                  </span>
                  {wave.done ? (
                    <span className="flex items-center gap-1 text-[11px] text-fl-green font-semibold bg-fl-green/10 px-2 py-0.5 rounded border border-fl-green/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                    </span>
                  ) : wave.id === 2 ? (
                    <span className="flex items-center gap-1 text-[11px] text-fl-accent font-semibold bg-fl-accent/10 px-2 py-0.5 rounded border border-fl-accent/30 animate-pulse">
                      <Clock className="w-3.5 h-3.5" /> Próxima
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-500 font-mono">Pendente</span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white mb-0.5">{wave.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{wave.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-7 bg-fl-panel border-t border-fl-border px-4 flex items-center justify-between text-[11px] font-mono text-gray-400 shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-fl-green animate-ping' : 'bg-gray-500'}`}></span>
            Áudio Engine: {isPlaying ? 'Em Execução' : 'Standby'}
          </span>
          <span>Sample Rate: 44.1 kHz</span>
          <span>Buffer: 512 samples</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Branch: <span className="text-fl-accent">feature/react-modernization</span></span>
        </div>
      </footer>
    </div>
  );
}
