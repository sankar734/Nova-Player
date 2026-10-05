import {
  TranscriptSegment,
  VideoRAGResponse,
  VideoSummaryOutput,
  LectureNotes,
  Flashcard,
  Quiz,
} from '@nova/shared-types';
import { useSettingsStore } from '../stores/useSettingsStore';

class AIClient {
  private get baseUrl(): string {
    return useSettingsStore.getState().aiServiceUrl;
  }

  public async checkHealth(): Promise<{ status: string; cuda: boolean; device: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { status: data.status, cuda: data.cuda_available, device: data.device };
    } catch {
      return { status: 'offline', cuda: false, device: 'none' };
    }
  }

  public async transcribeMedia(mediaPath: string, mediaId: string): Promise<{ segments: TranscriptSegment[]; srt: string; vtt: string }> {
    const res = await fetch(`${this.baseUrl}/media/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_path: mediaPath, media_id: mediaId }),
    });
    if (!res.ok) throw new Error(`Transcription failed: ${res.statusText}`);
    const data = await res.json();
    return {
      segments: data.segments,
      srt: data.srt_content,
      vtt: data.vtt_content,
    };
  }

  public async askVideo(
    mediaId: string,
    question: string,
    currentTimestamp: number,
    segments: TranscriptSegment[]
  ): Promise<VideoRAGResponse> {
    const res = await fetch(`${this.baseUrl}/media/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_id: mediaId,
        question,
        current_timestamp: currentTimestamp,
        segments,
      }),
    });
    if (!res.ok) throw new Error(`Ask Video failed: ${res.statusText}`);
    const data = await res.json();
    return {
      answer: data.answer,
      citations: data.citations,
      confidence: data.confidence,
      relevantSegments: data.relevant_segments,
    };
  }

  public async summarizeMedia(mediaId: string, segments: TranscriptSegment[]): Promise<VideoSummaryOutput> {
    const res = await fetch(`${this.baseUrl}/media/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId, segments, detail_level: 'detailed' }),
    });
    if (!res.ok) throw new Error(`Summarize failed: ${res.statusText}`);
    const data = await res.json();
    return {
      mediaId: data.media_id,
      shortSummary: data.short_summary,
      detailedSummary: data.detailed_summary,
      keyPoints: data.key_points,
      smartChapters: data.smart_chapters.map((c: any) => ({
        startTime: c.start_time,
        endTime: c.end_time,
        title: c.title,
        summary: c.summary,
      })),
      keyMoments: data.key_moments,
    };
  }

  public async generateNotes(mediaId: string, title: string, segments: TranscriptSegment[]): Promise<LectureNotes> {
    const res = await fetch(`${this.baseUrl}/learning/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId, title, segments }),
    });
    if (!res.ok) throw new Error(`Generate notes failed: ${res.statusText}`);
    const data = await res.json();
    return {
      id: `notes-${mediaId}`,
      mediaId: data.media_id,
      title: data.title,
      executiveSummary: data.executive_summary,
      sections: data.sections,
      keyDefinitions: data.key_definitions,
      createdAt: new Date().toISOString(),
    };
  }

  public async generateFlashcards(mediaId: string, segments: TranscriptSegment[], count: number = 5): Promise<Flashcard[]> {
    const res = await fetch(`${this.baseUrl}/learning/flashcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId, segments, count }),
    });
    if (!res.ok) throw new Error(`Flashcards failed: ${res.statusText}`);
    const data = await res.json();
    return data.flashcards.map((f: any) => ({
      id: f.id,
      mediaId,
      question: f.question,
      answer: f.answer,
      timestamp: f.timestamp,
      box: f.box,
    }));
  }

  public async generateQuiz(mediaId: string, title: string, segments: TranscriptSegment[], count: number = 5): Promise<Quiz> {
    const res = await fetch(`${this.baseUrl}/learning/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId, title, segments, question_count: count }),
    });
    if (!res.ok) throw new Error(`Quiz failed: ${res.statusText}`);
    const data = await res.json();
    return {
      id: `quiz-${mediaId}`,
      mediaId: data.media_id,
      title: data.title,
      difficulty: data.difficulty,
      questions: data.questions.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctOptionIndex: q.correct_option_index,
        explanation: q.explanation,
        timestamp: q.timestamp,
      })),
      createdAt: new Date().toISOString(),
    };
  }

  public async translateSubtitles(segments: TranscriptSegment[], targetLanguage: string): Promise<TranscriptSegment[]> {
    const res = await fetch(`${this.baseUrl}/media/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ segments, target_language: targetLanguage }),
    });
    if (!res.ok) throw new Error(`Translate failed: ${res.statusText}`);
    const data = await res.json();
    return data.translated_segments.map((s: any) => ({
      id: s.id,
      startTime: s.start_time,
      endTime: s.end_time,
      text: s.text,
      confidence: s.confidence,
    }));
  }
}

export const aiClient = new AIClient();
