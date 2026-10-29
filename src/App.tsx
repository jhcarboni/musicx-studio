import React, { useState } from 'react';
import { 
  Play, Square, Sliders, Music, Radio, Download, 
  CheckCircle2, Clock, Volume2, Sparkles, Activity,
  Maximize2, Eye, Grid
} from 'lucide-react';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(130);
  const [playMode, setPlayMode] = useState<'PAT' | 'SONG'>('PAT');
  const [activePattern, setActivePattern] = useState(1);
  const [activeWindow, setActiveWindow] = useState<'rack' | 'pianoroll' | 'mixer' | 'playlist'>('rack');

  const waves = [
    { id: 0, title: 'Onda 0: Fundação & Design System', desc: 'Vite + React + TypeScript + Tailwind CSS configurados', done: true },
    { id: 1, title: 'Onda 1: Audio Engine & Zustand Store', desc: 'Síntese pura desvinculada do ciclo React e sincronização atômica', done: false },
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
              <span className="text-[10px] text-gray-400 font-mono tracking-tight">REACT + TAILWIND ENGINE</span>
            </div>
          </div>

          <div className="h-6 w-px bg-fl-border" />

          {/* Transport Controls */}
          <div className="flex items-center gap-1.5 bg-fl-surface px-2 py-1 rounded-md border border-fl-border">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 rounded transition-all flex items-center gap-1 text-xs font-semibold ${
                isPlaying 
                  ? 'bg-fl-green text-black shadow-lg shadow-fl-green/30' 
                  : 'bg-fl-panel text-gray-200 hover:bg-fl-border hover:text-white'
              }`}
              title="Play / Pause (Space)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              onClick={() => setIsPlaying(false)}
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
              onClick={() => setActivePattern(Math.max(1, activePattern - 1))}
              className="px-1 text-gray-400 hover:text-white"
            >
              ‹
            </button>
            <span className="font-mono text-fl-accent font-bold px-1">Pattern {activePattern}</span>
            <button 
              onClick={() => setActivePattern(activePattern + 1)}
              className="px-1 text-gray-400 hover:text-white"
            >
              ›
            </button>
          </div>
        </div>

        {/* Window View Toggles & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-fl-surface p-1 rounded-md border border-fl-border text-xs">
            <button
              onClick={() => setActiveWindow('rack')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
                activeWindow === 'rack' ? 'bg-fl-panel text-fl-accent font-semibold shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Rack
            </button>
            <button
              onClick={() => setActiveWindow('pianoroll')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
                activeWindow === 'pianoroll' ? 'bg-fl-panel text-fl-accent font-semibold shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" /> Piano Roll
            </button>
            <button
              onClick={() => setActiveWindow('mixer')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
                activeWindow === 'mixer' ? 'bg-fl-panel text-fl-accent font-semibold shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Mixer
            </button>
            <button
              onClick={() => setActiveWindow('playlist')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
                activeWindow === 'playlist' ? 'bg-fl-panel text-fl-accent font-semibold shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Playlist
            </button>
          </div>

          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-fl-surface hover:bg-fl-border border border-fl-border rounded-md text-xs font-semibold text-fl-accent transition-all hover:shadow-fl-glow"
          >
            <Download className="w-3.5 h-3.5" /> Export WAV
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* WORKSPACE & MODERNIZATION DASHBOARD                       */}
      {/* ========================================================= */}
      <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Status Hero Card */}
        <div className="bg-gradient-to-r from-fl-panel to-fl-surface border border-fl-border rounded-xl p-6 shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-fl-accent/10 to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fl-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-fl-green"></span>
            </span>
            <span className="text-xs uppercase font-mono tracking-widest text-fl-green font-bold">
              Onda 0 Concluída com Sucesso
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
            Ambiente Modernizado: React + TypeScript + Tailwind CSS
          </h1>
          <p className="text-sm text-gray-300 max-w-2xl leading-relaxed mb-4">
            A infraestrutura Vite com React 18, Tailwind CSS (com paleta temática FL Studio), Zustand e TypeScript 
            está pronta e ativa. O código legado foi preservado com segurança e a estrutura modular para as próximas ondas está montada.
          </p>

          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-fl-bg border border-fl-border text-fl-lcd">⚡ Vite 6 HMR</span>
            <span className="px-2.5 py-1 rounded bg-fl-bg border border-fl-border text-blue-400">⚛️ React 18.3</span>
            <span className="px-2.5 py-1 rounded bg-fl-bg border border-fl-border text-cyan-400">🎨 Tailwind CSS v3.4</span>
            <span className="px-2.5 py-1 rounded bg-fl-bg border border-fl-border text-amber-400">🐻 Zustand 5.0</span>
            <span className="px-2.5 py-1 rounded bg-fl-bg border border-fl-border text-purple-400">🛡️ TypeScript 5.7</span>
          </div>
        </div>

        {/* Waves Progress Matrix */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-fl-accent" />
            Progresso do Plano de Modernização em Ondas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waves.map((wave) => (
              <div
                key={wave.id}
                className={`p-4 rounded-lg border transition-all ${
                  wave.done 
                    ? 'bg-fl-surface/80 border-fl-green/50 shadow-sm' 
                    : wave.id === 1 
                      ? 'bg-fl-panel border-fl-accent/60 shadow-fl-glow/20' 
                      : 'bg-fl-panel/40 border-fl-border opacity-70'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs font-mono font-bold ${wave.done ? 'text-fl-green' : wave.id === 1 ? 'text-fl-accent' : 'text-gray-400'}`}>
                    ONDA {wave.id}
                  </span>
                  {wave.done ? (
                    <span className="flex items-center gap-1 text-[11px] text-fl-green font-semibold bg-fl-green/10 px-2 py-0.5 rounded border border-fl-green/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                    </span>
                  ) : wave.id === 1 ? (
                    <span className="flex items-center gap-1 text-[11px] text-fl-accent font-semibold bg-fl-accent/10 px-2 py-0.5 rounded border border-fl-accent/30 animate-pulse">
                      <Clock className="w-3.5 h-3.5" /> Próxima
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-500 font-mono">Pendente</span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{wave.title}</h3>
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
            <span className="h-2 w-2 rounded-full bg-fl-green"></span>
            Áudio Engine: Standby
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

function Layers({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
