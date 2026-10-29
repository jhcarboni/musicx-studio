import React, { useRef, useEffect, useState } from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Activity, Radio } from 'lucide-react';

interface AudioVisualizerProps {
  height?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ height = 120 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'spectrum' | 'waveform'>('spectrum');
  const animFrameIdRef = useRef<number | null>(null);
  const { t } = useLanguageStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animFrameIdRef.current = requestAnimationFrame(render);

      const analyser = audioEngine.analyser;
      const width = canvas.width;
      const h = canvas.height;

      // Limpa fundo com tom FL Studio dark
      ctx.fillStyle = '#0a0b0e';
      ctx.fillRect(0, 0, width, h);

      // Grid sutil
      ctx.strokeStyle = '#1b1d26';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (!analyser) {
        // Linha de centro ociosa
        ctx.strokeStyle = '#2b2d3c';
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(width, h / 2);
        ctx.stroke();
        return;
      }

      if (mode === 'spectrum') {
        // Analisador de Espectro (FFT Frequências)
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barCount = 48;
        const barWidth = (width / barCount) - 2;
        const step = Math.floor(bufferLength / (barCount * 1.5));

        for (let i = 0; i < barCount; i++) {
          const value = dataArray[i * step] || 0;
          const percent = value / 255;
          const barHeight = percent * (h - 10);
          const x = i * (barWidth + 2);
          const y = h - barHeight;

          // Gradiente vibrante: Verde -> Ciano -> Laranja
          const gradient = ctx.createLinearGradient(0, h, 0, 0);
          gradient.addColorStop(0, '#00ffcc');
          gradient.addColorStop(0.7, '#3b82f6');
          gradient.addColorStop(1, '#ff851b');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, barWidth, barHeight);

          // Topo brilhante
          if (barHeight > 4) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, y - 1.5, barWidth, 1.5);
          }
        }
      } else {
        // Osciloscópio (Forma de Onda Temporal)
        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00ffcc';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#00ffcc';

        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, h / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [mode]);

  return (
    <div className="relative bg-[#0a0b0e] border border-fl-border rounded-lg overflow-hidden shadow-inner flex flex-col">
      {/* Top Overlay Controls */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-fl-panel/80 backdrop-blur-sm px-2 py-0.5 rounded border border-fl-border text-[10px] font-mono">
        <button
          onClick={() => setMode('spectrum')}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all ${
            mode === 'spectrum' ? 'bg-fl-accent text-white font-bold' : 'text-gray-400 hover:text-white'
          }`}
          title="Modo Espectro de Frequências (FFT)"
        >
          <Activity className="w-3 h-3" /> {t.spectrum}
        </button>
        <button
          onClick={() => setMode('waveform')}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all ${
            mode === 'waveform' ? 'bg-fl-lcd text-black font-bold' : 'text-gray-400 hover:text-white'
          }`}
          title="Modo Osciloscópio (Waveform)"
        >
          <Radio className="w-3 h-3" /> {t.waveform}
        </button>
      </div>

      <div className="absolute top-2 left-2 z-10 text-[10px] font-mono text-gray-500 uppercase tracking-widest pointer-events-none">
        {t.visualizerTitle}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={700}
        height={height}
        className="w-full h-auto block"
      />
    </div>
  );
};
