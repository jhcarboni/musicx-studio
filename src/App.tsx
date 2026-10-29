import React, { useEffect } from 'react';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { ChannelRack } from './components/rack/ChannelRack';
import { Mixer } from './components/mixer/Mixer';
import { PianoRoll } from './components/pianoroll/PianoRoll';
import { useProjectStore } from './store/useProjectStore';
import { audioEngine } from './audio/AudioEngine';
import { Activity, CheckCircle2, Clock } from 'lucide-react';

export default function App() {
  const { isPlaying, activeWindow } = useProjectStore();

  // Spacebar Play / Pause global shortcut
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

  const waves = [
    { id: 0, title: 'Onda 0: Fundação & Design System', desc: 'Vite + React + TypeScript + Tailwind CSS configurados', done: true },
    { id: 1, title: 'Onda 1: Audio Engine & Zustand Store', desc: 'Síntese pura desvinculada do ciclo React e sincronização atômica', done: true },
    { id: 2, title: 'Onda 2: Toolbar & Channel Rack 16 Steps', desc: 'Knobs táteis, sequenciador com drag-and-drop de samples', done: true },
    { id: 3, title: 'Onda 3: Mixer Dedicado & Analisador Canvas', desc: '5 tracks, sends de FX (Reverb/Delay/Dist) e espectro em tempo real', done: true },
    { id: 4, title: 'Onda 4: Piano Roll & Velocity Graph', desc: 'Grade melódica C3-B4, sintetizador polifônico e controle de dinâmica', done: true },
    { id: 5, title: 'Onda 5: Playlist Arranger & Export WAV', desc: 'Timeline horizontal de 16 compassos e renderizador estéreo offline', done: false },
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

        {/* Temporary placeholder for Playlist (Onda 5) */}
        {activeWindow === 'playlist' && (
          <div className="bg-fl-panel border border-fl-border rounded-xl p-8 text-center space-y-2">
            <h3 className="text-base font-bold text-white">🎵 Playlist Arranger</h3>
            <p className="text-sm text-gray-400">A timeline horizontal de 16 compassos e renderização final serão construídas na <strong>Onda 5</strong>.</p>
          </div>
        )}

        {/* Waves Roadmap Tracker */}
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
                    : wave.id === 5 
                      ? 'bg-fl-panel border-fl-accent/60 shadow-fl-glow/20' 
                      : 'bg-fl-panel/40 border-fl-border opacity-70'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span className={`text-xs font-mono font-bold ${wave.done ? 'text-fl-green' : wave.id === 5 ? 'text-fl-accent' : 'text-gray-400'}`}>
                    ONDA {wave.id}
                  </span>
                  {wave.done ? (
                    <span className="flex items-center gap-1 text-[11px] text-fl-green font-semibold bg-fl-green/10 px-2 py-0.5 rounded border border-fl-green/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                    </span>
                  ) : wave.id === 5 ? (
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
