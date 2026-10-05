import React, { useState, useRef, useCallback } from 'react';

export interface TimelineProps {
  currentTime: number;
  duration: number;
  bufferedPercent: number;
  loopA: number | null;
  loopB: number | null;
  onSeek: (seconds: number) => void;
}

export const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const secs = totalSecs % 60;
  const mins = Math.floor(totalSecs / 60) % 60;
  const hours = Math.floor(totalSecs / 3600);

  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hours > 0) {
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
};

export const Timeline: React.FC<TimelineProps> = ({
  currentTime,
  duration,
  bufferedPercent,
  loopA,
  loopB,
  onSeek,
}) => {
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const barRef = useRef<HTMLDivElement>(null);

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!barRef.current || duration <= 0) return;
      const rect = barRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      setHoverTime(ratio * duration);
      setHoverX(clickX);
    },
    [duration]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverTime(null);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!barRef.current || duration <= 0) return;
      const rect = barRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      onSeek(ratio * duration);
    },
    [duration, onSeek]
  );

  return (
    <div className="relative group w-full py-2 cursor-pointer select-none">
      {/* Time Preview Tooltip */}
      {hoverTime !== null && (
        <div
          className="absolute -top-7 px-2 py-0.5 rounded bg-zinc-900/90 text-cyan-300 text-[11px] font-mono font-semibold border border-white/10 shadow-lg pointer-events-none transform -translate-x-1/2 transition-transform duration-75"
          style={{ left: `${hoverX}px` }}
        >
          {formatDuration(hoverTime)}
        </div>
      )}

      {/* Track Container */}
      <div
        ref={barRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="h-1.5 group-hover:h-2.5 bg-white/20 rounded-full relative transition-all duration-150 overflow-hidden"
      >
        {/* Buffered Bar */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-white/30 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, bufferedPercent)}%` }}
        />

        {/* Played Progress Bar */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
          style={{ width: `${Math.min(100, currentPercent)}%` }}
        />

        {/* A-B Loop Indicator Region */}
        {loopA !== null && loopB !== null && duration > 0 && (
          <div
            className="absolute top-0 bottom-0 bg-amber-400/40 border-l-2 border-r-2 border-amber-300 z-10"
            style={{
              left: `${(loopA / duration) * 100}%`,
              width: `${Math.max(1, ((loopB - loopA) / duration) * 100)}%`,
            }}
          />
        )}
      </div>

      {/* Scrub Handle / Thumb */}
      <div
        className="absolute top-1/2 -mt-2 -ml-2 w-4 h-4 rounded-full bg-white shadow-md shadow-cyan-500/50 border-2 border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ left: `${Math.min(100, currentPercent)}%` }}
      />
    </div>
  );
};
