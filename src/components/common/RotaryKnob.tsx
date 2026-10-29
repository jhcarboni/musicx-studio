import React, { useRef, useState, useCallback } from 'react';

interface RotaryKnobProps {
  value: number;
  min?: number;
  max?: number;
  defaultValue?: number;
  step?: number;
  label?: string;
  size?: number;
  color?: string;
  bipolar?: boolean; // Se true, valor neutro é 0 no centro (-1 a +1 para Pan)
  onChange: (value: number) => void;
  formatValue?: (val: number) => string;
}

export const RotaryKnob: React.FC<RotaryKnobProps> = ({
  value,
  min = 0,
  max = 1,
  defaultValue = 0.5,
  step = 0.01,
  label,
  size = 32,
  color = '#ff851b',
  bipolar = false,
  onChange,
  formatValue
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValRef = useRef(0);

  // Mapeia valor para rotação em graus (-135° a +135°, total 270°)
  const normalized = (value - min) / (max - min);
  const angle = -135 + normalized * 270;

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValRef.current = value;
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = startYRef.current - e.clientY; // Mover para cima aumenta
    const sensitivity = 0.005 * (max - min);
    let nextVal = startValRef.current + deltaY * sensitivity;

    if (step) {
      nextVal = Math.round(nextVal / step) * step;
    }
    nextVal = Math.max(min, Math.min(max, nextVal));
    onChange(Number(nextVal.toFixed(2)));
  }, [isDragging, max, min, onChange, step]);

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignora se ponteiro já foi liberado
    }
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    onChange(defaultValue);
  };

  const displayVal = formatValue 
    ? formatValue(value) 
    : bipolar 
      ? value === 0 ? 'C' : value > 0 ? `R${Math.round(value * 100)}` : `L${Math.round(Math.abs(value) * 100)}`
      : `${Math.round(normalized * 100)}%`;

  return (
    <div className="flex flex-col items-center select-none group">
      <div
        className="relative cursor-ns-resize flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{ width: size, height: size }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        title={`${label || 'Knob'}: ${displayVal} (Duplo clique para resetar)`}
      >
        {/* SVG Dial */}
        <svg width={size} height={size} viewBox="0 0 40 40" className="pointer-events-none">
          {/* Fundo do anel */}
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="#1e2029"
            stroke="#2f3342"
            strokeWidth="3"
            strokeDasharray="75.4 25.1"
            strokeDashoffset="-12.5"
            strokeLinecap="round"
          />

          {/* Arco de progresso ativo */}
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray="75.4 100"
            strokeDashoffset={75.4 - (normalized * 75.4)}
            strokeLinecap="round"
            className="transition-all duration-75"
          />

          {/* Miolo do Knob */}
          <circle cx="20" cy="20" r="12" fill="#282a36" stroke="#3c4052" strokeWidth="1.5" />

          {/* Agulha indicadora rotativa */}
          <g transform={`rotate(${angle} 20 20)`}>
            <line
              x1="20"
              y1="9"
              x2="20"
              y2="14"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        </svg>

        {/* Glow quando arrastando */}
        {isDragging && (
          <div 
            className="absolute inset-0 rounded-full opacity-30 blur-sm pointer-events-none"
            style={{ backgroundColor: color }}
          />
        )}
      </div>

      {label && (
        <span className="text-[9px] font-mono tracking-tight text-gray-400 mt-0.5 group-hover:text-gray-200">
          {label}
        </span>
      )}
    </div>
  );
};
