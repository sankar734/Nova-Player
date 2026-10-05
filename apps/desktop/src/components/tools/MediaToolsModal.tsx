import React, { useState } from 'react';
import { Wrench, X, Play, RefreshCw, Scissors, FileAudio, Check, AlertCircle } from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { ConversionFormat } from '@nova/shared-types';
import { FFmpegCommandBuilder } from '@nova/media-engine';

export interface MediaToolsModalProps {
  onClose: () => void;
}

export const MediaToolsModal: React.FC<MediaToolsModalProps> = ({ onClose }) => {
  const { metadata, sourceUrl, currentTime } = usePlayerStore();
  const [toolMode, setToolMode] = useState<'convert' | 'audio' | 'trim' | 'gif'>('convert');
  const [format, setFormat] = useState<ConversionFormat>('mp4');
  const [preset, setPreset] = useState<'original' | 'high' | 'balanced' | 'small'>('high');
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(metadata?.duration || 60);
  const [status, setStatus] = useState<string | null>(null);

  const handleExecute = () => {
    try {
      const source = metadata?.path || sourceUrl || 'C:\\Videos\\input.mp4';
      const output = source.replace(/\.[^/.]+$/, `_converted.${format}`);

      const args = FFmpegCommandBuilder.buildTranscodeArgs({
        sourcePath: source,
        outputPath: output,
        outputFormat: format,
        preset,
        startTime: toolMode === 'trim' ? trimStart : undefined,
        endTime: toolMode === 'trim' ? trimEnd : undefined,
        extractAudioOnly: toolMode === 'audio',
      });

      setStatus(`Command generated safely: ffmpeg ${args.slice(0, 8).join(' ')} ... Output: ${output}`);
    } catch (err: any) {
      setStatus(`Validation error: ${err.message}`);
    }
  };

  return (
    <div className="w-[460px] glass-panel border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl z-50">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-zinc-900/70">
        <div className="flex items-center space-x-2.5">
          <Wrench size={16} className="text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            FFmpeg Media Tools
          </span>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
          <X size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-black/40 p-1 text-xs">
        <button
          onClick={() => {
            setToolMode('convert');
            setFormat('mp4');
          }}
          className={`flex-1 py-1.5 rounded-md font-semibold transition-colors ${
            toolMode === 'convert' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Transcode
        </button>
        <button
          onClick={() => {
            setToolMode('audio');
            setFormat('mp3');
          }}
          className={`flex-1 py-1.5 rounded-md font-semibold transition-colors ${
            toolMode === 'audio' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Extract Audio
        </button>
        <button
          onClick={() => setToolMode('trim')}
          className={`flex-1 py-1.5 rounded-md font-semibold transition-colors ${
            toolMode === 'trim' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Trim Clip
        </button>
      </div>

      <div className="p-5 space-y-4 text-xs">
        {/* Source File */}
        <div>
          <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Source Media</label>
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-zinc-300 truncate font-mono text-[11px]">
            {metadata?.path || sourceUrl || 'No file selected'}
          </div>
        </div>

        {/* Output Format */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Target Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ConversionFormat)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              {toolMode === 'audio' ? (
                <>
                  <option value="mp3">MP3 Audio</option>
                  <option value="aac">AAC Audio</option>
                  <option value="wav">WAV Lossless</option>
                  <option value="flac">FLAC Lossless</option>
                </>
              ) : (
                <>
                  <option value="mp4">MP4 (H.264 + AAC)</option>
                  <option value="webm">WebM (VP9 + Opus)</option>
                  <option value="mkv">MKV Universal</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Quality Preset</label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as any)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="high">High Quality (Visually Lossless)</option>
              <option value="balanced">Balanced</option>
              <option value="small">Small File (High Compression)</option>
              <option value="original">Original Quality</option>
            </select>
          </div>
        </div>

        {/* Trim Controls if active */}
        {toolMode === 'trim' && (
          <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-2">
            <div className="text-[10px] uppercase font-bold text-cyan-400">Trim Boundaries (seconds)</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-zinc-500 text-[10px] block">Start Time (s):</span>
                <input
                  type="number"
                  value={trimStart}
                  onChange={(e) => setTrimStart(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/50 border border-white/10 rounded p-1.5 text-xs text-white"
                />
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] block">End Time (s):</span>
                <input
                  type="number"
                  value={trimEnd}
                  onChange={(e) => setTrimEnd(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/50 border border-white/10 rounded p-1.5 text-xs text-white"
                />
              </div>
            </div>
            <button
              onClick={() => {
                setTrimStart(Math.max(0, Math.floor(currentTime - 10)));
                setTrimEnd(Math.floor(currentTime + 10));
              }}
              className="text-[10px] text-cyan-400 hover:underline pt-1"
            >
              Use ±10s around current playback ({Math.floor(currentTime)}s)
            </button>
          </div>
        )}

        {/* Result Message */}
        {status && (
          <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-300 break-all leading-relaxed">
            {status}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleExecute}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-xs text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-opacity"
        >
          {toolMode === 'audio' ? 'Extract Audio Track' : toolMode === 'trim' ? 'Export Trimmed Clip' : 'Start Conversion'}
        </button>
      </div>
    </div>
  );
};
