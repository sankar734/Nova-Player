import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, MainNavRoute } from './components/layout/Sidebar';
import { CinematicPlayer } from './components/player/CinematicPlayer';
import { MediaLibraryView } from './components/library/MediaLibraryView';
import { LearningWorkspace } from './components/learning/LearningWorkspace';
import { usePlayerStore } from './stores/usePlayerStore';
import { useLibraryStore } from './stores/useLibraryStore';
import { useSettingsStore } from './stores/useSettingsStore';
import { MediaItemRecord } from '@nova/shared-types';
import {
  Play,
  Film,
  Sparkles,
  GraduationCap,
  Clock,
  Heart,
  FolderOpen,
  Link as LinkIcon,
  Check,
  Cpu,
  Shield,
  Layers,
} from 'lucide-react';
import { formatDuration } from './components/player/Timeline';

export const App: React.FC = () => {
  const [route, setRoute] = useState<MainNavRoute>('home');
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [streamUrlInput, setStreamUrlInput] = useState('');

  const {
    sourceUrl,
    loadMedia,
    currentTime,
    setActiveSidePanel,
    setTime,
  } = usePlayerStore();

  const { items, positions, addItem } = useLibraryStore();
  const {
    aiServiceUrl,
    setAiServiceUrl,
    aiMode,
    setAiMode,
    hardwareAcceleration,
    setHardwareAcceleration,
  } = useSettingsStore();

  const handleOpenFile = () => {
    // Standard input file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*,audio/*,.mkv,.mp4,.webm,.avi,.mov,.flv,.ts,.mp3,.flac,.wav';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const objectUrl = URL.createObjectURL(file);
        const newItem: MediaItemRecord = {
          id: `local-${Date.now()}`,
          path: objectUrl,
          filename: file.name,
          mediaType: file.type.startsWith('audio') ? 'audio' : 'video',
          container: file.name.split('.').pop()?.toUpperCase() || 'MP4',
          duration: 0,
          size: file.size,
          hdr: false,
          dateAdded: new Date().toISOString(),
          playCount: 1,
          favorite: false,
        };
        addItem(newItem);
        loadMedia(objectUrl, {
          id: newItem.id,
          path: file.name,
          filename: file.name,
          fileSize: file.size,
          container: newItem.container,
          duration: 0,
          bitrate: 0,
          hasVideo: true,
          hasAudio: true,
          audioStreams: [],
          activeAudioIndex: 0,
          subtitleStreams: [],
          activeSubtitleIndex: -1,
          chapters: [],
        });
        setRoute('player');
      }
    };
    input.click();
  };

  const handleOpenStreamUrl = (url: string) => {
    if (!url.trim()) return;
    const filename = url.split('/').pop()?.split('?')[0] || 'Network Stream';
    const newItem: MediaItemRecord = {
      id: `stream-${Date.now()}`,
      path: url,
      filename,
      mediaType: 'video',
      container: url.endsWith('.m3u8') ? 'HLS' : 'MP4',
      duration: 0,
      size: 0,
      hdr: false,
      dateAdded: new Date().toISOString(),
      playCount: 1,
      favorite: false,
    };
    addItem(newItem);
    loadMedia(url, {
      id: newItem.id,
      path: url,
      filename,
      fileSize: 0,
      container: newItem.container,
      duration: 0,
      bitrate: 0,
      hasVideo: true,
      hasAudio: true,
      audioStreams: [],
      activeAudioIndex: 0,
      subtitleStreams: [],
      activeSubtitleIndex: -1,
      chapters: [],
    });
    setIsUrlModalOpen(false);
    setStreamUrlInput('');
    setRoute('player');
  };

  const handlePlayLibraryItem = (item: MediaItemRecord) => {
    loadMedia(item.path, {
      id: item.id,
      path: item.path,
      filename: item.filename,
      fileSize: item.size,
      container: item.container,
      duration: item.duration,
      bitrate: item.videoBitrate || 2000000,
      qualityLabel: item.qualityLabel,
      hasVideo: item.mediaType === 'video',
      videoStream:
        item.mediaType === 'video'
          ? {
              index: 0,
              codec: item.videoCodec || 'H264',
              width: item.width || 1920,
              height: item.height || 1080,
              fps: item.fps || 30,
              bitrate: item.videoBitrate,
              isHdr: item.hdr,
              hdrFormat: item.hdr ? 'HDR10' : undefined,
            }
          : undefined,
      hasAudio: true,
      audioStreams: [
        {
          index: 1,
          codec: item.audioCodec || 'AAC',
          channels: item.audioChannels || 2,
          sampleRate: 48000,
          isDefault: true,
        },
      ],
      activeAudioIndex: 0,
      subtitleStreams: [],
      activeSubtitleIndex: -1,
      chapters: [],
    });
    setRoute('player');
  };

  // Drag and drop handling on window
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const objectUrl = URL.createObjectURL(file);
      loadMedia(objectUrl);
      setRoute('player');
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="h-screen w-screen flex flex-col bg-zinc-950 text-white overflow-hidden select-none font-sans"
    >
      {/* Top Header */}
      <Header
        onOpenFile={handleOpenFile}
        onOpenUrl={() => setIsUrlModalOpen(true)}
      />

      {/* Main Workspace (Sidebar + Dynamic View) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentRoute={route}
          onRouteChange={(newRoute) => {
            if (newRoute === 'ai') {
              setActiveSidePanel('ai');
              setRoute('player');
            } else {
              setRoute(newRoute);
            }
          }}
          hasActiveMedia={Boolean(sourceUrl)}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 flex flex-col overflow-hidden bg-black relative">
          {/* View 1: Home Dashboard */}
          {route === 'home' && (
            <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-zinc-950">
              {/* Hero Banner */}
              <div className="p-8 rounded-3xl glass-panel border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-purple-950/40 shadow-2xl relative overflow-hidden">
                <div className="max-w-xl space-y-3 z-10 relative">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    <Sparkles size={13} />
                    <span>AI-Powered Multimedia Intelligence</span>
                  </div>
                  <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
                    Play Anything. <br />
                    <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                      Understand Everything.
                    </span>
                  </h1>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Universal playback engine supporting high-efficiency video decoding, verifiable Video RAG
                    with interactive timestamp citations, and an automated lecture learning mode.
                  </p>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={handleOpenFile}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-xs text-white shadow-lg shadow-cyan-500/30 hover:opacity-90 transition-opacity flex items-center space-x-2"
                    >
                      <FolderOpen size={15} />
                      <span>Open Media File</span>
                    </button>
                    <button
                      onClick={() => setRoute('learning')}
                      className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 font-semibold text-xs transition-colors flex items-center space-x-2 border border-white/10"
                    >
                      <GraduationCap size={15} className="text-cyan-400" />
                      <span>Explore Learn Mode</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Continue Watching Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm font-bold text-white uppercase tracking-wider">
                    <Clock size={16} className="text-cyan-400" />
                    <span>Continue Watching</span>
                  </div>
                  <button
                    onClick={() => setRoute('library')}
                    className="text-xs text-zinc-400 hover:text-cyan-300 font-semibold transition-colors"
                  >
                    View All Library ({items.length})
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {items.slice(0, 3).map((item) => {
                    const pos = positions[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => handlePlayLibraryItem(item)}
                        className="group p-3 rounded-2xl glass-panel border border-white/10 hover:border-cyan-500/40 cursor-pointer transition-all hover:scale-[1.01]"
                      >
                        <div className="h-32 rounded-xl bg-gradient-to-tr from-zinc-900 to-black flex items-center justify-center relative overflow-hidden mb-3">
                          <Film size={28} className="text-zinc-700 group-hover:scale-110 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/40">
                              <Play size={16} className="ml-0.5" />
                            </div>
                          </div>
                          {item.qualityLabel && (
                            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 text-cyan-300 border border-cyan-500/30">
                              {item.qualityLabel}
                            </span>
                          )}
                          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/80 text-zinc-300">
                            {formatDuration(item.duration)}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h2 className="text-xs font-bold text-white truncate" title={item.filename}>
                            {item.filename}
                          </h2>
                          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                            <span>{item.container} • {item.videoCodec}</span>
                            {pos && (
                              <span className="text-cyan-400 font-semibold">
                                {Math.round(pos.percentage)}% watched
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* View 2: Cinematic Video Player */}
          {route === 'player' && <CinematicPlayer />}

          {/* View 3: Media Library View */}
          {route === 'library' && (
            <MediaLibraryView
              onPlayMedia={handlePlayLibraryItem}
              onOpenFolderPicker={handleOpenFile}
            />
          )}

          {/* View 4: Lecture Learning Workspace */}
          {route === 'learning' && (
            <LearningWorkspace
              onSeekTo={(seconds) => {
                setTime(seconds);
                setRoute('player');
              }}
            />
          )}

          {/* View 5: Settings */}
          {route === 'settings' && (
            <div className="flex-1 p-8 overflow-y-auto max-w-2xl space-y-6 bg-zinc-950">
              <h1 className="text-lg font-bold text-white">Application Settings</h1>

              <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-white block">Python AI Service Endpoint</label>
                  <p className="text-zinc-400 text-[11px]">
                    Local FastAPI sidecar daemon URL (defaults to your running port 8000)
                  </p>
                  <input
                    type="text"
                    value={aiServiceUrl}
                    onChange={(e) => setAiServiceUrl(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1 pt-2">
                  <label className="font-bold text-white block">AI Provider Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['local', 'cloud', 'disabled'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setAiMode(mode)}
                        className={`p-2.5 rounded-lg border text-xs font-bold uppercase transition-colors ${
                          aiMode === mode
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-black/40 border-white/10 text-zinc-400'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="font-bold text-white block">Hardware Accelerated Decoding</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['auto', 'on', 'off'] as const).map((hw) => (
                      <button
                        key={hw}
                        onClick={() => setHardwareAcceleration(hw)}
                        className={`p-2.5 rounded-lg border text-xs font-bold uppercase transition-colors ${
                          hardwareAcceleration === hw
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            : 'bg-black/40 border-white/10 text-zinc-400'
                        }`}
                      >
                        {hw}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* URL Stream Dialog Modal */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-[450px] glass-panel border border-white/10 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-sm font-bold text-white">
              <LinkIcon size={16} className="text-indigo-400" />
              <span>Open Network Media Stream</span>
            </div>
            <p className="text-xs text-zinc-400">
              Paste a progressive HTTP/HTTPS media link or HLS (.m3u8) live stream.
            </p>
            <input
              type="text"
              value={streamUrlInput}
              onChange={(e) => setStreamUrlInput(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsUrlModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleOpenStreamUrl(streamUrlInput)}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-bold text-white shadow-md shadow-cyan-500/20"
              >
                Start Playback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
