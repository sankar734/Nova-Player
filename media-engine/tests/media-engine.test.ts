import { describe, it, expect } from 'vitest';
import { MediaProbeService } from '../metadata/MediaProbeService';
import { FFmpegCommandBuilder } from '../ffmpeg/FFmpegCommandBuilder';
import { SubtitleEngine } from '../subtitles/SubtitleEngine';

describe('MediaProbeService', () => {
  it('correctly maps pixel dimensions to quality labels without relying on filename', () => {
    expect(MediaProbeService.calculateQualityLabel(1280, 720)).toBe('720p HD');
    expect(MediaProbeService.calculateQualityLabel(1920, 1080)).toBe('1080p Full HD');
    expect(MediaProbeService.calculateQualityLabel(2560, 1440)).toBe('1440p QHD / 2K');
    expect(MediaProbeService.calculateQualityLabel(3840, 2160)).toBe('2160p 4K UHD');
    expect(MediaProbeService.calculateQualityLabel(7680, 4320)).toBe('4320p 8K UHD');
    expect(MediaProbeService.calculateQualityLabel(640, 360)).toBe('360p');
    expect(MediaProbeService.calculateQualityLabel(854, 480)).toBe('480p');
  });

  it('correctly parses complex framerates', () => {
    expect(MediaProbeService.parseFrameRate('24000/1001')).toBe(23.98);
    expect(MediaProbeService.parseFrameRate('30000/1001')).toBe(29.97);
    expect(MediaProbeService.parseFrameRate('60/1')).toBe(60);
    expect(MediaProbeService.parseFrameRate('0/0')).toBe(0);
  });

  it('detects HDR primaries and transfer characteristics', () => {
    const hdrStream = {
      index: 0,
      color_primaries: 'bt2020',
      color_transfer: 'smpte2084',
    };
    expect(MediaProbeService.detectHdr(hdrStream)).toEqual({ isHdr: true, hdrFormat: 'HDR10' });

    const sdrStream = {
      index: 0,
      color_primaries: 'bt709',
      color_transfer: 'bt709',
    };
    expect(MediaProbeService.detectHdr(sdrStream)).toEqual({ isHdr: false });
  });
});

describe('FFmpegCommandBuilder', () => {
  it('builds safe transcode arguments with valid resolution scaling', () => {
    const args = FFmpegCommandBuilder.buildTranscodeArgs({
      sourcePath: 'C:\\Videos\\sample.mkv',
      outputPath: 'C:\\Videos\\output.mp4',
      outputFormat: 'mp4',
      preset: 'high',
      resolution: '1080p',
    });

    expect(args).toContain('-i');
    expect(args).toContain('C:\\Videos\\sample.mkv');
    expect(args).toContain('scale=-2:1080');
    expect(args).toContain('-c:v');
    expect(args).toContain('libx264');
    expect(args).toContain('C:\\Videos\\output.mp4');
  });

  it('builds Whisper 16kHz audio extraction arguments', () => {
    const args = FFmpegCommandBuilder.buildWhisperAudioArgs('input.mp4', 'output.wav');
    expect(args).toEqual([
      '-y',
      '-i',
      'input.mp4',
      '-vn',
      '-acodec',
      'pcm_s16le',
      '-ar',
      '16000',
      '-ac',
      '1',
      'output.wav',
    ]);
  });
});

describe('SubtitleEngine', () => {
  it('parses SRT cues and accurately searches by timestamp with delay', () => {
    const srt = `1
00:00:01,000 --> 00:00:04,000
Welcome to NOVA Player.

2
00:00:05,500 --> 00:00:08,200
Play Anything. Understand Everything.
`;
    const engine = new SubtitleEngine();
    engine.loadContent(srt);
    expect(engine.getAllCues().length).toBe(2);

    // Query timestamp 2.5s (within Cue 1)
    const cue1 = engine.getActiveCue(2.5);
    expect(cue1?.text).toBe('Welcome to NOVA Player.');

    // Query timestamp 6.0s (within Cue 2)
    const cue2 = engine.getActiveCue(6.0);
    expect(cue2?.text).toBe('Play Anything. Understand Everything.');

    // Apply delay offset: +1.0s delay shifts cue search
    engine.setDelay(1.0);
    // at 3.5s playback, adjusted = 3.5 - 1.0 = 2.5s -> cue 1
    expect(engine.getActiveCue(3.5)?.text).toBe('Welcome to NOVA Player.');
  });
});
