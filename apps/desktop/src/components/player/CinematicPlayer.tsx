import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sliders,
  Sparkles,
  Info,
  Wrench,
  Camera,
  StepForward,
  StepBack,
  Repeat,
  Subtitles,
  AudioWaveform,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Timeline, formatDuration } from './Timeline';
import { MediaInfoPanel } from './MediaInfoPanel';
import { EqualizerModal } from './EqualizerModal';
import { AIPanel } from '../ai/AIPanel';
import { MediaToolsModal } from '../tools/MediaToolsModal';

export const CinematicPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    sourceUrl,
    metadata,
    isPlaying,
    currentTime,
    duration,
    bufferedPercent,
    volume,
    isMuted,
    speed,
    aspectRatio,
    activeSidePanel,
    activeCue,
    loopA,
    loopB,
    isLoopingAB,
    togglePlay,
    setPlaying,
    setTime,
    setDuration,
    setBufferedPercent,
    setVolume,
    toggleMute,
    setSpeed,
    setLoopA,
    setLoopB,
    toggleLoopAB,
    setActiveSidePanel,
  } = usePlayerStore();

  const { subtitleStyles } = useSettingsStore();

  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<any>(null);

  // Sync video element with store
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying && videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    } else if (!isPlaying && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume;
    videoRef.current.muted = isMuted;
  }, [volume, isMuted]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
  }, [speed]);

  // A-B Repeat Loop checking
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setTime(current);

    if (isLoopingAB && loopA !== null && loopB !== null && loopB > loopA) {
      if (current >= loopB || current < loopA) {
        videoRef.current.currentTime = loopA;
      }
    }
  };

  const handleProgress = () => {
    if (!videoRef.current || videoRef.current.duration <= 0) return;
    const buf = videoRef.current.buffered;
    if (buf.length > 0) {
      const bufferedEnd = buf.end(buf.length - 1);
      setBufferedPercent((bufferedEnd / videoRef.current.duration) * 100);
    }
  };

  const handleSeek = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration || 1000, seconds));
    setTime(seconds);
  };

  // Auto-hide controls on mouse idle
  const handleMouseMove = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false);
      }
    }, 2800);
  }, [isPlaying]);

  // Frame Stepping
  const stepFrame = (forward: boolean) => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setPlaying(false);
    const fps = metadata?.videoStream?.fps || 30;
    const delta = (1 / fps) * (forward ? 1 : -1);
    handleSeek(videoRef.current.currentTime + delta);
  };

  // Screenshot capture
  const takeScreenshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1920;
    canvas.height = videoRef.current.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `nova_snap_${Math.floor(currentTime)}s.png`;
      a.click();
    }
  };

  // Keyboard Shortcuts (Space, Arrows, F, M, P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(currentTime - (e.shiftKey ? 10 : 5));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek(currentTime + (e.shiftKey ? 10 : 5));
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume(Math.min(1, volume + 0.05));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume(Math.max(0, volume - 0.05));
      } else if (e.key.toLowerCase() === 'm') {
        toggleMute();
      } else if (e.key.toLowerCase() === 'p') {
        takeScreenshot();
      } else if (e.key.toLowerCase() === 'f') {
        if (!document.fullscreenElement) {
          containerRef.current?.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, volume, togglePlay, toggleMute, handleSeek, setVolume]);

  const activeSrc =
    sourceUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative flex-1 bg-black flex items-center justify-center overflow-hidden group select-none"
    >
      {/* Native / HTML5 Video Render Surface */}
      <video
        ref={videoRef}
        src={activeSrc}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onLoadedMetadata={(e) => {
          const vid = e.currentTarget;
          setDuration(vid.duration);
        }}
        onClick={togglePlay}
        className={`w-full h-full object-contain ${
          aspectRatio === '16:9'
            ? 'aspect-video'
            : aspectRatio === '4:3'
            ? 'aspect-[4/3]'
            : aspectRatio === '21:9'
            ? 'aspect-[21/9]'
            : ''
        }`}
        playsInline
      />

      {/* Subtitles Overlay */}
      {activeCue && (
        <div
          className="absolute left-0 right-0 flex justify-center pointer-events-none px-6 z-20 transition-all"
          style={{ bottom: `${subtitleStyles.bottomOffsetPercent}%` }}
        >
          <div
            className="px-4 py-1.5 rounded-lg text-center leading-relaxed tracking-wide font-semibold shadow-2xl"
            style={{
              fontSize: `${subtitleStyles.fontSize}px`,
              color: subtitleStyles.color,
              backgroundColor: `rgba(0,0,0,${subtitleStyles.backgroundOpacity})`,
              textShadow: `0 0 ${subtitleStyles.outlineWidth * 2}px ${subtitleStyles.outlineColor}`,
            }}
          >
            {activeCue.text}
          </div>
        </div>
      )}

      {/* Side Panels Overlay (AIPanel, MediaInfo, Equalizer, Tools) */}
      <div className="absolute top-4 right-4 z-40">
        {activeSidePanel === 'ai' && (
          <AIPanel onClose={() => setActiveSidePanel('none')} onSeek={handleSeek} />
        )}
        {activeSidePanel === 'info' && (
          <MediaInfoPanel metadata={metadata} onClose={() => setActiveSidePanel('none')} />
        )}
        {activeSidePanel === 'equalizer' && (
          <EqualizerModal onClose={() => setActiveSidePanel('none')} />
        )}
        {activeSidePanel === 'tools' && (
          <MediaToolsModal onClose={() => setActiveSidePanel('none')} />
        )}
      </div>

      {/* Auto-Hiding Cinematic HUD Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col space-y-2.5 transition-opacity duration-300 z-30 ${
          controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline Bar */}
        <Timeline
          currentTime={currentTime}
          duration={duration}
          bufferedPercent={bufferedPercent}
          loopA={loopA}
          loopB={loopB}
          onSeek={handleSeek}
        />

        {/* Lower Controls Bar */}
        <div className="flex items-center justify-between text-zinc-300 text-xs">
          {/* Left Controls: Play/Pause, Rewind, FastForward, Step, Volume, Time */}
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-transform active:scale-95"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>

            <button
              onClick={() => handleSeek(currentTime - 5)}
              className="p-1.5 hover:text-white transition-colors"
              title="Seek -5s (Left)"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => handleSeek(currentTime + 5)}
              className="p-1.5 hover:text-white transition-colors"
              title="Seek +5s (Right)"
            >
              <RotateCw size={16} />
            </button>

            {/* Frame step buttons */}
            <button
              onClick={() => stepFrame(false)}
              className="p-1.5 hover:text-white transition-colors"
              title="Previous Frame"
            >
              <StepBack size={15} />
            </button>
            <button
              onClick={() => stepFrame(true)}
              className="p-1.5 hover:text-white transition-colors"
              title="Next Frame"
            >
              <StepForward size={15} />
            </button>

            {/* Volume slider & mute */}
            <div className="flex items-center space-x-2 pl-2">
              <button onClick={toggleMute} className="hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-18 h-1 bg-white/20 rounded-full appearance-none accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Time Stamp */}
            <div className="text-[11px] font-mono text-zinc-400 font-semibold pl-1">
              <span className="text-white">{formatDuration(currentTime)}</span>
              <span className="mx-1">/</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Speed, A-B Repeat, Snap, Equalizer, Media Info, AI */}
          <div className="flex items-center space-x-2.5">
            {/* Playback Speed selector */}
            <select
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="bg-black/60 border border-white/10 rounded px-2 py-0.5 text-[11px] font-mono text-cyan-300 font-bold focus:outline-none"
            >
              <option value="0.25">0.25x</option>
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="1.75">1.75x</option>
              <option value="2">2.0x</option>
            </select>

            {/* A-B Loop Button */}
            <button
              onClick={() => {
                if (loopA === null) {
                  setLoopA(currentTime);
                } else if (loopB === null) {
                  setLoopB(currentTime);
                  toggleLoopAB();
                } else {
                  setLoopA(null);
                  setLoopB(null);
                }
              }}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                isLoopingAB
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
              title="A-B Repeat Loop"
            >
              <Repeat size={13} />
              <span>{loopA !== null && loopB === null ? 'Set B' : isLoopingAB ? 'A-B On' : 'A-B'}</span>
            </button>

            {/* Frame Snapshot */}
            <button
              onClick={takeScreenshot}
              className="p-1.5 rounded hover:bg-white/10 hover:text-white transition-colors"
              title="Take Screenshot (P)"
            >
              <Camera size={16} />
            </button>

            {/* Equalizer toggle */}
            <button
              onClick={() => setActiveSidePanel('equalizer')}
              className={`p-1.5 rounded transition-colors ${
                activeSidePanel === 'equalizer'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'hover:bg-white/10 hover:text-white'
              }`}
              title="Audio Equalizer & DSP"
            >
              <AudioWaveform size={16} />
            </button>

            {/* Media Tools */}
            <button
              onClick={() => setActiveSidePanel('tools')}
              className={`p-1.5 rounded transition-colors ${
                activeSidePanel === 'tools'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'hover:bg-white/10 hover:text-white'
              }`}
              title="Media Converter & Tools"
            >
              <Wrench size={16} />
            </button>

            {/* Media Info Inspector */}
            <button
              onClick={() => setActiveSidePanel('info')}
              className={`p-1.5 rounded transition-colors ${
                activeSidePanel === 'info'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'hover:bg-white/10 hover:text-white'
              }`}
              title="Media Technical Information"
            >
              <Info size={16} />
            </button>

            {/* NOVA AI Panel Toggle */}
            <button
              onClick={() => setActiveSidePanel('ai')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeSidePanel === 'ai'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/30'
                  : 'bg-white/10 hover:bg-white/15 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              <Sparkles size={14} />
              <span>Ask AI</span>
            </button>

            {/* Fullscreen */}
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  containerRef.current?.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen().catch(() => {});
                }
              }}
              className="p-1.5 rounded hover:bg-white/10 hover:text-white transition-colors"
              title="Fullscreen (F)"
            >
              <Maximize size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
