import {
  PlaybackState,
  AspectRatioOption,
  VideoScalingMode,
  VideoRotation,
  MediaMetadata,
  AudioStreamInfo,
  SubtitleStreamInfo,
} from '@nova/shared-types';

export interface PlaybackEngineEvents {
  stateChange: (state: PlaybackState) => void;
  timeUpdate: (currentTime: number, duration: number) => void;
  buffering: (bufferedPercent: number) => void;
  tracksChanged: (audioTracks: AudioStreamInfo[], subtitleTracks: SubtitleStreamInfo[]) => void;
  volumeChange: (volume: number, muted: boolean) => void;
  speedChange: (speed: number) => void;
  error: (error: Error) => void;
  ended: () => void;
}

export type PlaybackEngineEventHandler<K extends keyof PlaybackEngineEvents> = PlaybackEngineEvents[K];

/**
 * Universal PlaybackEngine Interface
 * Provides full abstraction over native (libmpv/libVLC) and web (HTML5/MSE) playback cores.
 */
export interface PlaybackEngine {
  readonly id: string;
  readonly name: string;

  // Lifecycle
  init(mountElement: HTMLElement): Promise<void>;
  load(source: string, initialPosition?: number): Promise<MediaMetadata>;
  destroy(): Promise<void>;

  // Core Playback Controls
  play(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  seek(seconds: number): Promise<void>;
  stepFrame(forward: boolean): Promise<void>;

  // Volume & Speed
  getVolume(): number;
  setVolume(volume: number): void; // 0.0 to 1.0
  isMuted(): boolean;
  setMuted(muted: boolean): void;
  getSpeed(): number;
  setSpeed(speed: number): void; // 0.25x to 4.0x

  // Track Management
  getAudioTracks(): AudioStreamInfo[];
  setAudioTrack(index: number): void;
  getSubtitleTracks(): SubtitleStreamInfo[];
  setSubtitleTrack(index: number): void; // -1 to disable
  setAudioDelay(delaySeconds: number): void; // -0.5s to +0.5s
  setSubtitleDelay(delaySeconds: number): void; // -2.0s to +2.0s

  // Video Presentation Controls
  setAspectRatio(ratio: AspectRatioOption): void;
  setScalingMode(mode: VideoScalingMode): void;
  setRotation(degrees: VideoRotation): void;
  takeSnapshot(): Promise<string>; // returns base64 or blob URL of current frame

  // State Inspection
  getState(): PlaybackState;
  getCurrentTime(): number;
  getDuration(): number;
  getMetadata(): MediaMetadata | null;

  // Event Subscription
  on<K extends keyof PlaybackEngineEvents>(event: K, handler: PlaybackEngineEventHandler<K>): void;
  off<K extends keyof PlaybackEngineEvents>(event: K, handler: PlaybackEngineEventHandler<K>): void;
}
