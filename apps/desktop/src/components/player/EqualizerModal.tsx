import React from 'react';
import { Sliders, X, RotateCcw, Volume2, Clock } from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { EqualizerPreset } from '@nova/shared-types';

export interface EqualizerModalProps {
  onClose: () => void;
}

const PRESETS: Record<EqualizerPreset, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  'Treble Boost': [0, 0, 0, 0, 0, 2, 4, 6, 7, 7],
  Rock: [5, 4, 2, 0, -1, 1, 3, 5, 6, 6],
  Pop: [-1, 1, 3, 4, 3, 1, 0, 1, 2, 2],
  Classical: [4, 3, 2, 2, -1, -1, 0, 2, 4, 5],
  Movie: [3, 2, 0, -1, 2, 3, 2, 0, 2, 4],
  Voice: [-3, -2, 0, 4, 5, 4, 2, 0, -1, -3],
  Custom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

export const EqualizerModal: React.FC<EqualizerModalProps> = ({ onClose }) => {
  const {
    equalizerBands,
    isEqualizerEnabled,
    toggleEqualizer,
    setEqualizerBandGain,
    audioDelay,
    setAudioDelay,
  } = usePlayerStore();

  const handleApplyPreset = (presetName: EqualizerPreset) => {
    const gains = PRESETS[presetName];
    if (!gains) return;
    equalizerBands.forEach((b, idx) => {
      setEqualizerBandGain(b.frequency, gains[idx] ?? 0);
    });
  };

  const formatFreq = (f: number): string => {
    if (f >= 1000) return `${f / 1000}k`;
    return `${f}`;
  };

  return (
    <div className="w-96 glass-panel border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-2xl z-40">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-zinc-900/60">
        <div className="flex items-center space-x-2">
          <Sliders size={16} className="text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            Audio Equalizer & Sync
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Toggle EQ on/off */}
          <button
            onClick={toggleEqualizer}
            className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
              isEqualizerEnabled
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-white/5 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isEqualizerEnabled ? 'Enabled' : 'Bypass'}
          </button>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5 text-xs">
        {/* Presets row */}
        <div>
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-2">
            Presets
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(PRESETS) as EqualizerPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => handleApplyPreset(preset)}
                className="px-2 py-1 rounded bg-black/40 hover:bg-cyan-500/20 hover:text-cyan-300 text-zinc-400 text-[10px] font-semibold border border-white/5 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* 10-Band Sliders */}
        <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-3">
          <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase font-bold">
            <span>+12 dB</span>
            <span>0 dB (Flat)</span>
            <span>-12 dB</span>
          </div>

          <div className="flex items-center justify-between gap-1 h-36 pt-2">
            {equalizerBands.map((band) => (
              <div key={band.frequency} className="flex flex-col items-center h-full justify-between w-7">
                <span className="text-[9px] font-mono text-cyan-400 font-bold">
                  {band.gain > 0 ? `+${band.gain}` : band.gain}
                </span>

                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={band.gain}
                  onChange={(e) => setEqualizerBandGain(band.frequency, parseInt(e.target.value, 10))}
                  className="h-24 w-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 [writing-mode:bt-lr] [-webkit-appearance:slider-vertical]"
                />

                <span className="text-[9px] font-semibold text-zinc-400">
                  {formatFreq(band.frequency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Audio / Video Sync Delay */}
        <div className="p-3 rounded-lg bg-black/30 border border-white/5 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1.5 text-zinc-300 font-semibold text-[11px]">
              <Clock size={13} className="text-indigo-400" />
              <span>A/V Sync Delay:</span>
            </div>
            <span className="font-mono text-cyan-300 font-bold text-xs">
              {audioDelay > 0 ? `+${Math.round(audioDelay * 1000)} ms` : `${Math.round(audioDelay * 1000)} ms`}
            </span>
          </div>

          <input
            type="range"
            min="-0.5"
            max="0.5"
            step="0.02"
            value={audioDelay}
            onChange={(e) => setAudioDelay(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-400"
          />

          <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
            <span>-500 ms</span>
            <span>0 ms</span>
            <span>+500 ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
