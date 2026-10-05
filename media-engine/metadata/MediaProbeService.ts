import {
  MediaMetadata,
  QualityLabel,
  VideoStreamInfo,
  AudioStreamInfo,
  SubtitleStreamInfo,
  ChapterInfo,
} from '@nova/shared-types';

export interface FFprobeRawStream {
  index: number;
  codec_name?: string;
  codec_type?: 'video' | 'audio' | 'subtitle' | 'data';
  width?: number;
  height?: number;
  r_frame_rate?: string;
  avg_frame_rate?: string;
  bit_rate?: string;
  pix_fmt?: string;
  display_aspect_ratio?: string;
  color_space?: string;
  color_primaries?: string;
  color_transfer?: string;
  sample_rate?: string;
  channels?: number;
  channel_layout?: string;
  disposition?: {
    default?: number;
    forced?: number;
  };
  tags?: {
    language?: string;
    title?: string;
    [key: string]: string | undefined;
  };
}

export interface FFprobeRawChapter {
  id: number;
  time_base: string;
  start: number;
  start_time: string;
  end: number;
  end_time: string;
  tags?: {
    title?: string;
  };
}

export interface FFprobeRawFormat {
  filename: string;
  format_name: string;
  duration?: string;
  size?: string;
  bit_rate?: string;
  tags?: Record<string, string>;
}

export interface FFprobeRawOutput {
  streams?: FFprobeRawStream[];
  chapters?: FFprobeRawChapter[];
  format?: FFprobeRawFormat;
}

export class MediaProbeService {
  /**
   * Determine exact quality label strictly from actual probed width and height.
   * Never relies on filename or URL.
   */
  public static calculateQualityLabel(width: number, height: number): QualityLabel {
    const minDim = Math.min(width, height);
    const maxDim = Math.max(width, height);

    if (maxDim >= 7680 || minDim >= 4320) return '4320p 8K UHD';
    if (maxDim >= 3840 || minDim >= 2160) return '2160p 4K UHD';
    if (maxDim >= 2560 || minDim >= 1440) return '1440p QHD / 2K';
    if (maxDim >= 1920 || minDim >= 1080) return '1080p Full HD';
    if (maxDim >= 1280 || minDim >= 720) return '720p HD';
    if (minDim >= 540) return '540p';
    if (minDim >= 480) return '480p';
    if (minDim >= 360) return '360p';
    return '240p';
  }

  /**
   * Parse frame rate string such as "24/1", "24000/1001", "60/1" into numeric FPS.
   */
  public static parseFrameRate(rateStr?: string): number {
    if (!rateStr || rateStr === '0/0') return 0;
    const parts = rateStr.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (den > 0) return Math.round((num / den) * 100) / 100;
    }
    const direct = parseFloat(rateStr);
    return isNaN(direct) ? 0 : Math.round(direct * 100) / 100;
  }

  /**
   * Inspect color primaries and transfer functions to detect true HDR metadata.
   */
  public static detectHdr(stream: FFprobeRawStream): { isHdr: boolean; hdrFormat?: string } {
    const primaries = (stream.color_primaries || '').toLowerCase();
    const transfer = (stream.color_transfer || '').toLowerCase();

    if (primaries.includes('bt2020') || transfer.includes('smpte2084') || transfer.includes('arib-std-b67')) {
      if (transfer.includes('arib-std-b67')) {
        return { isHdr: true, hdrFormat: 'HLG' };
      }
      return { isHdr: true, hdrFormat: 'HDR10' };
    }
    return { isHdr: false };
  }

  /**
   * Normalize raw ffprobe JSON into typed MediaMetadata.
   */
  public static normalizeMetadata(raw: FFprobeRawOutput, fallbackPath: string): MediaMetadata {
    const format = raw.format || { filename: fallbackPath, format_name: 'unknown' };
    const streams = raw.streams || [];
    const chapters = raw.chapters || [];

    const duration = parseFloat(format.duration || '0');
    const fileSize = parseInt(format.size || '0', 10);
    const overallBitrate = parseInt(format.bit_rate || '0', 10);
    const container = (format.format_name || 'unknown').split(',')[0].toUpperCase();

    // 1. Video Stream
    const rawVideo = streams.find((s) => s.codec_type === 'video');
    let videoStream: VideoStreamInfo | undefined;
    let qualityLabel: QualityLabel | undefined;

    if (rawVideo && rawVideo.width && rawVideo.height) {
      const fps = this.parseFrameRate(rawVideo.r_frame_rate || rawVideo.avg_frame_rate);
      const hdrInfo = this.detectHdr(rawVideo);
      qualityLabel = this.calculateQualityLabel(rawVideo.width, rawVideo.height);

      videoStream = {
        index: rawVideo.index,
        codec: (rawVideo.codec_name || 'unknown').toUpperCase(),
        width: rawVideo.width,
        height: rawVideo.height,
        fps,
        bitrate: rawVideo.bit_rate ? parseInt(rawVideo.bit_rate, 10) : undefined,
        pixelFormat: rawVideo.pix_fmt,
        aspectRatio: rawVideo.display_aspect_ratio,
        colorSpace: rawVideo.color_space,
        colorPrimaries: rawVideo.color_primaries,
        colorTransfer: rawVideo.color_transfer,
        isHdr: hdrInfo.isHdr,
        hdrFormat: hdrInfo.hdrFormat,
      };
    }

    // 2. Audio Streams
    const audioStreams: AudioStreamInfo[] = streams
      .filter((s) => s.codec_type === 'audio')
      .map((s) => ({
        index: s.index,
        codec: (s.codec_name || 'unknown').toUpperCase(),
        channels: s.channels || 2,
        channelLayout: s.channel_layout || (s.channels === 6 ? '5.1' : s.channels === 1 ? 'mono' : 'stereo'),
        sampleRate: parseInt(s.sample_rate || '48000', 10),
        bitrate: s.bit_rate ? parseInt(s.bit_rate, 10) : undefined,
        language: s.tags?.language || 'und',
        title: s.tags?.title,
        isDefault: Boolean(s.disposition?.default),
      }));

    // 3. Subtitle Streams
    const subtitleStreams: SubtitleStreamInfo[] = streams
      .filter((s) => s.codec_type === 'subtitle')
      .map((s) => ({
        index: s.index,
        codec: (s.codec_name || 'unknown').toUpperCase(),
        language: s.tags?.language || 'und',
        title: s.tags?.title,
        isForced: Boolean(s.disposition?.forced),
        isDefault: Boolean(s.disposition?.default),
      }));

    // 4. Chapters
    const normalizedChapters: ChapterInfo[] = chapters.map((c) => ({
      id: c.id,
      start: parseFloat(c.start_time || '0'),
      end: parseFloat(c.end_time || '0'),
      title: c.tags?.title || `Chapter ${c.id + 1}`,
    }));

    const path = format.filename || fallbackPath;
    const filename = path.split(/[/\\]/).pop() || 'Unknown Media';

    // Active track defaults
    const defaultAudio = audioStreams.findIndex((a) => a.isDefault);
    const activeAudioIndex = defaultAudio >= 0 ? defaultAudio : audioStreams.length > 0 ? 0 : -1;

    const defaultSub = subtitleStreams.findIndex((s) => s.isDefault);
    const activeSubtitleIndex = defaultSub >= 0 ? defaultSub : -1; // disabled by default unless forced/default

    return {
      id: path,
      path,
      filename,
      fileSize,
      container,
      duration,
      bitrate: overallBitrate,
      qualityLabel,
      hasVideo: Boolean(videoStream),
      videoStream,
      hasAudio: audioStreams.length > 0,
      audioStreams,
      activeAudioIndex,
      subtitleStreams,
      activeSubtitleIndex,
      chapters: normalizedChapters,
      probeRaw: raw,
    };
  }
}
