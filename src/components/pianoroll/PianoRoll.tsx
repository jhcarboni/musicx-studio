import React, { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { audioEngine } from '../../audio/AudioEngine';
import { VelocityGraph } from './VelocityGraph';
import { Note } from '../../types';
import { Music, Trash2, BarChart2 } from 'lucide-react';

// Escala cromática de 2 oitavas: B4 (71) até C3 (48)
const PIANO_KEYS = [
  { midi: 71, name: 'B4', isBlack: false },
  { midi: 70, name: 'A#4', isBlack: true },
  { midi: 69, name: 'A4', isBlack: false },
  { midi: 68, name: 'G#4', isBlack: true },
  { midi: 67, name: 'G4', isBlack: false },
  { midi: 66, name: 'F#4', isBlack: true },
  { midi: 65, name: 'F4', isBlack: false },
  { midi: 64, name: 'E4', isBlack: false },
  { midi: 63, name: 'D#4', isBlack: true },
  { midi: 62, name: 'D4', isBlack: false },
  { midi: 61, name: 'C#4', isBlack: true },
  { midi: 60, name: 'C4', isBlack: false, isRoot: true },

  { midi: 59, name: 'B3', isBlack: false },
  { midi: 58, name: 'A#3', isBlack: true },
  { midi: 57, name: 'A3', isBlack: false },
  { midi: 56, name: 'G#3', isBlack: true },
  { midi: 55, name: 'G3', isBlack: false },
  { midi: 54, name: 'F#3', isBlack: true },
  { midi: 53, name: 'F3', isBlack: false },
  { midi: 52, name: 'E3', isBlack: false },
  { midi: 51, name: 'D#3', isBlack: true },
  { midi: 50, name: 'D3', isBlack: false },
  { midi: 49, name: 'C#3', isBlack: true },
  { midi: 48, name: 'C3', isBlack: false, isRoot: true },
];

export const PianoRoll: React.FC = () => {
  const { 
    channels, activeChannelId, setActiveChannelId,
    addNote, removeNote, isPlaying, currentStep, bpm
  } = useProjectStore();

  const [noteDuration, setNoteDuration] = useState<number>(1); // em steps
  const [showVelocity, setShowVelocity] = useState<boolean>(true);

  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];

  const midiToFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

  const handleKeyPreview = (midi: number) => {
    audioEngine.init();
    if (!audioEngine.ctx) return;
    const now = audioEngine.ctx.currentTime;
    const freq = midiToFreq(midi);
    const durSec = noteDuration * (60.0 / bpm / 4);
    audioEngine.playSynthNote(now, freq, durSec, activeChannel.vol * 0.9, activeChannel.trackIdx);
  };

  const handleCellClick = (midi: number, name: string, step: number) => {
    const existing = activeChannel.notes.find(n => n.midi === midi && n.step === step);
    if (existing) {
      removeNote(activeChannel.id, midi, step);
    } else {
      const newNote: Note = {
        midi,
        name,
        step,
        duration: noteDuration,
        velocity: activeChannel.velocities[step] ?? 0.8
      };
      addNote(activeChannel.id, newNote);
      handleKeyPreview(midi);
    }
  };

  const handleClearAllNotes = () => {
    activeChannel.notes.forEach(n => removeNote(activeChannel.id, n.midi, n.step));
  };

  return (
    <div className="bg-fl-panel border border-fl-border rounded-xl shadow-2xl overflow-hidden flex flex-col select-none">
      {/* Piano Roll Header */}
      <div className="bg-fl-surface px-4 py-2.5 border-b border-fl-border flex flex-wrap items-center justify-between gap-3">
        {/* Title & Channel Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
            <Music className="w-4 h-4 text-fl-accent" />
            <span>Piano Roll Melódico</span>
          </div>

          <div className="flex items-center gap-1 bg-fl-bg p-1 rounded border border-fl-border">
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannelId(ch.id)}
                className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${
                  activeChannelId === ch.id
                    ? 'bg-fl-accent text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {ch.name}
              </button>
            ))}
          </div>
        </div>

        {/* Note Duration & Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 font-mono text-[11px]">Duração:</span>
          <div className="flex items-center bg-fl-bg p-0.5 rounded border border-fl-border">
            <button
              onClick={() => setNoteDuration(1)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                noteDuration === 1 ? 'bg-fl-border text-fl-accent font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              1/16
            </button>
            <button
              onClick={() => setNoteDuration(2)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                noteDuration === 2 ? 'bg-fl-border text-fl-accent font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              1/8
            </button>
            <button
              onClick={() => setNoteDuration(4)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                noteDuration === 4 ? 'bg-fl-border text-fl-accent font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              1/4
            </button>
          </div>

          <button
            onClick={() => setShowVelocity(!showVelocity)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] font-semibold transition-all ${
              showVelocity ? 'bg-fl-border text-fl-accent border-fl-accent/50' : 'bg-fl-bg text-gray-400 border-fl-border hover:text-white'
            }`}
          >
            <BarChart2 className="w-3 h-3" /> Velocity
          </button>

          <button
            onClick={handleClearAllNotes}
            className="flex items-center gap-1 px-2 py-1 rounded bg-fl-bg hover:bg-fl-border text-gray-400 hover:text-fl-red border border-fl-border transition-all text-[11px]"
            title="Limpar todas as notas do canal"
          >
            <Trash2 className="w-3 h-3" /> Limpar
          </button>
        </div>
      </div>

      {/* Step Numbers Bar */}
      <div className="flex items-center bg-fl-surface/50 border-b border-fl-border px-3 py-1 text-[10px] font-mono text-gray-400">
        <div className="w-16 shrink-0 text-center font-bold">NOTA</div>
        <div className="flex-1 grid grid-cols-16 gap-0.5 text-center">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className={i % 4 === 0 ? 'text-fl-accent font-bold' : 'text-gray-500'}>
              {i + 1}
            </span>
          ))}
        </div>
      </div>

      {/* Piano Keys & Grid Matrix */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-fl-border/30 bg-fl-bg relative">
        {PIANO_KEYS.map((key) => {
          return (
            <div key={key.midi} className="flex items-stretch h-6 hover:bg-white/[0.02] transition-colors">
              {/* Tecla Virtual (Esquerda) */}
              <button
                onClick={() => handleKeyPreview(key.midi)}
                className={`w-16 shrink-0 flex items-center justify-between px-2 text-[10px] font-mono font-bold border-r border-fl-border transition-all ${
                  key.isBlack
                    ? 'bg-[#181920] text-gray-400 hover:bg-[#252733] hover:text-white'
                    : key.isRoot
                      ? 'bg-[#2a2c3a] text-fl-lcd border-b-2 border-b-fl-lcd/40 font-extrabold'
                      : 'bg-[#222430] text-gray-200 hover:bg-[#303344]'
                }`}
                title={`Tocar nota ${key.name}`}
              >
                <span>{key.name}</span>
                {key.isRoot && <span className="w-1.5 h-1.5 rounded-full bg-fl-lcd" />}
              </button>

              {/* 16 Grid Cells (Direita) */}
              <div className="flex-1 grid grid-cols-16 gap-0.5 px-1 py-0.5 relative">
                {Array.from({ length: 16 }).map((_, stepIdx) => {
                  const isBeatBlockA = Math.floor(stepIdx / 4) % 2 === 0;
                  const isCurrentPlayhead = isPlaying && currentStep === stepIdx;
                  const note = activeChannel.notes.find(n => n.midi === key.midi && n.step === stepIdx);

                  return (
                    <div
                      key={stepIdx}
                      onClick={() => handleCellClick(key.midi, key.name, stepIdx)}
                      className={`h-full rounded-sm cursor-pointer relative transition-all duration-75 flex items-center justify-center ${
                        note
                          ? 'bg-gradient-to-r from-fl-accent to-amber-500 shadow-fl-glow text-white font-bold text-[9px] z-10'
                          : isBeatBlockA
                            ? 'bg-fl-panel/70 hover:bg-fl-surface'
                            : 'bg-fl-surface/40 hover:bg-fl-surface'
                      } ${isCurrentPlayhead ? 'border-l-2 border-fl-lcd' : ''}`}
                    >
                      {note && (
                        <span className="truncate px-0.5 pointer-events-none drop-shadow">
                          {note.name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Velocity Graph Editor (Painel Inferior) */}
      {showVelocity && <VelocityGraph channelId={activeChannel.id} />}
    </div>
  );
};
