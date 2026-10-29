import React from 'react';

interface LcdDisplayProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export const LcdDisplay: React.FC<LcdDisplayProps> = ({
  label,
  value,
  min = 40,
  max = 240,
  unit,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-1.5 bg-fl-lcd-bg px-2.5 py-1 rounded border border-fl-lcd/30 shadow-lcd-glow select-none">
      <span className="text-[10px] font-mono text-fl-lcd/70 uppercase tracking-wider">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-14 bg-transparent text-fl-lcd font-mono font-bold text-sm outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {unit && <span className="text-[10px] font-mono text-fl-lcd/60">{unit}</span>}
    </div>
  );
};
