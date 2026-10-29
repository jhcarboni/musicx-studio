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

        {/* Quick Keyboard Shortcuts in Footer */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] text-gray-400">
          <Keyboard className="w-3 h-3 text-fl-accent" />
          <span>{t.shortcuts}:</span>
          <kbd className="px-1 py-0.2 bg-fl-surface border border-fl-border rounded text-gray-300">Espaço</kbd> {t.spaceShortcut}
          <kbd className="px-1 py-0.2 bg-fl-surface border border-fl-border rounded text-gray-300">Enter</kbd> {t.enterShortcut}
          <kbd className="px-1 py-0.2 bg-fl-surface border border-fl-border rounded text-gray-300">L</kbd> {t.lShortcut}
          <kbd className="px-1 py-0.2 bg-fl-surface border border-fl-border rounded text-gray-300">1-4</kbd> {t.numbersShortcut}
        </div>

        <div className="flex items-center gap-2">
          <span>{t.branch}: <span className="text-fl-accent font-bold">main</span></span>
        </div>
      </footer>
    </div>
  );
}
