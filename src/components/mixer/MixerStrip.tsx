import React from 'react';
import { MixerTrack } from '../../types';
import { RotaryKnob } from '../common/RotaryKnob';
import { useMixerStore } from '../../store/useMixerStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { audioEngine } from '../../audio/AudioEngine';

interface MixerStripProps {
  track: MixerTrack;
  isMaster?: boolean;
}

export const MixerStrip: React.FC<MixerStripProps> = ({ track, isMaster = false }) => {
  const { 
    selectedTrackId, setTrackVol, setTrackPan, 
    toggleTrackMute, toggleTrackSolo, setEq, setSend, selectTrack 
  } = useMixerStore();

  const { t } = useLanguageStore();
  const isSelected = selectedTrackId === track.id;

  // Atualiza audio engine em tempo real quando fader é movido
  const handleVolChange = (val: number) => {
    setTrackVol(track.id, val);
    audioEngine.syncMixerParams();
  };

  const handlePanChange = (val: number) => {
    setTrackPan(track.id, val);
    audioEngine.syncMixerParams();
  };

  const handleEqChange = (band: 'eqLow' | 'eqMid' | 'eqHigh', val: number) => {
    setEq(track.id, band, val);
    audioEngine.syncMixerParams();
  };

  const handleSendChange = (effect: 'revSend' | 'delSend' | 'distSend', val: number) => {
    setSend(track.id, effect, val);
    audioEngine.syncMixerParams();
  };

  const volToDb = (vol: number) => {
    if (vol <= 0.001) return '-inf dB';
    const db = 20 * Math.log10(vol);
    return `${db >= 0 ? '+' : ''}${db.toFixed(1)} dB`;
  };

  return (
    <div
      onClick={() => selectTrack(track.id)}
      className={`w-28 shrink-0 flex flex-col rounded-lg border transition-all p-2 select-none ${
        isMaster
          ? 'bg-fl-surface/90 border-fl-accent shadow-fl-glow/20'
          : isSelected
            ? 'bg-fl-surface border-fl-lcd/80 shadow-lcd-glow/20'
            : 'bg-fl-panel border-fl-border hover:border-gray-500'
      }`}
    >
      {/* Track Header */}
      <div className="text-center pb-2 border-b border-fl-border/60">
        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
          <span className={`px-1.5 py-0.2 rounded font-bold ${isMaster ? 'bg-fl-accent text-white' : 'bg-fl-bg text-gray-400'}`}>
            {isMaster ? 'MST' : `IN ${track.id}`}
          </span>
          <span className="text-gray-400 font-mono text-[9px]">{volToDb(track.vol)}</span>
        </div>
        <div className="text-xs font-bold text-white truncate" title={track.name}>
          {isMaster ? t.master : track.name}
        </div>
      </div>

      {/* 3-Band EQ Knobs */}
      <div className="py-2 border-b border-fl-border/40 flex flex-col items-center gap-1.5 bg-fl-bg/40 rounded my-1.5">
        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">{t.equalizer}</span>
        <div className="grid grid-cols-3 gap-1 w-full px-1">
          <RotaryKnob
            value={track.eqHigh}
            min={-12}
            max={12}
            defaultValue={0}
            size={22}
            label="HI"
            bipolar={true}
            color="#00ffcc"
            onChange={(v) => handleEqChange('eqHigh', v)}
            formatValue={(v) => `${v > 0 ? '+' : ''}${v}dB`}
          />
          <RotaryKnob
            value={track.eqMid}
            min={-12}
            max={12}
            defaultValue={0}
            size={22}
            label="MID"
            bipolar={true}
            color="#eab308"
            onChange={(v) => handleEqChange('eqMid', v)}
            formatValue={(v) => `${v > 0 ? '+' : ''}${v}dB`}
          />
          <RotaryKnob
            value={track.eqLow}
            min={-12}
            max={12}
            defaultValue={0}
            size={22}
            label="LOW"
            bipolar={true}
            color="#ff851b"
            onChange={(v) => handleEqChange('eqLow', v)}
            formatValue={(v) => `${v > 0 ? '+' : ''}${v}dB`}
          />
        </div>
      </div>

      {/* Aux Sends Knobs (para canais de insert) */}
      {!isMaster && (
        <div className="py-1.5 border-b border-fl-border/40 flex flex-col items-center gap-1 bg-fl-bg/30 rounded mb-1.5">
          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">{t.sendsFx}</span>
          <div className="grid grid-cols-3 gap-1 w-full px-1">
            <RotaryKnob
              value={track.revSend}
              min={0}
              max={1}
              defaultValue={0}
              size={20}
              label={t.reverb}
              color="#a855f7"
              onChange={(v) => handleSendChange('revSend', v)}
            />
            <RotaryKnob
              value={track.delSend}
              min={0}
              max={1}
              defaultValue={0}
              size={20}
              label={t.delay}
              color="#3b82f6"
              onChange={(v) => handleSendChange('delSend', v)}
            />
            <RotaryKnob
              value={track.distSend}
              min={0}
              max={1}
              defaultValue={0}
              size={20}
              label={t.distortion}
              color="#ff4136"
              onChange={(v) => handleSendChange('distSend', v)}
            />
          </div>
        </div>
      )}

      {/* Pan Knob */}
      <div className="py-1 flex justify-center">
        <RotaryKnob
          value={track.pan}
          min={-1}
          max={1}
          defaultValue={0}
          size={24}
          label={t.pan}
          bipolar={true}
          color="#3b82f6"
          onChange={handlePanChange}
        />
      </div>

      {/* Vertical Fader & VU Meter Section */}
      <div className="flex-1 py-3 flex items-center justify-center gap-2">
        {/* Visual VU Meter Bar */}
        <div className="w-2 h-36 bg-fl-bg rounded-full border border-fl-border overflow-hidden flex flex-col-reverse p-0.5">
          <div 
            className="w-full rounded-full transition-all duration-75"
            style={{
              height: `${Math.min(100, (track.muted ? 0 : track.vol) * 80)}%`,
              background: track.vol > 1.05 
                ? 'linear-gradient(to top, #2ecc40 60%, #eab308 80%, #ff4136 100%)' 
                : 'linear-gradient(to top, #2ecc40 70%, #00ffcc 100%)'
            }}
          />
        </div>

        {/* Vertical Range Slider */}
        <div className="h-36 flex items-center justify-center relative">
          <input
            type="range"
            min="0"
            max="1.2"
            step="0.01"
            value={track.vol}
            onChange={(e) => handleVolChange(Number(e.target.value))}
            className="w-36 h-2 -rotate-90 accent-fl-accent cursor-pointer bg-fl-bg rounded-lg border border-fl-border"
            title={`Volume: ${Math.round(track.vol * 100)}% (${volToDb(track.vol)})`}
          />
        </div>
      </div>

      {/* Mute & Solo Footer Buttons */}
      <div className="pt-2 border-t border-fl-border/60 flex items-center justify-center gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTrackMute(track.id);
            audioEngine.syncMixerParams();
          }}
          className={`flex-1 py-1 rounded text-[11px] font-mono font-bold transition-all ${
            track.muted 
              ? 'bg-fl-red text-white shadow-sm' 
              : 'bg-fl-bg text-gray-400 hover:text-white hover:bg-fl-border'
          }`}
          title={t.mute}
        >
          M
        </button>
        {!isMaster && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTrackSolo(track.id);
              audioEngine.syncMixerParams();
            }}
            className={`flex-1 py-1 rounded text-[11px] font-mono font-bold transition-all ${
              track.solo 
                ? 'bg-fl-green text-black font-extrabold shadow-sm' 
                : 'bg-fl-bg text-gray-400 hover:text-white hover:bg-fl-border'
            }`}
            title={t.solo}
          >
            S
          </button>
        )}
      </div>
    </div>
  );
};
