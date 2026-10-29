import React, { useState, useRef } from 'react';
import { Channel } from '../../types';
import { RotaryKnob } from '../common/RotaryKnob';
import { useProjectStore } from '../../store/useProjectStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { audioEngine } from '../../audio/AudioEngine';
import { soundFontManager, SOUNDFONT_PRESETS } from '../../audio/SoundFontManager';
import { Upload, Music2, ChevronDown, Loader2, FolderUp, RefreshCw, Trash2, Pencil, Check } from 'lucide-react';

interface ChannelRowProps {
  channel: Channel;
}

export const ChannelRow: React.FC<ChannelRowProps> = ({ channel }) => {
  const { 
    isPlaying, currentStep, activeChannelId, channels,
    toggleStep, setChannelVol, setChannelPan,
    toggleChannelMute, toggleChannelSolo,
    setCustomBuffer, setChannelSoundFont, setCustomSoundFont,
    resetChannelToSynth, setActiveChannelId, setActiveWindow,
    removeChannel, renameChannel
  } = useProjectStore();

  const { t } = useLanguageStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [showInstrumentMenu, setShowInstrumentMenu] = useState(false);
  const [isLoadingInstrument, setIsLoadingInstrument] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(channel.name);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Preview sound on channel name click
  const handlePreviewSound = () => {
    audioEngine.init();
    const ctx = audioEngine.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const vel = channel.vol;

    if (channel.instrumentType === 'soundfont' || channel.instrumentType === 'custom_sf2') {
      audioEngine.playNotePreview(channel, 60, 0.5, vel);
    } else if (channel.customBuffer) {
      audioEngine.playCustomBuffer(now, channel.customBuffer, vel, channel.trackIdx);
    } else if (channel.synthSound === 'kick' || channel.id === 'kick' || channel.id.startsWith('kick')) {
      audioEngine.playKick(now, vel, channel.trackIdx);
    } else if (channel.synthSound === 'snare' || channel.id === 'snare' || channel.id.startsWith('snare')) {
      audioEngine.playSnare(now, vel, channel.trackIdx);
    } else if (channel.synthSound === 'hihat' || channel.id === 'hihat' || channel.id.startsWith('hihat')) {
      audioEngine.playHiHat(now, vel, channel.trackIdx);
    } else if (channel.synthSound === 'clap' || channel.id === 'clap' || channel.id.startsWith('clap')) {
      audioEngine.playClap(now, vel, channel.trackIdx);
    } else {
      audioEngine.playSynthNote(now, 261.63, 0.3, vel, channel.trackIdx);
    }
  };

  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(channel.name);
    setIsEditingName(true);
    setTimeout(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }, 40);
  };

  const handleSaveRename = () => {
    if (editName.trim()) {
      renameChannel(channel.id, editName.trim());
    }
    setIsEditingName(false);
  };

  // Select SoundFont Preset
  const handleSelectPreset = async (presetId: string, presetName: string) => {
    try {
      setIsLoadingInstrument(true);
      setShowInstrumentMenu(false);
      audioEngine.init();
      if (audioEngine.ctx) {
        await soundFontManager.loadPreset(presetId, audioEngine.ctx);
      }
      setChannelSoundFont(channel.id, presetId, presetName);
      audioEngine.playNotePreview({ ...channel, instrumentType: 'soundfont', soundfontPreset: presetId }, 60, 0.5, channel.vol);
    } catch (err) {
      console.error('Erro ao carregar preset SoundFont:', err);
    } finally {
      setIsLoadingInstrument(false);
    }
  };

  // Reset to original analog synth
  const handleResetToSynth = () => {
    resetChannelToSynth(channel.id);
    setShowInstrumentMenu(false);
    handlePreviewSound();
  };

  // Open Piano Roll for this channel
  const handleOpenPianoRoll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveChannelId(channel.id);
    setActiveWindow('pianoroll');
  };

  // Drag and Drop Audio Files (.wav, .mp3) or SoundFonts (.sf2)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    audioEngine.init();

    // 1. Arquivo SoundFont (.sf2)
    if (file.name.toLowerCase().endsWith('.sf2')) {
      try {
        setIsLoadingInstrument(true);
        const result = await soundFontManager.loadCustomSF2(file, audioEngine.ctx!);
        setCustomSoundFont(channel.id, result.id, result.name);
        audioEngine.playNotePreview({ ...channel, instrumentType: 'custom_sf2', soundfontPreset: result.id }, 60, 0.6, channel.vol);
      } catch (err) {
        console.error('Erro ao carregar arquivo .sf2:', err);
        alert('Erro ao carregar arquivo SoundFont (.sf2). Verifique se o formato é válido.');
      } finally {
        setIsLoadingInstrument(false);
      }
      return;
    }

    // 2. Amostras de áudio (.wav / .mp3)
    if (file.type.includes('audio') || file.name.endsWith('.wav') || file.name.endsWith('.mp3')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const decodedBuffer = await audioEngine.ctx!.decodeAudioData(arrayBuffer);
        setCustomBuffer(channel.id, decodedBuffer, file.name.replace(/\.[^/.]+$/, ''));
        handlePreviewSound();
      } catch (err) {
        console.error('Erro ao carregar sample de áudio:', err);
      }
      return;
    }

    alert('Por favor, solte um arquivo .wav, .mp3 ou SoundFont (.sf2)');
  };

  const handleCustomFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    audioEngine.init();

    if (file.name.toLowerCase().endsWith('.sf2')) {
      try {
        setIsLoadingInstrument(true);
        setShowInstrumentMenu(false);
        const result = await soundFontManager.loadCustomSF2(file, audioEngine.ctx!);
        setCustomSoundFont(channel.id, result.id, result.name);
        audioEngine.playNotePreview({ ...channel, instrumentType: 'custom_sf2', soundfontPreset: result.id }, 60, 0.6, channel.vol);
      } catch (err) {
        console.error('Erro ao carregar .sf2:', err);
      } finally {
        setIsLoadingInstrument(false);
      }
    }
  };

  const isSelected = activeChannelId === channel.id;
  const isSoundFont = channel.instrumentType === 'soundfont' || channel.instrumentType === 'custom_sf2';

  return (
    <div 
      className={`relative flex items-center gap-3 p-2 rounded-lg border transition-all ${
        isDragOver 
          ? 'border-fl-accent bg-fl-accent/10 shadow-fl-glow' 
          : isSelected
            ? 'border-fl-border bg-fl-surface/90 shadow-md'
            : 'border-fl-border/50 bg-fl-panel hover:border-fl-border'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Indicador de Drag Over */}
      {isDragOver && (
        <div className="absolute inset-0 bg-fl-panel/90 backdrop-blur-sm z-30 flex items-center justify-center gap-2 text-fl-accent font-bold text-xs uppercase tracking-wider rounded-lg border-2 border-dashed border-fl-accent animate-pulse">
          <Upload className="w-4 h-4" /> {t.dropSampleHere}
        </div>
      )}

      {/* Lado Esquerdo: Controles do Canal */}
      <div className="w-68 shrink-0 flex items-center justify-between bg-fl-surface px-2.5 py-1.5 rounded-md border border-fl-border relative">
        {/* Mute, Solo, Delete & Name */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          {/* Botão de Excluir Canal (habilitado quando > 1 canal) */}
          {channels.length > 1 && (
            <button
              onClick={() => removeChannel(channel.id)}
              className="w-5 h-5 rounded text-[10px] font-mono font-bold transition-all shrink-0 bg-fl-panel text-gray-500 hover:text-fl-red hover:bg-fl-red/20 flex items-center justify-center"
              title={t.deleteChannel}
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          )}

          <button
            onClick={() => toggleChannelMute(channel.id)}
            className={`w-5 h-5 rounded text-[10px] font-mono font-bold transition-all shrink-0 ${
              channel.muted 
                ? 'bg-fl-red text-white shadow-sm' 
                : 'bg-fl-panel text-gray-400 hover:text-white hover:bg-fl-border'
            }`}
            title={t.mute}
          >
            M
          </button>
          <button
            onClick={() => toggleChannelSolo(channel.id)}
            className={`w-5 h-5 rounded text-[10px] font-mono font-bold transition-all shrink-0 ${
              channel.solo 
                ? 'bg-fl-green text-black font-extrabold shadow-sm' 
                : 'bg-fl-panel text-gray-400 hover:text-white hover:bg-fl-border'
            }`}
            title={t.solo}
          >
            S
          </button>

          {/* Seletor de Instrumento SoundFont */}
          <button
            onClick={() => setShowInstrumentMenu(!showInstrumentMenu)}
            className="p-1 rounded bg-fl-panel hover:bg-fl-border text-gray-400 hover:text-fl-accent transition-all flex items-center gap-0.5 text-[11px] shrink-0"
            title={t.selectInstrument}
          >
            {isLoadingInstrument ? (
              <Loader2 className="w-3 h-3 text-fl-accent animate-spin" />
            ) : isSoundFont ? (
              <span className="text-xs">🎹</span>
            ) : (
              <span className="text-xs">🥁</span>
            )}
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {/* Nome do Canal com Inline Rename & Audition */}
          <div className="flex items-center gap-1 overflow-hidden">
            {isEditingName ? (
              <div className="flex items-center gap-1 font-mono">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleSaveRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                  className="bg-fl-bg text-fl-accent border border-fl-accent/60 rounded px-1.5 py-0.5 text-xs font-bold w-20 focus:outline-none focus:ring-1 focus:ring-fl-accent"
                />
                <button onClick={handleSaveRename} className="text-fl-green hover:brightness-125" title="Salvar">
                  <Check className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <div className="group flex items-center gap-1">
                <button
                  onClick={() => {
                    setActiveChannelId(channel.id);
                    handlePreviewSound();
                  }}
                  className="flex items-center gap-1 text-left text-xs font-semibold text-white hover:text-fl-accent transition-colors truncate max-w-[80px]"
                  title={`${channel.name} — ${t.previewSound}`}
                >
                  <span 
                    className="w-1.5 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: channel.color || '#ff851b' }} 
                  />
                  <span className="truncate">{channel.name}</span>
                </button>
                <button
                  onClick={handleStartRename}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-fl-accent transition-opacity p-0.5 rounded shrink-0"
                  title={t.renameChannel}
                >
                  <Pencil className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Menu Dropdown de Seleção de SoundFont */}
        {showInstrumentMenu && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-fl-panel border border-fl-border rounded-lg shadow-2xl z-50 p-1.5 space-y-1 text-xs">
            <div className="px-2 py-1 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider border-b border-fl-border/40 flex items-center justify-between">
              <span>{t.selectInstrument}</span>
              <span className="text-fl-accent font-mono text-[9px]">SoundFonts</span>
            </div>

            {/* Presets Nativos de SoundFont (MusyngKite) */}
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {SOUNDFONT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id, preset.name)}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-all ${
                    channel.soundfontPreset === preset.id 
                      ? 'bg-fl-accent text-white font-semibold' 
                      : 'hover:bg-fl-surface text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="text-xs">{preset.icon}</span>
                  <span className="truncate flex-1">{preset.name}</span>
                </button>
              ))}
            </div>

            {/* Carregar arquivo .sf2 do computador */}
            <div className="pt-1 border-t border-fl-border/40 space-y-0.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-left px-2 py-1.5 rounded flex items-center gap-2 hover:bg-fl-surface text-fl-lcd transition-all font-mono text-[11px]"
              >
                <FolderUp className="w-3.5 h-3.5" />
                <span>{t.customSf2}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".sf2"
                onChange={handleCustomFileInput}
                className="hidden"
              />

              {/* Resetar para o Sintetizador de Bateria Original */}
              <button
                onClick={handleResetToSynth}
                className="w-full text-left px-2 py-1.5 rounded flex items-center gap-2 hover:bg-fl-surface text-gray-400 hover:text-fl-red transition-all font-mono text-[11px]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{t.analogSynth}</span>
              </button>
            </div>
          </div>
        )}

        {/* Knobs de Volume e Pan + Atalho Piano Roll */}
        <div className="flex items-center gap-1.5">
          <RotaryKnob
            value={channel.vol}
            min={0}
            max={1}
            defaultValue={0.8}
            size={22}
            label={t.vol}
            color="#ff851b"
            onChange={(v) => setChannelVol(channel.id, v)}
          />
          <RotaryKnob
            value={channel.pan}
            min={-1}
            max={1}
            defaultValue={0}
            size={22}
            label={t.pan}
            bipolar={true}
            color="#3b82f6"
            onChange={(v) => setChannelPan(channel.id, v)}
          />

          <button
            onClick={handleOpenPianoRoll}
            className={`p-1 rounded transition-all ${
              isSoundFont 
                ? 'bg-fl-accent text-white shadow-sm hover:brightness-110' 
                : 'bg-fl-panel hover:bg-fl-border text-gray-400 hover:text-fl-accent'
            }`}
            title={t.openPianoRoll}
          >
            <Music2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grade de 16 Steps Sequencer */}
      <div className="flex-1 grid grid-cols-16 gap-1">
        {channel.pattern.map((active, stepIdx) => {
          const isBeatBlockA = Math.floor(stepIdx / 4) % 2 === 0;
          const isCurrentPlayhead = isPlaying && currentStep === stepIdx;

          return (
            <button
              key={stepIdx}
              onClick={() => toggleStep(channel.id, stepIdx)}
              className={`h-9 rounded transition-all duration-75 relative flex items-center justify-center border ${
                active === 1
                  ? isSoundFont
                    ? 'bg-gradient-to-br from-amber-500 to-fl-accent border-fl-accent text-white shadow-fl-glow/40 hover:brightness-110'
                    : 'bg-fl-accent border-fl-accent text-white shadow-fl-glow/40 hover:brightness-110'
                  : isBeatBlockA
                    ? 'bg-fl-step-off-a/80 border-fl-border/60 hover:border-gray-400'
                    : 'bg-fl-step-off-b/80 border-fl-border/40 hover:border-gray-400'
              } ${isCurrentPlayhead ? 'ring-2 ring-fl-lcd ring-offset-1 ring-offset-fl-bg scale-105 z-10' : ''}`}
              title={`${t.step} ${stepIdx + 1} (${active === 1 ? t.stepActive : t.stepInactive})`}
            >
              {active === 1 && (
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
