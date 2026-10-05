import { SubtitleCue } from '@nova/shared-types';

export class SubtitleEngine {
  private cues: SubtitleCue[] = [];
  private delaySeconds: number = 0;

  /**
   * Convert timestamp string (SRT "00:01:23,456" or VTT "00:01:23.456") to seconds.
   */
  public static parseTimestamp(timeStr: string): number {
    const clean = timeStr.trim().replace(',', '.');
    const parts = clean.split(':');
    if (parts.length === 3) {
      const hours = parseFloat(parts[0]);
      const minutes = parseFloat(parts[1]);
      const seconds = parseFloat(parts[2]);
      return hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 2) {
      const minutes = parseFloat(parts[0]);
      const seconds = parseFloat(parts[1]);
      return minutes * 60 + seconds;
    }
    return 0;
  }

  /**
   * Format seconds into SRT timestamp string "HH:MM:SS,mmm".
   */
  public static formatSrtTimestamp(seconds: number): string {
    const totalMs = Math.max(0, Math.floor(seconds * 1000));
    const ms = totalMs % 1000;
    const totalSecs = Math.floor(totalMs / 1000);
    const secs = totalSecs % 60;
    const totalMins = Math.floor(totalSecs / 60);
    const mins = totalMins % 60;
    const hours = Math.floor(totalMins / 60);

    const pad = (n: number, w: number = 2) => n.toString().padStart(w, '0');
    return `${pad(hours)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
  }

  /**
   * Format seconds into WebVTT timestamp string "HH:MM:SS.mmm".
   */
  public static formatVttTimestamp(seconds: number): string {
    return this.formatSrtTimestamp(seconds).replace(',', '.');
  }

  /**
   * Parse SubRip (.srt) subtitle text.
   */
  public static parseSRT(content: string): SubtitleCue[] {
    const cues: SubtitleCue[] = [];
    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocks = normalized.split(/\n\s*\n/);

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 2) continue;

      let timeIndex = 0;
      let id = lines[0].trim();

      // If line 0 is numeric index, time is on line 1
      if (/^\d+$/.test(id) && lines.length >= 3) {
        timeIndex = 1;
      } else {
        id = `cue-${cues.length + 1}`;
      }

      const timeLine = lines[timeIndex];
      const match = timeLine.match(/(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})/);
      if (!match) continue;

      const startTime = this.parseTimestamp(match[1]);
      const endTime = this.parseTimestamp(match[2]);
      const rawText = lines.slice(timeIndex + 1).join('\n');
      const text = rawText.replace(/<[^>]*>/g, '').trim(); // Strip HTML tags for clean display

      if (endTime > startTime && text.length > 0) {
        cues.push({
          id,
          startTime,
          endTime,
          text,
          rawText,
        });
      }
    }

    return cues.sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Parse WebVTT (.vtt) subtitle text.
   */
  public static parseVTT(content: string): SubtitleCue[] {
    const cues: SubtitleCue[] = [];
    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocks = normalized.split(/\n\s*\n/);

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length === 0 || lines[0].startsWith('WEBVTT') || lines[0].startsWith('NOTE')) continue;

      let timeIndex = 0;
      let id = `vtt-${cues.length + 1}`;

      if (lines.length >= 2 && !lines[0].includes('-->')) {
        id = lines[0].trim();
        timeIndex = 1;
      }

      const timeLine = lines[timeIndex];
      if (!timeLine) continue;

      const match = timeLine.match(/((?:\d{1,2}:)?\d{2}:\d{2}[.]\d{1,3})\s*-->\s*((?:\d{1,2}:)?\d{2}:\d{2}[.]\d{1,3})/);
      if (!match) continue;

      const startTime = this.parseTimestamp(match[1]);
      const endTime = this.parseTimestamp(match[2]);
      const rawText = lines.slice(timeIndex + 1).join('\n');
      const text = rawText.replace(/<[^>]*>/g, '').trim();

      if (endTime > startTime && text.length > 0) {
        cues.push({
          id,
          startTime,
          endTime,
          text,
          rawText,
        });
      }
    }

    return cues.sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Load raw subtitle content (auto-detects SRT or VTT).
   */
  public loadContent(content: string): void {
    if (content.trim().startsWith('WEBVTT')) {
      this.cues = SubtitleEngine.parseVTT(content);
    } else {
      this.cues = SubtitleEngine.parseSRT(content);
    }
  }

  /**
   * Set synchronization delay offset in seconds (-2.0s to +2.0s).
   */
  public setDelay(delaySeconds: number): void {
    this.delaySeconds = Math.max(-5.0, Math.min(5.0, delaySeconds));
  }

  public getDelay(): number {
    return this.delaySeconds;
  }

  /**
   * Binary search retrieval of active subtitle cue at given playback timestamp.
   */
  public getActiveCue(currentTimeSeconds: number): SubtitleCue | null {
    if (this.cues.length === 0) return null;

    // Apply delay offset: adjusted = current - delay
    const adjustedTime = currentTimeSeconds - this.delaySeconds;

    let low = 0;
    let high = this.cues.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const cue = this.cues[mid];

      if (adjustedTime >= cue.startTime && adjustedTime <= cue.endTime) {
        return cue;
      }

      if (adjustedTime < cue.startTime) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return null;
  }

  public getAllCues(): SubtitleCue[] {
    return this.cues;
  }

  /**
   * Export cues to standard SRT string.
   */
  public static exportToSRT(cues: SubtitleCue[]): string {
    return cues
      .map((cue, idx) => {
        const start = this.formatSrtTimestamp(cue.startTime);
        const end = this.formatSrtTimestamp(cue.endTime);
        return `${idx + 1}\n${start} --> ${end}\n${cue.text}\n`;
      })
      .join('\n');
  }

  /**
   * Export cues to standard WebVTT string.
   */
  public static exportToVTT(cues: SubtitleCue[]): string {
    const body = cues
      .map((cue, idx) => {
        const start = this.formatVttTimestamp(cue.startTime);
        const end = this.formatVttTimestamp(cue.endTime);
        return `${idx + 1}\n${start} --> ${end}\n${cue.text}\n`;
      })
      .join('\n');
    return `WEBVTT\n\n${body}`;
  }
}
