import React, { useState, useRef } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { ChannelRow } from './ChannelRow';
import { Grid, SlidersHorizontal, Info, Plus, FolderUp } from 'lucide-react';
import { audioEngine } from '../../audio/AudioEngine';
import { soundFontManager, SOUNDFONT_PRESETS } from '../../audio/SoundFontManager';
import { SynthSound } from '../../types';

const DRUM_SYNTH_OPTIONS = [
  { id: 'kick', name: 'Bumbo (Kick 808)', type: 'kick' as SynthSound, icon: '🥁' },
  { id: 'snare', name: 'Caixa (Snare 909)', type: 'snare' as SynthSound, icon: '🥁' },
  { id: 'hihat', name: 'Chimbau (Hi-Hat)', type: 'hihat' as SynthSound, icon: '🥁' },
  { id: 'clap', name: 'Palmas (Clap)', type: 'clap' as SynthSound, icon: '👏' },
  { id: 'synth', name: 'Sintetizador Analógico', type: 'synth' as SynthSound, icon: '⚡' },
];

export const ChannelRack: React.FC = () => {
  const { channels, swing, setSwing, patterns, activePatternId, addChannel } = useProjectStore();
  const { t } = useLanguageStore();
  const currentPattern = patterns.find(p => p.id === activePatternId);

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const customSf2InputRef = useRef<HTMLInputElement>(null);

  const handleAddSoundfontChannel = async (presetId: string, presetName: string) => {
    setIsAddMenuOpen(false);
    audioEngine.init();
    if (audioEngine.ctx) {
      soundFontManager.loadPreset(presetId, audioEngine.ctx).catch(console.error);
    }
    addChannel({
      name: presetName,
      instrumentType: 'soundfont',
      presetId
    });
  };

  const handleAddSynthChannel = (name: string, type: SynthSound) => {
    setIsAddMenuOpen(false);
    addChannel({
      name,
      instrumentType: 'synth',
      synthSound: type
    });
  };

  const handleCustomSf2Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAddMenuOpen(false);
    audioEngine.init();
    try {
      const result = await soundFontManager.loadCustomSF2(file, audioEngine.ctx!);
      addChannel({
        name: result.name,
        instrumentType: 'custom_sf2',
        presetId: result.id
      });
    } catch (err) {
      console.error('Erro ao carregar .sf2:', err);
      alert('Erro ao carregar arquivo SoundFont (.sf2)');
    }
  };

  return (
    <div className="bg-fl-panel border border-fl-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
      {/* Rack Header */}
      <div className="bg-fl-surface px-4 py-2.5 border-b border-fl-border flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-fl-accent" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            {t.channelRackTitle} — {currentPattern?.name || `${t.pattern} ${activePatternId}`}
          </span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono bg-fl-bg border border-fl-border text-fl-accent font-bold">
            {channels.length}/16
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Add Channel Button & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              disabled={channels.length >= 16}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all shadow-sm ${
                channels.length >= 16
                  ? 'bg-fl-border/40 text-gray-500 cursor-not-allowed'
                  : 'bg-fl-accent hover:bg-fl-accent/90 text-white hover:brightness-110 active:scale-95'
              }`}
              title={channels.length >= 16 ? t.maxChannelsReached : t.addChannel}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addChannel}</span>
            </button>

            {/* Menu Popover */}
            {isAddMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-fl-panel border border-fl-border rounded-xl shadow-2xl z-50 p-2.5 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-fl-border/50 pb-1.5">
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">{t.selectChannelType}</span>
                  <span className="text-[10px] font-mono text-fl-accent">{channels.length}/16</span>
                </div>

                {/* Presets SoundFont */}
                <div>
                  <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
                    🎹 {t.soundfontInstruments}
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-0.5 pr-1">
                    {SOUNDFONT_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleAddSoundfontChannel(preset.id, preset.name)}
                        className="w-full text-left px-2 py-1.5 rounded flex items-center gap-2 hover:bg-fl-surface text-gray-300 hover:text-white transition-all text-xs"
                      >
                        <span>{preset.icon}</span>
                        <span className="truncate flex-1">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sintetizadores de Bateria & Lead */}
                <div className="pt-1.5 border-t border-fl-border/40">
                  <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
                    🥁 {t.drumInstruments}
                  </div>
                  <div className="space-y-0.5">
                    {DRUM_SYNTH_OPTIONS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleAddSynthChannel(item.name, item.type)}
                        className="w-full text-left px-2 py-1.5 rounded flex items-center gap-2 hover:bg-fl-surface text-gray-300 hover:text-white transition-all text-xs"
                      >
                        <span>{item.icon}</span>
                        <span className="truncate flex-1">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Custom SF2 */}
                <div className="pt-1.5 border-t border-fl-border/40">
                  <button
                    onClick={() => customSf2InputRef.current?.click()}
                    className="w-full text-left px-2 py-1.5 rounded flex items-center gap-2 hover:bg-fl-surface text-fl-lcd transition-all font-mono text-[11px]"
                  >
                    <FolderUp className="w-3.5 h-3.5" />
                    <span>{t.customSf2}</span>
                  </button>
                  <input
                    ref={customSf2InputRef}
                    type="file"
                    accept=".sf2"
                    onChange={handleCustomSf2Upload}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Swing Groove Slider */}
          <div className="flex items-center gap-2 bg-fl-bg px-3 py-1 rounded border border-fl-border text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-fl-accent" />
            <span className="text-[11px] text-gray-400 font-mono">{t.swing}:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={swing}
              onChange={(e) => setSwing(Number(e.target.value))}
              className="w-20 accent-fl-accent cursor-pointer h-1.5 bg-fl-border rounded-lg"
            />
            <span className="text-[11px] font-mono text-fl-accent font-bold w-9 text-right">
              {Math.round(swing * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Step Numbers Legend (1 to 16) */}
      <div className="flex items-center gap-3 px-3 pt-2 pb-1 text-[10px] font-mono text-gray-400">
        <div className="w-68 shrink-0 pl-3">{t.channelsAndControls}</div>
        <div className="flex-1 grid grid-cols-16 gap-1 text-center">
          {Array.from({ length: 16 }).map((_, i) => {
            const isBeatStart = i % 4 === 0;
            return (
              <span 
                key={i} 
                className={isBeatStart ? 'text-fl-accent font-bold' : 'text-gray-500'}
              >
                {i + 1}
              </span>
            );
          })}
        </div>
      </div>

      {/* Channel Rows */}
      <div className="p-3 space-y-2.5 flex-1">
        {channels.map((channel) => (
          <ChannelRow key={channel.id} channel={channel} />
        ))}
      </div>

      {/* Rack Footer Tip */}
      <div className="bg-fl-surface/50 px-4 py-2 border-t border-fl-border/40 flex items-center justify-between text-[11px] text-gray-400 font-mono">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-fl-accent" />
          <span>{t.dropAudioTip}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-400">{t.activeDspChannels}:</span>
          <span className="text-fl-accent font-bold">{channels.length} / 16</span>
        </div>
      </div>
    </div>
  );
};
