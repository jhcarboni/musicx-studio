import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Square, Sliders, Music, Download, 
  Grid, Plus, Layers, Sparkles, Loader2, Globe,
  Pencil, ChevronDown, Check 
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
    setActiveWindow, createNewPattern, renamePattern, loadDemoSong
  } = useProjectStore();

  const { t, language, setLanguage } = useLanguageStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isEditingPatternName, setIsEditingPatternName] = useState(false);
  const [patternNameInput, setPatternNameInput] = useState('');
  const [showPatternDropdown, setShowPatternDropdown] = useState(false);
  const patternInputRef = useRef<HTMLInputElement>(null);
  const patternDropdownRef = useRef<HTMLDivElement>(null);

  const currentPattern = patterns.find(p => p.id === activePatternId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (patternDropdownRef.current && !patternDropdownRef.current.contains(e.target as Node)) {
        setShowPatternDropdown(false);
      }
    };
    if (showPatternDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPatternDropdown]);

  const handleStartRename = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPatternNameInput(currentPattern?.name || `Pattern ${activePatternId}`);
    setIsEditingPatternName(true);
    setShowPatternDropdown(false);
    setTimeout(() => {
      patternInputRef.current?.focus();
      patternInputRef.current?.select();
    }, 40);
  };

  const handleSavePatternName = () => {
    if (patternNameInput.trim()) {
      renamePattern(activePatternId, patternNameInput.trim());
    }
    setIsEditingPatternName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSavePatternName();
    } else if (e.key === 'Escape') {
      setIsEditingPatternName(false);
    }
  };

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
    <header className="h-14 bg-fl-panel border-b border-fl-border px-2 sm:px-3 lg:px-4 flex items-center justify-between shadow-md shrink-0 select-none gap-2">
      <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3.5 shrink-0">
        {/* Logo & Brand */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-lg sm:text-xl">🎛️</span>
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm font-black tracking-wider text-white font-mono">
              MUSIC<span className="text-fl-accent">X</span>
              <span className="hidden md:inline text-gray-300"> STUDIO</span>
            </span>
            <span className="hidden xl:inline text-[9px] px-1 py-0.2 bg-fl-accent/20 text-fl-accent rounded border border-fl-accent/30 font-mono font-bold">
              v2.0 PRO
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-fl-border/60 shrink-0 hidden sm:block" />

        {/* Transport Controls */}
        <div className="flex items-center gap-1 bg-fl-surface px-1.5 py-1 rounded-md border border-fl-border shrink-0">
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
          <div className="flex items-center ml-1 bg-fl-bg rounded p-0.5 border border-fl-border text-[10px] font-mono">
            <button
              onClick={() => setPlayMode('PAT')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                playMode === 'PAT' ? 'bg-fl-accent text-white font-bold shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
              title="Pattern Mode"
            >
              PAT
            </button>
            <button
              onClick={() => setPlayMode('SONG')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                playMode === 'SONG' ? 'bg-fl-accent text-white font-bold shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
              title="Song Mode (Playlist)"
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

        {/* Pattern Selector & Inline Renamer */}
        <div ref={patternDropdownRef} className="relative flex items-center gap-0.5 sm:gap-1 bg-fl-surface px-1.5 sm:px-2 py-1 rounded border border-fl-border text-xs shrink-0">
          <span className="text-gray-400 text-[10px] sm:text-[11px] hidden sm:inline">{t.pattern}:</span>
          
          {/* Navegar para pattern anterior */}
          <button 
            onClick={() => setActivePatternId(Math.max(1, activePatternId - 1))}
            className="px-1 text-gray-400 hover:text-white font-bold transition-colors disabled:opacity-30"
            disabled={activePatternId <= 1}
            title="Pattern anterior"
          >
            ‹
          </button>

          {/* Nome do Pattern com Edição Inline ou Botão com Ícone de Lápis */}
          {isEditingPatternName ? (
            <div className="flex items-center gap-1">
              <input
                ref={patternInputRef}
                type="text"
                value={patternNameInput}
                onChange={(e) => setPatternNameInput(e.target.value)}
                onBlur={handleSavePatternName}
                onKeyDown={handleKeyDown}
                className="bg-fl-bg text-fl-accent border border-fl-accent/60 rounded px-1.5 py-0.5 font-mono text-xs font-bold w-24 sm:w-28 lg:w-32 focus:outline-none focus:ring-1 focus:ring-fl-accent shadow-inner"
                placeholder={currentPattern?.name || `Pattern ${activePatternId}`}
                title={t.pressEnterToSave}
              />
              <button
                onClick={handleSavePatternName}
                className="p-0.5 text-fl-green hover:brightness-125"
                title="Salvar"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-0.5">
              <button
                onClick={handleStartRename}
                onDoubleClick={handleStartRename}
                className="group flex items-center gap-1 font-mono text-fl-accent font-bold px-1.5 py-0.5 rounded hover:bg-fl-panel hover:text-white transition-all text-xs"
                title={t.renamePatternTip}
              >
                <span 
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: currentPattern?.color || '#ff851b' }}
                />
                <span className="truncate max-w-[65px] sm:max-w-[85px] md:max-w-[110px] lg:max-w-[130px]">
                  {currentPattern?.name || `${t.pattern} ${activePatternId}`}
                </span>
                <Pencil className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-opacity ml-0.5" />
              </button>

              {/* Botão de lista dropdown para alternar rapidamente entre patterns */}
              <button
                onClick={() => setShowPatternDropdown(!showPatternDropdown)}
                className="p-0.5 text-gray-400 hover:text-white rounded hover:bg-fl-panel transition-all"
                title={t.patternList}
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Navegar para próximo pattern */}
          <button 
            onClick={() => setActivePatternId(Math.min(patterns.length, activePatternId + 1))}
            className="px-1 text-gray-400 hover:text-white font-bold transition-colors disabled:opacity-30"
            disabled={activePatternId >= patterns.length}
            title="Próximo pattern"
          >
            ›
          </button>

          {/* Criar novo pattern (+) */}
          <button
            onClick={createNewPattern}
            className="ml-0.5 sm:ml-1 p-0.5 text-gray-400 hover:text-fl-green transition-colors"
            title={t.newPattern}
          >
            <Plus className="w-3 h-3" />
          </button>

          {/* Menu Dropdown com todos os patterns cadastrados */}
          {showPatternDropdown && (
            <div className="absolute top-full left-0 mt-1.5 w-52 bg-fl-panel border border-fl-border rounded-lg shadow-2xl z-50 p-1 space-y-0.5 text-xs">
              <div className="px-2 py-1 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider border-b border-fl-border/40 flex items-center justify-between">
                <span>{t.patternList}</span>
                <span className="text-fl-accent font-mono text-[9px]">{patterns.length}</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {patterns.map((p) => (
                  <div
                    key={p.id}
                    className={`w-full px-2 py-1.5 rounded flex items-center justify-between transition-all group ${
                      p.id === activePatternId
                        ? 'bg-fl-accent text-white font-semibold'
                        : 'hover:bg-fl-surface text-gray-300 hover:text-white'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setActivePatternId(p.id);
                        setShowPatternDropdown(false);
                      }}
                      className="flex items-center gap-2 truncate flex-1 text-left"
                    >
                      <span 
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: p.color || '#ff851b' }}
                      />
                      <span className="truncate">{p.name || `${t.pattern} ${p.id}`}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        setActivePatternId(p.id);
                        handleStartRename(e);
                      }}
                      className="p-1 opacity-60 hover:opacity-100 transition-opacity ml-1 text-gray-300 hover:text-white"
                      title={t.renamePattern}
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="pt-1 border-t border-fl-border/40">
                <button
                  onClick={() => {
                    createNewPattern();
                    setShowPatternDropdown(false);
                  }}
                  className="w-full text-left px-2 py-1 rounded flex items-center gap-1.5 hover:bg-fl-surface text-fl-green transition-all font-mono text-[11px]"
                >
                  <Plus className="w-3 h-3" />
                  <span>{t.newPattern}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Window View Toggles & Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Navigation Tabs */}
        <div className="flex items-center bg-fl-surface p-0.5 sm:p-1 rounded-md border border-fl-border text-xs shrink-0">
          <button
            onClick={() => setActiveWindow('rack')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeWindow === 'rack' ? 'bg-fl-panel text-fl-accent font-semibold shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> <span className="hidden xl:inline">{t.rack}</span>
          </button>
          <button
            onClick={() => setActiveWindow('pianoroll')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeWindow === 'pianoroll' ? 'bg-fl-panel text-fl-accent font-semibold shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" /> <span className="hidden xl:inline">{t.pianoroll}</span>
          </button>
          <button
            onClick={() => setActiveWindow('mixer')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeWindow === 'mixer' ? 'bg-fl-panel text-fl-accent font-semibold shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> <span className="hidden xl:inline">{t.mixer}</span>
          </button>
          <button
            onClick={() => setActiveWindow('playlist')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeWindow === 'playlist' ? 'bg-fl-panel text-fl-accent font-semibold shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> <span className="hidden xl:inline">{t.playlist}</span>
          </button>
        </div>

        {/* Demo Song Button */}
        <button
          onClick={() => {
            loadDemoSong();
            setPlayMode('SONG');
          }}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-fl-surface hover:bg-fl-border border border-fl-border rounded-md text-xs font-semibold text-fl-green transition-all shrink-0"
          title={t.loadDemoSong}
        >
          <Sparkles className="w-3.5 h-3.5" /> <span className="hidden lg:inline">{t.demoSong}</span>
        </button>

        {/* Export WAV Button */}
        <button
          onClick={handleExportWAV}
          disabled={isExporting}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
            isExporting
              ? 'bg-fl-surface border border-fl-accent text-fl-accent animate-pulse cursor-wait'
              : 'bg-fl-surface hover:bg-fl-border border border-fl-border text-fl-accent hover:shadow-fl-glow'
          }`}
          title={t.exportWav}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> <span className="hidden sm:inline">{t.exporting}</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t.exportWav}</span>
            </>
          )}
        </button>

        {/* Language Switcher Selector (PT-BR default / EN selectable) */}
        <div className="flex items-center bg-fl-surface p-0.5 sm:p-1 rounded-md border border-fl-border text-xs font-mono shrink-0">
          <button
            onClick={() => setLanguage(language === 'pt-BR' ? 'en' : 'pt-BR')}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-fl-panel text-gray-300 hover:text-white transition-all group"
            title={language === 'pt-BR' ? 'Mudar para Inglês (EN)' : 'Switch to Portuguese (PT)'}
          >
            <Globe className="w-3.5 h-3.5 text-gray-400 group-hover:text-fl-accent" />
            <span className="font-bold text-[11px] text-fl-accent">{language === 'pt-BR' ? 'PT' : 'EN'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
