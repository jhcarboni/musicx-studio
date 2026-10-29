import React, { useState } from 'react';
import { Channel } from '../../types';
import { RotaryKnob } from '../common/RotaryKnob';
import { useProjectStore } from '../../store/useProjectStore';
import { audioEngine } from '../../audio/AudioEngine';
import { Upload, Music2 } from 'lucide-react';

interface ChannelRowProps {
  channel: Channel;
}

export const ChannelRow: React.FC<ChannelRowProps> = ({ channel }) => {
  const { 
    isPlaying, currentStep, activeChannelId,
    toggleStep, setChannelVol, setChannelPan,
    toggleChannelMute, toggleChannelSolo,
    setCustomBuffer, setActiveChannelId, setActiveWindow
  } = useProjectStore();

  const [isDragOver, setIsDragOver] = useState(false);

  // Preview sound on channel name click
  const handlePreviewSound = () => {
    audioEngine.init();
    const ctx = audioEngine.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const vel = channel.vol;

    if (channel.customBuffer) {
      audioEngine.playCustomBuffer(now, channel.customBuffer, vel, channel.trackIdx);
    } else if (channel.id === 'kick') {
      audioEngine.playKick(now, vel, channel.trackIdx);
    } else if (channel.id === 'snare') {
      audioEngine.playSnare(now, vel, channel.trackIdx);
    } else if (channel.id === 'hihat') {
      audioEngine.playHiHat(now, vel, channel.trackIdx);
    } else if (channel.id === 'clap') {
      audioEngine.playClap(now, vel, channel.trackIdx);
    }
  };

  // Open Piano Roll for this channel
  const handleOpenPianoRoll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveChannelId(channel.id);
    setActiveWindow('pianoroll');
  };

  // Drag and Drop Audio Files
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

    if (!file.type.includes('audio') && !file.name.endsWith('.wav') && !file.name.endsWith('.mp3')) {
      alert('Por favor, solte um arquivo de áudio (.wav ou .mp3)');
      return;
    }

    try {
      audioEngine.init();
      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await audioEngine.ctx!.decodeAudioData(arrayBuffer);
      setCustomBuffer(channel.id, decodedBuffer, file.name.replace(/\.[^/.]+$/, ''));
      handlePreviewSound();
    } catch (err) {
      console.error('Erro ao carregar sample de áudio:', err);
    }
  };

  const isSelected = activeChannelId === channel.id;

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
          <Upload className="w-4 h-4" /> Solte o sample aqui para carregar
        </div>
      )}

      {/* Lado Esquerdo: Controles do Canal */}
      <div className="w-56 shrink-0 flex items-center justify-between bg-fl-surface px-2.5 py-1.5 rounded-md border border-fl-border">
        {/* Mute, Solo & Name */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          <button
            onClick={() => toggleChannelMute(channel.id)}
            className={`w-5 h-5 rounded text-[10px] font-mono font-bold transition-all ${
              channel.muted 
                ? 'bg-fl-red text-white shadow-sm' 
                : 'bg-fl-panel text-gray-400 hover:text-white hover:bg-fl-border'
            }`}
            title="Mute Channel"
          >
            M
          </button>
          <button
            onClick={() => toggleChannelSolo(channel.id)}
            className={`w-5 h-5 rounded text-[10px] font-mono font-bold transition-all ${
              channel.solo 
                ? 'bg-fl-green text-black font-extrabold shadow-sm' 
                : 'bg-fl-panel text-gray-400 hover:text-white hover:bg-fl-border'
            }`}
            title="Solo Channel"
          >
            S
          </button>

          {/* Nome do Canal & Pré-escuta */}
          <button
            onClick={handlePreviewSound}
            className="flex items-center gap-1 text-left text-xs font-semibold text-white hover:text-fl-accent transition-colors truncate max-w-[85px]"
            title={`Clique para tocar ${channel.name} / Arraste um arquivo .wav aqui`}
          >
            <span 
              className="w-1.5 h-3 rounded-full shrink-0" 
              style={{ backgroundColor: channel.color || '#ff851b' }} 
            />
            <span className="truncate">{channel.name}</span>
          </button>
        </div>

        {/* Knobs de Volume e Pan + Atalho Piano Roll */}
        <div className="flex items-center gap-2">
          <RotaryKnob
            value={channel.vol}
            min={0}
            max={1}
            defaultValue={0.8}
            size={24}
            label="VOL"
            color="#ff851b"
            onChange={(v) => setChannelVol(channel.id, v)}
          />
          <RotaryKnob
            value={channel.pan}
            min={-1}
            max={1}
            defaultValue={0}
            size={24}
            label="PAN"
            bipolar={true}
            color="#3b82f6"
            onChange={(v) => setChannelPan(channel.id, v)}
          />

          <button
            onClick={handleOpenPianoRoll}
            className="p-1 rounded bg-fl-panel hover:bg-fl-border text-gray-400 hover:text-fl-accent transition-all"
            title="Abrir no Piano Roll"
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
                  ? 'bg-fl-accent border-fl-accent text-white shadow-fl-glow/40 hover:brightness-110'
                  : isBeatBlockA
                    ? 'bg-fl-step-off-a/80 border-fl-border/60 hover:border-gray-400'
                    : 'bg-fl-step-off-b/80 border-fl-border/40 hover:border-gray-400'
              } ${isCurrentPlayhead ? 'ring-2 ring-fl-lcd ring-offset-1 ring-offset-fl-bg scale-105 z-10' : ''}`}
              title={`Passo ${stepIdx + 1} (${active === 1 ? 'Ligado' : 'Desligado'})`}
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
