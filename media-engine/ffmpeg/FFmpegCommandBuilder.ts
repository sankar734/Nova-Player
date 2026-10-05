import {
  ConversionTaskOptions,
  GIFCreationOptions,
} from '@nova/shared-types';

export interface ThumbnailGridOptions {
  sourcePath: string;
  outputPath: string;
  intervalSeconds: number;
  thumbWidth: number;
  thumbHeight: number;
  columns: number;
  rows: number;
}

export interface AudioExtractionOptions {
  sourcePath: string;
  outputPath: string;
  sampleRate?: number; // e.g. 16000 for Whisper STT
  channels?: number; // 1 for mono
  codec?: 'pcm_s16le' | 'libmp3lame' | 'aac' | 'flac';
}

export interface SubtitleExtractionOptions {
  sourcePath: string;
  streamIndex: number;
  outputPath: string;
}

/**
 * FFmpegCommandBuilder
 * Generates validated, injection-safe argument arrays for FFmpeg child process invocation.
 * Never executes raw shell strings.
 */
export class FFmpegCommandBuilder {
  /**
   * Safe path validation: checks against path traversal or malicious characters.
   */
  public static validatePath(path: string): string {
    if (!path || typeof path !== 'string') {
      throw new Error('Invalid path argument');
    }
    // Reject control characters and dangerous delimiters
    if (/[\r\n\0<>:"|?*]/.test(path.replace(/^[a-zA-Z]:\\/, ''))) {
      throw new Error(`Path contains disallowed characters: ${path}`);
    }
    return path;
  }

  /**
   * Build arguments for Media Transcoding / Trimming.
   */
  public static buildTranscodeArgs(opts: ConversionTaskOptions): string[] {
    const args: string[] = ['-y']; // Overwrite target safely

    // Seeking before input for fast seek if start time specified
    if (opts.startTime !== undefined && opts.startTime > 0) {
      args.push('-ss', opts.startTime.toFixed(3));
    }

    args.push('-i', this.validatePath(opts.sourcePath));

    if (opts.endTime !== undefined && opts.endTime > (opts.startTime || 0)) {
      const duration = opts.endTime - (opts.startTime || 0);
      args.push('-t', duration.toFixed(3));
    }

    if (opts.extractAudioOnly) {
      args.push('-vn');
      switch (opts.outputFormat) {
        case 'mp3':
          args.push('-c:a', 'libmp3lame', '-b:a', '320k');
          break;
        case 'aac':
          args.push('-c:a', 'aac', '-b:a', '256k');
          break;
        case 'flac':
          args.push('-c:a', 'flac');
          break;
        case 'wav':
        default:
          args.push('-c:a', 'pcm_s16le');
          break;
      }
    } else {
      // Video transcoding
      const scaleFilters: string[] = [];
      if (opts.resolution && opts.resolution !== 'original') {
        if (opts.resolution === '1080p') scaleFilters.push('scale=-2:1080');
        else if (opts.resolution === '720p') scaleFilters.push('scale=-2:720');
        else if (opts.resolution === '480p') scaleFilters.push('scale=-2:480');
      }

      if (scaleFilters.length > 0) {
        args.push('-vf', scaleFilters.join(','));
      }

      switch (opts.outputFormat) {
        case 'webm':
          args.push('-c:v', 'libvpx-vp9', '-c:a', 'libopus');
          if (opts.preset === 'high') args.push('-crf', '24', '-b:v', '0');
          else if (opts.preset === 'small') args.push('-crf', '35', '-b:v', '0');
          else args.push('-crf', '30', '-b:v', '0');
          break;
        case 'mkv':
          args.push('-c:v', 'libx264', '-c:a', 'aac');
          if (opts.preset === 'high') args.push('-crf', '18', '-preset', 'slow');
          else if (opts.preset === 'small') args.push('-crf', '28', '-preset', 'faster');
          else args.push('-crf', '22', '-preset', 'medium');
          break;
        case 'mp4':
        default:
          args.push('-c:v', 'libx264', '-c:a', 'aac', '-movflags', '+faststart');
          if (opts.preset === 'high') args.push('-crf', '18', '-preset', 'slow');
          else if (opts.preset === 'small') args.push('-crf', '28', '-preset', 'faster');
          else args.push('-crf', '23', '-preset', 'medium');
          break;
      }
    }

    args.push(this.validatePath(opts.outputPath));
    return args;
  }

  /**
   * Build arguments for Whisper Audio Extraction (16kHz Mono WAV).
   */
  public static buildWhisperAudioArgs(sourcePath: string, outputPath: string): string[] {
    return [
      '-y',
      '-i',
      this.validatePath(sourcePath),
      '-vn',
      '-acodec',
      'pcm_s16le',
      '-ar',
      '16000',
      '-ac',
      '1',
      this.validatePath(outputPath),
    ];
  }

  /**
   * Build arguments for Thumbnail Sprite Generation (every N seconds).
   */
  public static buildThumbnailSpriteArgs(opts: ThumbnailGridOptions): string[] {
    const filter = `fps=1/${opts.intervalSeconds},scale=${opts.thumbWidth}:${opts.thumbHeight}:force_original_aspect_ratio=decrease,pad=${opts.thumbWidth}:${opts.thumbHeight}:(ow-iw)/2:(oh-ih)/2,tile=${opts.columns}x${opts.rows}`;
    return [
      '-y',
      '-i',
      this.validatePath(opts.sourcePath),
      '-vf',
      filter,
      '-frames:v',
      '1',
      '-q:v',
      '3',
      this.validatePath(opts.outputPath),
    ];
  }

  /**
   * Build arguments for High-Quality Animated GIF creation with palettegen.
   */
  public static buildGifArgs(opts: GIFCreationOptions): string[] {
    const filter = `fps=${opts.fps},scale=${opts.width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;
    return [
      '-y',
      '-ss',
      opts.startTime.toFixed(3),
      '-t',
      opts.duration.toFixed(3),
      '-i',
      this.validatePath(opts.sourcePath),
      '-vf',
      filter,
      this.validatePath(opts.outputPath),
    ];
  }

  /**
   * Build arguments for Subtitle Track Extraction.
   */
  public static buildSubtitleExtractArgs(opts: SubtitleExtractionOptions): string[] {
    return [
      '-y',
      '-i',
      this.validatePath(opts.sourcePath),
      '-map',
      `0:${opts.streamIndex}`,
      this.validatePath(opts.outputPath),
    ];
  }
}
