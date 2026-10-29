import React, { useEffect } from 'react';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { ChannelRack } from './components/rack/ChannelRack';
import { Mixer } from './components/mixer/Mixer';
import { PianoRoll } from './components/pianoroll/PianoRoll';
import { PlaylistArranger } from './components/playlist/PlaylistArranger';
import { useProjectStore } from './store/useProjectStore';
import { useLanguageStore } from './store/useLanguageStore';
import { audioEngine } from './audio/AudioEngine';
import { Keyboard } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-fl-bg text-gray-200 flex flex-col font-sans selection:bg-fl-accent selection:text-white">
      {/* Top FL Studio Toolbar */}
      <TopToolbar />

      {/* Main Workspace Area */}
      <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-4 sm:space-y-6">
        {/* Render Active Window */}
        {activeWindow === 'rack' && <ChannelRack />}
        {activeWindow === 'pianoroll' && <PianoRoll />}
        {activeWindow === 'mixer' && <Mixer />}
        {activeWindow === 'playlist' && <PlaylistArranger />}
      </main>

      {/* Footer Status Bar with Brand Logo */}
      <footer className="h-8 bg-fl-panel border-t border-fl-border px-3 sm:px-4 flex items-center justify-between text-[11px] font-mono text-gray-400 shrink-0 select-none gap-3">
        {/* Logo & Marca MusicX Studio no Rodapé */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-base">🎛️</span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-black tracking-wider text-white font-mono">
                MUSIC<span className="text-fl-accent">X</span>
                <span className="text-gray-300"> STUDIO</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-fl-accent/20 text-fl-accent rounded border border-fl-accent/30 font-mono font-bold">
                v2.0 PRO
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-fl-border/60 shrink-0 hidden sm:block" />

          <div className="flex items-center gap-3 hidden sm:flex text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-fl-green animate-ping' : 'bg-gray-500'}`}></span>
              {t.audioEngineStatus}: {isPlaying ? t.engineRunning : t.engineStandby}
            </span>
            <span className="hidden md:inline">{t.sampleRate}: 44.1 kHz</span>
          </div>
        </div>

        {/* Quick Keyboard Shortcuts in Footer */}
        <div className="hidden xl:flex items-center gap-2 text-[10px] text-gray-400">
          <Keyboard className="w-3 h-3 text-fl-accent" />
          <span>{t.shortcuts}:</span>
          <kbd className="px-1 py-0.2 bg-fl-surface border border-fl-border rounded text-gray-300">Espaço</kbd> {t.spaceShortcut}
          <kbd className="px-1 py-0.2 bg-fl-surface border border-fl-border rounded text-gray-300">Enter</kbd> {t.enterShortcut}
          <kbd className="px-1 py-0.2 bg-fl-surface border border-fl-border rounded text-gray-300">L</kbd> {t.lShortcut}
          <kbd className="px-1 py-0.2 bg-fl-surface border border-fl-border rounded text-gray-300">1-4</kbd> {t.numbersShortcut}
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span>{t.branch}: <span className="text-fl-accent font-bold">main</span></span>
        </div>
      </footer>
    </div>
  );
}
