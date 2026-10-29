import React, { useEffect } from 'react';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { ChannelRack } from './components/rack/ChannelRack';
import { Mixer } from './components/mixer/Mixer';
import { PianoRoll } from './components/pianoroll/PianoRoll';
import { PlaylistArranger } from './components/playlist/PlaylistArranger';
import { useProjectStore } from './store/useProjectStore';
import { audioEngine } from './audio/AudioEngine';
import { Activity, CheckCircle2, Keyboard } from 'lucide-react';

export default function App() {
  const { isPlaying, playMode, setPlayMode, activeWindow, setActiveWindow } = useProjectStore();

  // Global Keyboard Shortcuts (Space, Enter, L, 1-4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) {
          audioEngine.stop();
        } else {
          audioEngine.start();
        }
      } else if (e.code === 'Enter') {
        e.preventDefault();
        audioEngine.stop();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setPlayMode(playMode === 'PAT' ? 'SONG' : 'PAT');
      } else if (e.key === '1') {
        setActiveWindow('rack');
      } else if (e.key === '2') {
        setActiveWindow('pianoroll');
      } else if (e.key === '3') {
        setActiveWindow('mixer');
      } else if (e.key === '4') {
        setActiveWindow('playlist');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, playMode, setPlayMode, setActiveWindow]);

  const waves = [
    { id: 0, title: 'Onda 0: Fundação & Design System', desc: 'Vite 6 + React 18 + TypeScript + Tailwind CSS industrial', done: true },
    { id: 1, title: 'Onda 1: Audio Engine & Zustand Store', desc: 'Síntese pura desvinculada do ciclo React e sincronização atômica', done: true },
    { id: 2, title: 'Onda 2: Toolbar & Channel Rack 16 Steps', desc: 'Knobs táteis, sequenciador com drag-and-drop de samples', done: true },
    { id: 3, title: 'Onda 3: Mixer Dedicado & Analisador Canvas', desc: '5 tracks, sends de FX (Reverb/Delay/Dist) e espectro FFT a 60fps', done: true },
    { id: 4, title: 'Onda 4: Piano Roll & Velocity Graph', desc: 'Grade melódica C3-B4, sintetizador polifônico e controle de dinâmica', done: true },
    { id: 5, title: 'Onda 5: Playlist Arranger & Export WAV', desc: 'Timeline horizontal de 16 compassos e renderizador estéreo offline', done: true },
  ];

  return (
    <div className="min-h-screen bg-fl-bg text-gray-200 flex flex-col font-sans selection:bg-fl-accent selection:text-white">
      {/* Top FL Studio Toolbar */}
      <TopToolbar />

      {/* Main Workspace Area */}
      <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
        {/* Render Active Window */}
        {activeWindow === 'rack' && <ChannelRack />}
        {activeWindow === 'pianoroll' && <PianoRoll />}
        {activeWindow === 'mixer' && <Mixer />}
        {activeWindow === 'playlist' && <PlaylistArranger />}

        {/* Waves Roadmap Tracker (All 6 Waves Complete) */}
        <div className="bg-fl-panel border border-fl-border rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-fl-green" />
              Modernização Completa: 100% das 6 Ondas Concluídas
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono text-fl-green bg-fl-green/10 px-2.5 py-1 rounded border border-fl-green/30">
              <CheckCircle2 className="w-4 h-4" /> DAW Modernizado com Sucesso
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {waves.map((wave) => (
              <div
                key={wave.id}
                className="p-3.5 rounded-lg border bg-fl-surface/80 border-fl-green/50 shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-fl-green">
                    ONDA {wave.id}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-fl-green font-semibold bg-fl-green/10 px-2 py-0.5 rounded border border-fl-green/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-0.5">{wave.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{wave.desc}</p>
              </div>
            ))}
          </div>

          {/* Quick Keyboard Shortcuts Guide */}
          <div className="mt-4 pt-3 border-t border-fl-border/40 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-gray-400">
            <div className="flex items-center gap-2">
              <Keyboard className="w-3.5 h-3.5 text-fl-accent" />
              <span>Atalhos:</span>
              <kbd className="px-1.5 py-0.5 bg-fl-surface border border-fl-border rounded text-gray-300">Espaço</kbd> Play/Pause
              <kbd className="px-1.5 py-0.5 bg-fl-surface border border-fl-border rounded text-gray-300">Enter</kbd> Stop
              <kbd className="px-1.5 py-0.5 bg-fl-surface border border-fl-border rounded text-gray-300">L</kbd> PAT/SONG
              <kbd className="px-1.5 py-0.5 bg-fl-surface border border-fl-border rounded text-gray-300">1-4</kbd> Janelas
            </div>
            <span className="text-fl-accent font-semibold">Web FL Studio DAW Pro</span>
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-7 bg-fl-panel border-t border-fl-border px-4 flex items-center justify-between text-[11px] font-mono text-gray-400 shrink-0 select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-fl-green animate-ping' : 'bg-gray-500'}`}></span>
            Áudio Engine: {isPlaying ? 'Em Execução' : 'Standby'}
          </span>
          <span>Sample Rate: 44.1 kHz</span>
          <span>Buffer: 512 samples</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Branch: <span className="text-fl-accent font-bold">feature/react-modernization</span></span>
        </div>
      </footer>
    </div>
  );
}
