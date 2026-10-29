import React, { useEffect } from 'react';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { ChannelRack } from './components/rack/ChannelRack';
import { Mixer } from './components/mixer/Mixer';
import { PianoRoll } from './components/pianoroll/PianoRoll';
import { PlaylistArranger } from './components/playlist/PlaylistArranger';
import { useProjectStore } from './store/useProjectStore';
import { useLanguageStore } from './store/useLanguageStore';
import { audioEngine } from './audio/AudioEngine';
import { Activity, CheckCircle2, Keyboard } from 'lucide-react';

export default function App() {
  const { isPlaying, playMode, setPlayMode, activeWindow, setActiveWindow } = useProjectStore();
  const { t } = useLanguageStore();

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
    { id: 0, title: t.wave0Title, desc: t.wave0Desc, done: true },
    { id: 1, title: t.wave1Title, desc: t.wave1Desc, done: true },
    { id: 2, title: t.wave2Title, desc: t.wave2Desc, done: true },
    { id: 3, title: t.wave3Title, desc: t.wave3Desc, done: true },
    { id: 4, title: t.wave4Title, desc: t.wave4Desc, done: true },
    { id: 5, title: t.wave5Title, desc: t.wave5Desc, done: true },
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
              {t.modernizationComplete}
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono text-fl-green bg-fl-green/10 px-2.5 py-1 rounded border border-fl-green/30">
              <CheckCircle2 className="w-4 h-4" /> {t.dawModernizedSuccess}
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
                    {wave.id === 0 ? 'ONDA 0' : `ONDA ${wave.id}`}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-fl-green font-semibold bg-fl-green/10 px-2 py-0.5 rounded border border-fl-green/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t.completedBadge}
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
              <span>{t.shortcuts}:</span>
              <kbd className="px-1.5 py-0.5 bg-fl-surface border border-fl-border rounded text-gray-300">Espaço</kbd> {t.spaceShortcut}
              <kbd className="px-1.5 py-0.5 bg-fl-surface border border-fl-border rounded text-gray-300">Enter</kbd> {t.enterShortcut}
              <kbd className="px-1.5 py-0.5 bg-fl-surface border border-fl-border rounded text-gray-300">L</kbd> {t.lShortcut}
              <kbd className="px-1.5 py-0.5 bg-fl-surface border border-fl-border rounded text-gray-300">1-4</kbd> {t.numbersShortcut}
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
            {t.audioEngineStatus}: {isPlaying ? t.engineRunning : t.engineStandby}
          </span>
          <span>{t.sampleRate}: 44.1 kHz</span>
          <span>{t.bufferSize}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{t.branch}: <span className="text-fl-accent font-bold">main</span></span>
        </div>
      </footer>
    </div>
  );
}
