import React, { useState } from 'react';
import { MediaMetadata } from '@nova/shared-types';
import { X, Info, Layers, Film, Volume2, ShieldAlert } from 'lucide-react';

export interface MediaInfoPanelProps {
  metadata: MediaMetadata | null;
  onClose: () => void;
}

export const MediaInfoPanel: React.FC<MediaInfoPanelProps> = ({ metadata, onClose }) => {
  const [viewMode, setViewMode] = useState<'basic' | 'advanced'>('basic');

  if (!metadata) {
    return (
      <div className="w-80 glass-panel rounded-xl p-4 text-zinc-400 text-xs">
        No active media loaded.
      </div>
    );
  }

  const formatBitrate = (bps?: number): string => {
    if (!bps) return 'Unknown';
    if (bps >= 1000000) return `${(bps / 1000000).toFixed(1)} Mbps`;
    return `${Math.round(bps / 1000)} kbps`;
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return 'Unknown';
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const video = metadata.videoStream;
  const audio = metadata.audioStreams[metadata.activeAudioIndex] || metadata.audioStreams[0];

  return (
    <div className="w-88 glass-panel border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-2xl z-40 max-h-[85vh]">
      {/* Title Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-zinc-900/60">
        <div className="flex items-center space-x-2">
          <Info size={16} className="text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            Media Information
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Basic vs Advanced toggle */}
          <div className="flex bg-black/40 p-0.5 rounded-md text-[10px] font-bold">
            <button
              onClick={() => setViewMode('basic')}
              className={`px-2 py-0.5 rounded ${viewMode === 'basic' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400'}`}
            >
              Basic
            </button>
            <button
              onClick={() => setViewMode('advanced')}
              className={`px-2 py-0.5 rounded ${viewMode === 'advanced' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400'}`}
            >
              Advanced
            </button>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto text-xs">
        {/* Quality Highlight Banner */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-purple-950/40 border border-cyan-500/20 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
              Resolution
            </div>
            <div className="text-base font-black text-white tracking-wide">
              {metadata.qualityLabel || (video ? `${video.width}×${video.height}` : 'Audio Only')}
            </div>
            {video && (
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                {video.width} × {video.height} @ {video.fps} FPS
              </div>
            )}
          </div>
          {video?.isHdr && (
            <div className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-500/40 shadow-sm shadow-amber-500/20">
              {video.hdrFormat || 'HDR'}
            </div>
          )}
        </div>

        {/* Video Track Info */}
        {video && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-zinc-300 font-bold text-[11px] uppercase tracking-wider">
              <Film size={13} className="text-indigo-400" />
              <span>Video Stream</span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-black/30 border border-white/5 text-[11px]">
              <div>
                <span className="text-zinc-500 block">Codec:</span>
                <span className="font-semibold text-zinc-200">{video.codec}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Bitrate:</span>
                <span className="font-semibold text-zinc-200">{formatBitrate(video.bitrate || metadata.bitrate)}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Aspect Ratio:</span>
                <span className="font-semibold text-zinc-200">{video.aspectRatio || '16:9'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Pixel Format:</span>
                <span className="font-semibold text-zinc-200">{video.pixelFormat || 'yuv420p'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Audio Track Info */}
        {audio && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-zinc-300 font-bold text-[11px] uppercase tracking-wider">
              <Volume2 size={13} className="text-cyan-400" />
              <span>Audio Stream</span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-black/30 border border-white/5 text-[11px]">
              <div>
                <span className="text-zinc-500 block">Codec:</span>
                <span className="font-semibold text-zinc-200">{audio.codec}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Channels:</span>
                <span className="font-semibold text-zinc-200">{audio.channelLayout || `${audio.channels} Ch`}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Sample Rate:</span>
                <span className="font-semibold text-zinc-200">{audio.sampleRate} Hz</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Language:</span>
                <span className="font-semibold text-zinc-200 uppercase">{audio.language || 'und'}</span>
              </div>
            </div>
          </div>
        )}

        {/* File & Container Specs */}
        <div className="space-y-2">
          <div className="flex items-center space-x-1.5 text-zinc-300 font-bold text-[11px] uppercase tracking-wider">
            <Layers size={13} className="text-purple-400" />
            <span>Container & Storage</span>
          </div>
          <div className="space-y-1 p-2.5 rounded-lg bg-black/30 border border-white/5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-zinc-500">File Name:</span>
              <span className="font-semibold text-zinc-200 truncate max-w-[170px]" title={metadata.filename}>
                {metadata.filename}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Container:</span>
              <span className="font-semibold text-zinc-200">{metadata.container}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Size:</span>
              <span className="font-semibold text-zinc-200">{formatFileSize(metadata.fileSize)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Duration:</span>
              <span className="font-semibold text-zinc-200">{Math.round(metadata.duration)} seconds</span>
            </div>
          </div>
        </div>

        {/* Advanced Technical Dump (when in Advanced view) */}
        {viewMode === 'advanced' && (
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Diagnostic Streams
            </div>
            <pre className="p-2 rounded bg-black/60 text-[10px] font-mono text-zinc-400 overflow-x-auto border border-white/5 max-h-40">
              {JSON.stringify(
                {
                  streams: metadata.probeRaw ? (metadata.probeRaw as any).streams : 'Probed via engine',
                  chapters: metadata.chapters,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
