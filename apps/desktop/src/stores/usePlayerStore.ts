import { create } from 'zustand';
import {
  PlaybackState,
  AspectRatioOption,
  VideoScalingMode,
  VideoRotation,
  MediaMetadata,
  SubtitleCue,
  EqualizerBand,
} from '@nova/shared-types';

export type ActiveSidePanel = 'none' | 'ai' | 'info' | 'tracks' | 'equalizer' | 'tools';

export interface PlayerStoreState {
  // Playback state
  state: PlaybackState;
  sourceUrl: string | null;
  metadata: MediaMetadata | null;
  currentTime: number;
  duration: number;
  bufferedPercent: number;
  isPlaying: boolean;

  // Audio / Volume
  volume: number; // 0.0 - 1.0
  isMuted: boolean;
  audioDelay: number; // -0.5s to +0.5s
  activeAudioIndex: number;
  equalizerBands: EqualizerBand[];
  isEqualizerEnabled: boolean;

  // Subtitles
  activeSubtitleIndex: number;
  subtitleDelay: number; // -2.0s to +2.0s
  activeCue: SubtitleCue | null;
  secondaryCue: SubtitleCue | null;
  isDualSubtitles: boolean;

  // Speed & Video presentation
  speed: number;
  aspectRatio: AspectRatioOption;
  scalingMode: VideoScalingMode;
  rotation: VideoRotation;
  isFullscreen: boolean;
  isMiniPlayer: boolean;
  isAlwaysOnTop: boolean;

  // A-B Repeat Loop
  loopA: number | null;
  loopB: number | null;
  isLoopingAB: boolean;

  // UI Panels
  activeSidePanel: ActiveSidePanel;

  // Actions
  setState: (state: PlaybackState) => void;
  loadMedia: (url: string, metadata?: MediaMetadata) => void;
  setTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setBufferedPercent: (percent: number) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setSpeed: (speed: number) => void;
  setAspectRatio: (ratio: AspectRatioOption) => void;
  setScalingMode: (mode: VideoScalingMode) => void;
  setRotation: (rotation: VideoRotation) => void;
  setActiveAudioIndex: (index: number) => void;
  setActiveSubtitleIndex: (index: number) => void;
  setSubtitleDelay: (delay: number) => void;
  setAudioDelay: (delay: number) => void;
  setActiveCue: (cue: SubtitleCue | null) => void;
  setSecondaryCue: (cue: SubtitleCue | null) => void;
  setLoopA: (time: number | null) => void;
  setLoopB: (time: number | null) => void;
  toggleLoopAB: () => void;
  toggleFullscreen: () => void;
  toggleMiniPlayer: () => void;
  toggleAlwaysOnTop: () => void;
  setActiveSidePanel: (panel: ActiveSidePanel) => void;
  setEqualizerBandGain: (freq: number, gain: number) => void;
  toggleEqualizer: () => void;
}

const DEFAULT_EQ_BANDS: EqualizerBand[] = [
  { frequency: 60, gain: 0 },
  { frequency: 170, gain: 0 },
  { frequency: 310, gain: 0 },
  { frequency: 600, gain: 0 },
  { frequency: 1000, gain: 0 },
  { frequency: 3000, gain: 0 },
  { frequency: 6000, gain: 0 },
  { frequency: 12000, gain: 0 },
  { frequency: 14000, gain: 0 },
  { frequency: 16000, gain: 0 },
];

export const usePlayerStore = create<PlayerStoreState>((set) => ({
  state: 'idle',
  sourceUrl: null,
  metadata: null,
  currentTime: 0,
  duration: 0,
  bufferedPercent: 0,
  isPlaying: false,

  volume: 0.85,
  isMuted: false,
  audioDelay: 0,
  activeAudioIndex: 0,
  equalizerBands: DEFAULT_EQ_BANDS,
  isEqualizerEnabled: false,

  activeSubtitleIndex: -1,
  subtitleDelay: 0,
  activeCue: null,
  secondaryCue: null,
  isDualSubtitles: false,

  speed: 1.0,
  aspectRatio: 'auto',
  scalingMode: 'fit',
  rotation: 0,
  isFullscreen: false,
  isMiniPlayer: false,
  isAlwaysOnTop: false,

  loopA: null,
  loopB: null,
  isLoopingAB: false,

  activeSidePanel: 'none',

  setState: (state) => set({ state, isPlaying: state === 'playing' }),
  loadMedia: (url, metadata) =>
    set({
      sourceUrl: url,
      metadata: metadata || null,
      currentTime: 0,
      duration: metadata?.duration || 0,
      state: 'ready',
      isPlaying: true,
      activeAudioIndex: metadata?.activeAudioIndex ?? 0,
      activeSubtitleIndex: metadata?.activeSubtitleIndex ?? -1,
    }),
  setTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setBufferedPercent: (bufferedPercent) => set({ bufferedPercent }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying, state: !s.isPlaying ? 'playing' : 'paused' })),
  setPlaying: (isPlaying) => set({ isPlaying, state: isPlaying ? 'playing' : 'paused' }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)), isMuted: false }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  setSpeed: (speed) => set({ speed }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setScalingMode: (scalingMode) => set({ scalingMode }),
  setRotation: (rotation) => set({ rotation }),
  setActiveAudioIndex: (activeAudioIndex) => set({ activeAudioIndex }),
  setActiveSubtitleIndex: (activeSubtitleIndex) => set({ activeSubtitleIndex }),
  setSubtitleDelay: (subtitleDelay) => set({ subtitleDelay }),
  setAudioDelay: (audioDelay) => set({ audioDelay }),
  setActiveCue: (activeCue) => set({ activeCue }),
  setSecondaryCue: (secondaryCue) => set({ secondaryCue }),
  setLoopA: (loopA) => set({ loopA }),
  setLoopB: (loopB) => set({ loopB }),
  toggleLoopAB: () => set((s) => ({ isLoopingAB: !s.isLoopingAB })),
  toggleFullscreen: () => set((s) => ({ isFullscreen: !s.isFullscreen })),
  toggleMiniPlayer: () => set((s) => ({ isMiniPlayer: !s.isMiniPlayer })),
  toggleAlwaysOnTop: () => set((s) => ({ isAlwaysOnTop: !s.isAlwaysOnTop })),
  setActiveSidePanel: (panel) => set((s) => ({ activeSidePanel: s.activeSidePanel === panel ? 'none' : panel })),
  setEqualizerBandGain: (freq, gain) =>
    set((s) => ({
      equalizerBands: s.equalizerBands.map((b) => (b.frequency === freq ? { ...b, gain } : b)),
    })),
  toggleEqualizer: () => set((s) => ({ isEqualizerEnabled: !s.isEqualizerEnabled })),
}));
