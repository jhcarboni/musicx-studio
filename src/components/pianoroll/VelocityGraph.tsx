import React, { useRef, useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { BarChart3 } from 'lucide-react';

interface VelocityGraphProps {
  channelId: string;
}

export const VelocityGraph: React.FC<VelocityGraphProps> = ({ channelId }) => {
  const { channels, setVelocity, isPlaying, currentStep } = useProjectStore();
  const { t } = useLanguageStore();
  const channel = channels.find(c => c.id === channelId);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!channel) return null;

  const handlePointerDown = (stepIdx: number, e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateVelocityFromEvent(stepIdx, e);
  };

  const handlePointerMove = (stepIdx: number, e: React.PointerEvent) => {
    if (!isDragging) return;
    updateVelocityFromEvent(stepIdx, e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setIsDragging(false);
  };

  const updateVelocityFromEvent = (stepIdx: number, e: React.PointerEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const height = rect.height;
    // Cima = 1.0, Baixo = 0.05
    const normalized = Math.max(0.05, Math.min(1.0, 1 - (clickY / height)));
    setVelocity(channelId, stepIdx, Number(normalized.toFixed(2)));
  };

  return (
    <div className="bg-fl-surface/90 border-t border-fl-border p-3 select-none flex flex-col space-y-2">
      <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
        <div className="flex items-center gap-1.5 text-white font-semibold">
          <BarChart3 className="w-3.5 h-3.5 text-fl-accent" />
          <span>{t.velocityGraphTitle}</span>
        </div>
        <span>{t.channel}: <strong className="text-fl-accent">{channel.name}</strong></span>
      </div>

      {/* Grid de 16 Barras de Velocity */}
      <div ref={containerRef} className="h-20 bg-fl-bg rounded border border-fl-border/60 grid grid-cols-16 gap-1 p-1">
        {channel.velocities.map((vel, stepIdx) => {
          const isCurrentPlayhead = isPlaying && currentStep === stepIdx;
          const hasActiveStep = channel.pattern[stepIdx] === 1;

          return (
            <div
              key={stepIdx}
              onPointerDown={(e) => handlePointerDown(stepIdx, e)}
              onPointerMove={(e) => handlePointerMove(stepIdx, e)}
              onPointerUp={handlePointerUp}
              className={`relative h-full flex flex-col justify-end items-center cursor-ns-resize group rounded transition-colors ${
                isCurrentPlayhead ? 'bg-fl-lcd/10' : 'hover:bg-fl-border/40'
              }`}
              title={`${t.step} ${stepIdx + 1}: ${Math.round(vel * 100)}%`}
            >
              {/* Linha guia de fundo */}
              <div className="absolute inset-x-0.5 bottom-0 top-0 flex items-center justify-center pointer-events-none">
                <div className="w-px h-full bg-fl-border/30" />
              </div>

              {/* Barra de Velocity */}
              <div
                className={`w-full rounded-t transition-all duration-75 relative z-10 ${
                  hasActiveStep
                    ? isCurrentPlayhead
                      ? 'bg-fl-lcd shadow-lcd-glow'
                      : 'bg-fl-accent group-hover:brightness-125'
                    : 'bg-gray-600/50'
                }`}
                style={{ height: `${Math.round(vel * 100)}%` }}
              >
                {/* Ponto de topo */}
                <div className="w-full h-1 bg-white/70 rounded-t" />
              </div>

              {/* Label de percentual no hover */}
              <span className="absolute -top-5 text-[9px] font-mono font-bold text-white bg-fl-panel px-1 py-0.2 rounded border border-fl-border opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                {Math.round(vel * 100)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
