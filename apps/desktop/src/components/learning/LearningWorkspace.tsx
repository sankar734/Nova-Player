import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  FileText,
  Layers,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Clock,
  Award,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { aiClient } from '../../services/aiClient';
import { LectureNotes, Flashcard, Quiz } from '@nova/shared-types';

export interface LearningWorkspaceProps {
  onSeekTo: (seconds: number) => void;
}

export const LearningWorkspace: React.FC<LearningWorkspaceProps> = ({ onSeekTo }) => {
  const { metadata } = usePlayerStore();
  const [subTab, setSubTab] = useState<'notes' | 'flashcards' | 'quiz'>('notes');
  const [notes, setNotes] = useState<LectureNotes | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const sampleSegments = [
    { id: '1', start_time: 0, end_time: 15, text: 'Distributed systems and multimedia architectures.' },
    { id: '2', start_time: 24.5, end_time: 42, text: 'DirectX video acceleration offloads decoding to GPU.' },
    { id: '3', start_time: 42.5, end_time: 65, text: 'Semantic vector search finds video concepts.' },
  ];

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const title = metadata?.filename || 'Introduction to Multimedia Systems';
        const [n, f, q] = await Promise.all([
          aiClient.generateNotes('media-1', title, sampleSegments as any),
          aiClient.generateFlashcards('media-1', sampleSegments as any, 5),
          aiClient.generateQuiz('media-1', title, sampleSegments as any, 5),
        ]);
        setNotes(n);
        setFlashcards(f);
        setQuiz(q);
      } catch {
        // Fallback default
        setNotes({
          id: 'n-fallback',
          mediaId: 'm-1',
          title: 'Notes: Hardware Video Decoders & RAG',
          executiveSummary:
            'These notes outline low-latency video playback pipelines, GPU decoding offload, and transcript search.',
          sections: [
            {
              id: 's1',
              timestamp: 0,
              title: '1. Architecture & Pipeline',
              bullets: [
                'Demuxers split audio, video, and subtitle elementary streams.',
                'DirectX Video Acceleration (DXVA2/D3D11VA) eliminates CPU decode stalls.',
              ],
            },
            {
              id: 's2',
              timestamp: 42.5,
              title: '2. Video Intelligence & RAG',
              bullets: [
                'Transcripts are chunked with timestamp overlap to preserve continuity.',
                'Users can query concepts and jump directly to the relevant timestamp.',
              ],
            },
          ],
          keyDefinitions: [
            { term: 'DXVA2', definition: 'DirectX Video Acceleration 2.0 API on Windows.', timestamp: 24.5 },
          ],
          createdAt: new Date().toISOString(),
        });
        setFlashcards([
          {
            id: 'f1',
            mediaId: 'm-1',
            question: 'What is the main advantage of GPU hardware-accelerated video decoding?',
            answer: 'It offloads bitstream parsing from CPU to GPU, preventing dropped frames and reducing power.',
            timestamp: 24.5,
            box: 1,
          },
          {
            id: 'f2',
            mediaId: 'm-1',
            question: 'How does NOVA Player ensure AI citations are accurate?',
            answer: 'Every citation is strictly validated against the retrieved transcript segment boundaries.',
            timestamp: 42.5,
            box: 1,
          },
        ]);
        setQuiz({
          id: 'q-default',
          mediaId: 'm-1',
          title: 'Multimedia Architecture Assessment',
          difficulty: 'medium',
          questions: [
            {
              id: 'q1',
              question: 'Which Windows API allows hardware-accelerated video decoding?',
              options: ['DirectX Video Acceleration (DXVA2)', 'OpenAL', 'GDI32', 'DirectDraw Emulation'],
              correctOptionIndex: 0,
              explanation: 'DXVA2 is the Windows standard for hardware-accelerated video decoding.',
              timestamp: 24.5,
            },
            {
              id: 'q2',
              question: 'What is the primary function of Video RAG in NOVA Player?',
              options: [
                'To automatically delete old videos',
                'To answer questions by retrieving grounded transcript excerpts with clickable timestamps',
                'To re-encode videos in lower resolution',
                'To change video aspect ratio',
              ],
              correctOptionIndex: 1,
              explanation: 'Video RAG retrieves timestamped transcript segments to answer questions with verifiable citations.',
              timestamp: 42.5,
            },
          ],
          createdAt: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [metadata]);

  // Quiz calculations
  const calculateScore = () => {
    if (!quiz) return { score: 0, total: 0, percent: 0 };
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctOptionIndex) {
        score++;
      }
    });
    return {
      score,
      total: quiz.questions.length,
      percent: Math.round((score / quiz.questions.length) * 100),
    };
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden bg-zinc-950">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">NOVA Learn Workspace</h1>
            <p className="text-xs text-zinc-400">
              Interactive pedagogical companion for courses, lectures, and revision
            </p>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setSubTab('notes')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors ${
              subTab === 'notes' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText size={14} />
            <span>AI Notes</span>
          </button>
          <button
            onClick={() => setSubTab('flashcards')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors ${
              subTab === 'flashcards' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>Flashcards</span>
          </button>
          <button
            onClick={() => setSubTab('quiz')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors ${
              subTab === 'quiz' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <HelpCircle size={14} />
            <span>Video Quiz</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-zinc-400 text-sm">
          <Sparkles size={28} className="text-cyan-400 animate-spin" />
          <span>Generating pedagogical workspace from video...</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Subtab 1: AI Notes */}
          {subTab === 'notes' && notes && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Executive Summary Card */}
              <div className="p-5 rounded-2xl glass-panel border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-zinc-900/50 to-indigo-950/20">
                <div className="text-[11px] uppercase font-bold text-cyan-400 tracking-wider mb-2">
                  Executive Brief
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed">{notes.executiveSummary}</p>
              </div>

              {/* Note Sections */}
              <div className="space-y-4">
                {notes.sections.map((sec) => (
                  <div key={sec.id} className="p-5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-white">{sec.title}</h2>
                      {sec.timestamp !== undefined && (
                        <button
                          onClick={() => onSeekTo(sec.timestamp!)}
                          className="flex items-center space-x-1 px-2 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 text-xs font-mono font-bold transition-colors"
                        >
                          <Clock size={11} />
                          <span>
                            {Math.floor(sec.timestamp / 60)}:
                            {Math.floor(sec.timestamp % 60)
                              .toString()
                              .padStart(2, '0')}
                          </span>
                        </button>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {sec.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start space-x-2.5 text-xs text-zinc-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                          <span className="leading-relaxed">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Key Definitions */}
              {notes.keyDefinitions.length > 0 && (
                <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/5 space-y-3">
                  <div className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
                    Key Definitions
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {notes.keyDefinitions.map((def, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs">
                        <div className="font-bold text-cyan-300">{def.term}</div>
                        <p className="text-zinc-400 mt-1 leading-relaxed">{def.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subtab 2: Flashcards */}
          {subTab === 'flashcards' && flashcards.length > 0 && (
            <div className="max-w-xl mx-auto flex flex-col items-center justify-center space-y-6 pt-6">
              <div className="text-xs text-zinc-400 font-semibold">
                Card {activeCardIndex + 1} of {flashcards.length}
              </div>

              {/* Flashcard Component */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-64 glass-panel border border-cyan-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xl relative transition-transform duration-300 hover:scale-[1.02]"
              >
                <div className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 absolute top-4 left-4">
                  {isFlipped ? 'Answer (Click to flip)' : 'Question (Click to flip)'}
                </div>

                <p className="text-base font-semibold text-zinc-100 leading-relaxed px-4">
                  {isFlipped
                    ? flashcards[activeCardIndex].answer
                    : flashcards[activeCardIndex].question}
                </p>

                {flashcards[activeCardIndex].timestamp !== undefined && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeekTo(flashcards[activeCardIndex].timestamp!);
                    }}
                    className="absolute bottom-4 right-4 flex items-center space-x-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-cyan-300 text-xs font-mono font-bold"
                  >
                    <Clock size={12} />
                    <span>Watch Clip</span>
                  </button>
                )}
              </div>

              {/* Action Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setActiveCardIndex((prev) => Math.max(0, prev - 1));
                  }}
                  disabled={activeCardIndex === 0}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-semibold text-zinc-300 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setActiveCardIndex((prev) => (prev + 1) % flashcards.length);
                  }}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-opacity"
                >
                  Next Card
                </button>
              </div>
            </div>
          )}

          {/* Subtab 3: Video Quiz */}
          {subTab === 'quiz' && quiz && (
            <div className="max-w-2xl mx-auto space-y-6 pb-12">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">{quiz.title}</h2>
                  <p className="text-xs text-zinc-400">5 Multiple-Choice Questions</p>
                </div>
                {quizSubmitted && (
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    <Award size={16} />
                    <span>
                      Score: {calculateScore().score}/{calculateScore().total} ({calculateScore().percent}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-5">
                {quiz.questions.map((q, qIdx) => {
                  const selected = userAnswers[qIdx];
                  const isCorrect = selected === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-zinc-200">
                          {qIdx + 1}. {q.question}
                        </span>
                        <button
                          onClick={() => onSeekTo(q.timestamp)}
                          className="flex items-center space-x-1 text-[11px] font-mono text-cyan-400 hover:underline shrink-0 ml-3"
                        >
                          <Clock size={11} />
                          <span>Review Clip</span>
                        </button>
                      </div>

                      {/* 4 Options */}
                      <div className="space-y-1.5 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selected === optIdx;
                          let btnStyle = 'bg-black/30 border-white/5 text-zinc-300 hover:bg-white/5';

                          if (quizSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              btnStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200';
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-red-500/20 border-red-500/50 text-red-200';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={quizSubmitted}
                              onClick={() => setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                              className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition-colors flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && optIdx === q.correctOptionIndex && (
                                <CheckCircle2 size={14} className="text-emerald-400" />
                              )}
                              {quizSubmitted && isOptionSelected && optIdx !== q.correctOptionIndex && (
                                <XCircle size={14} className="text-red-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation after submission */}
                      {quizSubmitted && (
                        <div className="p-3 rounded-lg bg-white/5 text-[11px] text-zinc-300 leading-relaxed border-l-2 border-cyan-400">
                          <span className="font-bold text-white block mb-0.5">Explanation:</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit or Reset button */}
              <div className="flex justify-end pt-2">
                {!quizSubmitted ? (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    disabled={Object.keys(userAnswers).length === 0}
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-xs text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 disabled:opacity-40 transition-opacity"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setUserAnswers({});
                    }}
                    className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
                  >
                    <RotateCcw size={14} />
                    <span>Retake Quiz</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
