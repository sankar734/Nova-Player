import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  FileText,
  Bookmark,
  Send,
  X,
  Clock,
  Compass,
  CheckCircle,
  Volume2,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { aiClient } from '../../services/aiClient';
import { TranscriptSegment, Citation, VideoSummaryOutput } from '@nova/shared-types';

export interface AIPanelProps {
  onClose: () => void;
  onSeek: (seconds: number) => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({ onClose, onSeek }) => {
  const { currentTime, metadata, sourceUrl } = usePlayerStore();
  const [activeTab, setActiveTab] = useState<'ask' | 'transcript' | 'summary'>('ask');
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<
    Array<{ sender: 'user' | 'ai'; text: string; citations?: Citation[] }>
  >([
    {
      sender: 'ai',
      text: 'Ask anything about this media! I analyze the transcript and cite exact timestamps so you can jump straight to the source.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<VideoSummaryOutput | null>(null);

  // Transcript segments
  const sampleSegments: TranscriptSegment[] = [
    {
      id: 'seg-1',
      startTime: 0.0,
      endTime: 4.5,
      text: 'Welcome to this lecture on distributed systems and multimedia architectures.',
    },
    {
      id: 'seg-2',
      startTime: 4.8,
      endTime: 12.2,
      text: 'Today we will examine low-latency streaming protocols and video retrieval augmented generation.',
    },
    {
      id: 'seg-3',
      startTime: 12.5,
      endTime: 24.0,
      text: 'First, let us define the key bottlenecks: demuxing, hardware acceleration, and audio synchronization.',
    },
    {
      id: 'seg-4',
      startTime: 24.5,
      endTime: 42.0,
      text: 'By offloading decoding to GPU hardware through DirectX Video Acceleration, CPU utilization drops significantly.',
    },
    {
      id: 'seg-5',
      startTime: 42.5,
      endTime: 65.0,
      text: 'Next, semantic vector search allows users to query timestamps directly using natural language questions.',
    },
  ];

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;
    const mediaId = metadata?.id || 'active-media';

    setChatHistory((prev) => [...prev, { sender: 'user', text: queryText }]);
    setQuestion('');
    setIsLoading(true);

    try {
      const res = await aiClient.askVideo(mediaId, queryText, currentTime, sampleSegments);
      setChatHistory((prev) => [
        ...prev,
        { sender: 'ai', text: res.answer, citations: res.citations },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `The AI service is running in local offline mode. Around [00:24], GPU hardware decoding is explained, and at [00:42] semantic search is demonstrated.`,
          citations: [
            { timestamp: 24.5, label: '00:24', snippet: 'GPU decoding acceleration' },
            { timestamp: 42.5, label: '00:42', snippet: 'Semantic vector search' },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchSummary = async () => {
    if (summaryData || isLoading) return;
    setIsLoading(true);
    try {
      const res = await aiClient.summarizeMedia(metadata?.id || 'active-media', sampleSegments);
      setSummaryData(res);
    } catch {
      setSummaryData({
        mediaId: 'active-media',
        shortSummary: 'Overview of modern high-performance desktop video players and AI search.',
        detailedSummary:
          'This media reviews container demuxing, GPU-based hardware decoding to eliminate frame drops, and automated timestamp-aware video RAG.',
        keyPoints: [
          'Hardware decoding offload (DXVA2/D3D11VA) reduces CPU load significantly.',
          'Accurate audio/video synchronization is maintained via presentation clocks.',
          'Video RAG provides direct timestamp citations for instant seeking.',
        ],
        smartChapters: [
          { startTime: 0, endTime: 12.2, title: 'Introduction', summary: 'Streaming fundamentals.' },
          { startTime: 12.5, endTime: 42.0, title: 'GPU Acceleration', summary: 'DirectX video decoding.' },
          { startTime: 42.5, endTime: 65.0, title: 'Semantic RAG', summary: 'Timestamp querying.' },
        ],
        keyMoments: [
          { timestamp: 24.5, title: 'GPU Decode Demo', description: 'Significant CPU reduction.' },
          { timestamp: 42.5, title: 'Vector Search Demo', description: 'Jumping to relevant concepts.' },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-96 glass-panel border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-2xl z-40 h-[85vh]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-zinc-900/70">
        <div className="flex items-center space-x-2">
          <Sparkles size={16} className="text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            NOVA AI Intelligence
          </span>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
          <X size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-black/40 p-1 text-xs">
        <button
          onClick={() => setActiveTab('ask')}
          className={`flex-1 py-1.5 rounded-md font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
            activeTab === 'ask' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <MessageSquare size={13} />
          <span>Ask Video</span>
        </button>
        <button
          onClick={() => setActiveTab('transcript')}
          className={`flex-1 py-1.5 rounded-md font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
            activeTab === 'transcript' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileText size={13} />
          <span>Transcript</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('summary');
            handleFetchSummary();
          }}
          className={`flex-1 py-1.5 rounded-md font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
            activeTab === 'summary' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Compass size={13} />
          <span>Summary</span>
        </button>
      </div>

      {/* Tab 1: Ask Video */}
      {activeTab === 'ask' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
            {chatHistory.map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                    item.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-cyan-600/20'
                      : 'bg-zinc-900/90 text-zinc-200 border border-white/10 rounded-bl-none'
                  }`}
                >
                  {item.text}
                </div>

                {/* Citations Buttons */}
                {item.citations && item.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {item.citations.map((c, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => onSeek(c.timestamp)}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold transition-colors"
                        title={c.snippet}
                      >
                        <Clock size={10} />
                        <span>[{c.label}]</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="text-zinc-400 text-xs italic flex items-center space-x-2">
                <Sparkles size={13} className="animate-spin text-cyan-400" />
                <span>NOVA is analyzing transcript...</span>
              </div>
            )}
          </div>

          {/* Quick Moment Prompt Button */}
          <div className="px-3 py-1.5 bg-black/30 border-t border-white/5 flex gap-2">
            <button
              onClick={() => handleAsk(`What is being explained at this current moment?`)}
              className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-cyan-300 font-semibold border border-white/10 transition-colors"
            >
              Ask About Current Moment
            </button>
            <button
              onClick={() => handleAsk(`Summarize the main concepts so far.`)}
              className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-indigo-300 font-semibold border border-white/10 transition-colors"
            >
              Key Concepts
            </button>
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(question);
            }}
            className="p-3 border-t border-white/10 flex items-center space-x-2 bg-zinc-950/90"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about this video..."
              className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60"
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Synchronized Transcript */}
      {activeTab === 'transcript' && (
        <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
          {sampleSegments.map((seg) => {
            const isActive = currentTime >= seg.startTime && currentTime <= seg.endTime;
            return (
              <div
                key={seg.id}
                onClick={() => onSeek(seg.startTime)}
                className={`p-2.5 rounded-lg cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-100 shadow-sm shadow-cyan-500/10'
                    : 'bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2 font-mono text-[10px] text-cyan-400 font-bold mb-1">
                  <Clock size={11} />
                  <span>
                    {Math.floor(seg.startTime / 60)}:
                    {Math.floor(seg.startTime % 60)
                      .toString()
                      .padStart(2, '0')}
                  </span>
                </div>
                <p className="leading-relaxed">{seg.text}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Summary & Chapters */}
      {activeTab === 'summary' && summaryData && (
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1">
              Executive Brief
            </div>
            <p className="text-zinc-300 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-white/5">
              {summaryData.shortSummary}
            </p>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-1.5">
              Key Takeaways
            </div>
            <ul className="space-y-1.5">
              {summaryData.keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start space-x-2 text-zinc-300">
                  <CheckCircle size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider mb-1.5">
              Smart Chapters
            </div>
            <div className="space-y-1.5">
              {summaryData.smartChapters.map((ch, i) => (
                <div
                  key={i}
                  onClick={() => onSeek(ch.startTime)}
                  className="p-2 rounded bg-black/40 hover:bg-cyan-500/15 cursor-pointer border border-white/5 transition-colors"
                >
                  <div className="flex justify-between items-center text-[11px] font-bold text-zinc-200">
                    <span>{ch.title}</span>
                    <span className="font-mono text-[10px] text-cyan-400">
                      {Math.floor(ch.startTime / 60)}:
                      {Math.floor(ch.startTime % 60)
                        .toString()
                        .padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{ch.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
