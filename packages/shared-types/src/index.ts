/**
 * NOVA PLAYER - Shared Types & Interfaces
 * Unified data contract between Frontend UI, Desktop Shell, Media Engine, and AI Services.
 */

// ==========================================
// 1. Playback & Engine States
// ==========================================

export type PlaybackState =
  | 'idle'
  | 'probing'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'seeking'
  | 'stopped'
  | 'error';

export type AspectRatioOption =
  | 'auto'
  | 'original'
  | '16:9'
  | '16:10'
  | '4:3'
  | '21:9'
  | '1:1'
  | 'custom';

export type VideoScalingMode =
  | 'fit'
  | 'fill'
  | 'original'
  | 'zoom'
  | 'crop';

export type VideoRotation = 0 | 90 | 180 | 270;

export type HardwareAccelerationMode = 'auto' | 'on' | 'off';

export type QualityLabel =
  | '240p'
  | '360p'
  | '480p'
  | '540p'
  | '720p HD'
  | '1080p Full HD'
  | '1440p QHD / 2K'
  | '2160p 4K UHD'
  | '4320p 8K UHD';

// ==========================================
// 2. Media Metadata & Stream Inspector
// ==========================================

export interface VideoStreamInfo {
  index: number;
  codec: string;
  width: number;
  height: number;
  fps: number;
  bitrate?: number;
  pixelFormat?: string;
  aspectRatio?: string;
  colorSpace?: string;
  colorPrimaries?: string;
  colorTransfer?: string;
  isHdr: boolean;
  hdrFormat?: string; // 'HDR10' | 'HLG' | 'Dolby Vision'
}

export interface AudioStreamInfo {
  index: number;
  codec: string;
  channels: number;
  channelLayout?: string;
  sampleRate: number;
  bitrate?: number;
  language?: string;
  title?: string;
  isDefault: boolean;
}

export interface SubtitleStreamInfo {
  index: number;
  codec: string;
  language?: string;
  title?: string;
  isForced: boolean;
  isDefault: boolean;
}

export interface ChapterInfo {
  id: number;
  start: number;
  end: number;
  title: string;
}

export interface MediaMetadata {
  id: string;
  path: string;
  filename: string;
  fileSize: number;
  container: string;
  duration: number; // in seconds
  bitrate: number;
  qualityLabel?: QualityLabel;
  
  // Video Stream (if video)
  hasVideo: boolean;
  videoStream?: VideoStreamInfo;

  // Audio Streams
  hasAudio: boolean;
  audioStreams: AudioStreamInfo[];
  activeAudioIndex: number;

  // Subtitle Streams
  subtitleStreams: SubtitleStreamInfo[];
  activeSubtitleIndex: number; // -1 for disabled

  // Chapters
  chapters: ChapterInfo[];

  // Probe Raw Data
  probeRaw?: unknown;
}

// ==========================================
// 3. Subtitles & Formatting
// ==========================================

export interface SubtitleCue {
  id: string;
  startTime: number; // seconds
  endTime: number; // seconds
  text: string;
  rawText?: string;
  translation?: string;
}

export interface SubtitleStyleOptions {
  fontSize: number; // 14 - 48 px
  fontFamily: string;
  color: string;
  outlineColor: string;
  outlineWidth: number;
  backgroundColor: string;
  backgroundOpacity: number;
  bold: boolean;
  italic: boolean;
  bottomOffsetPercent: number; // 2 - 25%
}

export interface DualSubtitleConfig {
  enabled: boolean;
  primaryLanguage: string;
  secondaryLanguage: string;
  secondaryDelay: number;
}

// ==========================================
// 4. Audio DSP & Equalizer
// ==========================================

export interface EqualizerBand {
  frequency: number; // Hz (60, 170, 310, 600, 1k, 3k, 6k, 12k, 14k, 16k)
  gain: number; // -12dB to +12dB
}

export type EqualizerPreset =
  | 'Flat'
  | 'Bass Boost'
  | 'Treble Boost'
  | 'Rock'
  | 'Pop'
  | 'Classical'
  | 'Movie'
  | 'Voice'
  | 'Custom';

// ==========================================
// 5. Media Library & Storage Records
// ==========================================

export type MediaCategory =
  | 'all'
  | 'videos'
  | 'movies'
  | 'series'
  | 'music'
  | 'lectures'
  | 'favorites'
  | 'recent';

export interface MediaItemRecord {
  id: string;
  path: string;
  filename: string;
  mediaType: 'video' | 'audio';
  container: string;
  duration: number;
  size: number;
  width?: number;
  height?: number;
  qualityLabel?: QualityLabel;
  fps?: number;
  videoCodec?: string;
  videoBitrate?: number;
  audioCodec?: string;
  audioChannels?: number;
  hdr: boolean;
  thumbnailPath?: string;
  dateAdded: string;
  lastPlayed?: string;
  playCount: number;
  favorite: boolean;
}

export interface PlaybackPositionRecord {
  mediaId: string;
  position: number;
  duration: number;
  percentage: number;
  updatedAt: string;
  completed: boolean;
}

export interface BookmarkRecord {
  id: string;
  mediaId: string;
  timestamp: number;
  title: string;
  note?: string;
  createdAt: string;
}

export interface PlaylistRecord {
  id: string;
  name: string;
  itemCount: number;
  totalDuration: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 6. AI Intelligence & Speech-to-Text
// ==========================================

export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  confidence?: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    probability: number;
  }>;
}

export interface FullTranscript {
  id: string;
  mediaId: string;
  language: string;
  modelUsed: string;
  segments: TranscriptSegment[];
  createdAt: string;
}

export interface VideoRAGQuery {
  mediaId: string;
  question: string;
  currentTimestamp?: number;
  timeWindowSeconds?: number;
}

export interface Citation {
  timestamp: number; // in seconds
  label: string; // e.g. "14:20"
  snippet: string;
}

export interface VideoRAGResponse {
  answer: string;
  citations: Citation[];
  confidence: number;
  relevantSegments: TranscriptSegment[];
}

export interface VideoSummaryOutput {
  mediaId: string;
  shortSummary: string;
  detailedSummary: string;
  keyPoints: string[];
  smartChapters: Array<{
    startTime: number;
    endTime: number;
    title: string;
    summary: string;
  }>;
  keyMoments: Array<{
    timestamp: number;
    title: string;
    description: string;
  }>;
}

// ==========================================
// 7. Learning Mode (NOVA Learn)
// ==========================================

export interface LectureNoteSection {
  id: string;
  timestamp?: number;
  title: string;
  bullets: string[];
}

export interface LectureNotes {
  id: string;
  mediaId: string;
  title: string;
  executiveSummary: string;
  sections: LectureNoteSection[];
  keyDefinitions: Array<{ term: string; definition: string; timestamp?: number }>;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  mediaId: string;
  question: string;
  answer: string;
  timestamp?: number;
  box: number; // 1 to 5 (Leitner system)
  lastReviewed?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // exactly 4 options
  correctOptionIndex: number;
  explanation: string;
  timestamp: number;
}

export interface Quiz {
  id: string;
  mediaId: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  total: number;
  percentage: number;
  weakTopics: string[];
  attemptedAt: string;
}

// ==========================================
// 8. FFmpeg Media Tools & Tasks
// ==========================================

export type ConversionFormat = 'mp4' | 'webm' | 'mkv' | 'mp3' | 'aac' | 'wav' | 'flac';

export interface ConversionTaskOptions {
  sourcePath: string;
  outputPath: string;
  outputFormat: ConversionFormat;
  preset: 'original' | 'high' | 'balanced' | 'small';
  resolution?: 'original' | '1080p' | '720p' | '480p';
  startTime?: number; // trim start
  endTime?: number; // trim end
  extractAudioOnly?: boolean;
}

export interface GIFCreationOptions {
  sourcePath: string;
  outputPath: string;
  startTime: number;
  duration: number; // max 30s
  fps: number; // 10, 15, 24
  width: number; // 320, 480, 640
}

// ==========================================
// 9. AI Service & Job State
// ==========================================

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface AIJob {
  id: string;
  type: 'transcribe' | 'summarize' | 'rag_index' | 'learning_gen';
  status: JobStatus;
  progressPercent: number;
  currentStepMessage: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIServiceHealth {
  status: 'healthy' | 'degraded' | 'unavailable';
  version: string;
  cudaAvailable: boolean;
  gpuDeviceName?: string;
  modelsLoaded: string[];
  activeJobsCount: number;
}
