import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Minus,
  Square,
  X,
  Radio,
  FolderOpen,
  Link,
  ShieldCheck,
} from 'lucide-react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { aiClient } from '../../services/aiClient';

export interface HeaderProps {
  onOpenFile: () => void;
  onOpenUrl: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFile, onOpenUrl }) => {
  const { aiMode } = useSettingsStore();
  const { isAlwaysOnTop, toggleAlwaysOnTop } = usePlayerStore();
  const [aiStatus, setAiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const res = await aiClient.checkHealth();
      if (mounted) {
        setAiStatus(res.status === 'healthy' ? 'online' : 'offline');
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="h-11 bg-zinc-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-3 select-none z-50">
      {/* Brand & App Info */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white text-xs font-black tracking-wider">N</span>
          </div>
          <span className="font-bold tracking-wider text-sm bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            NOVA PLAYER
          </span>
        </div>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* Quick Open Actions */}
        <button
          onClick={onOpenFile}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Open Media File"
        >
          <FolderOpen size={14} className="text-cyan-400" />
          <span>Open File</span>
        </button>

        <button
          onClick={onOpenUrl}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Open Stream URL"
        >
          <Link size={14} className="text-indigo-400" />
          <span>Open URL</span>
        </button>
      </div>

      {/* Middle Tagline / Status */}
      <div className="hidden md:flex items-center space-x-3">
        <span className="text-xs text-zinc-500 font-medium tracking-wide">
          Play Anything. Understand Everything.
        </span>

        {/* Local AI status badge */}
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10">
          <Sparkles size={12} className={aiStatus === 'online' ? 'text-cyan-400 animate-pulse' : 'text-zinc-500'} />
          <span className="text-zinc-300">NOVA AI:</span>
          <span
            className={
              aiStatus === 'online'
                ? 'text-emerald-400'
                : aiStatus === 'checking'
                ? 'text-amber-400'
                : 'text-zinc-500'
            }
          >
            {aiStatus === 'online' ? 'Active' : aiStatus === 'checking' ? 'Connecting...' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Window Chrome & System Controls */}
      <div className="flex items-center space-x-1">
        <button
          onClick={toggleAlwaysOnTop}
          className={`p-1.5 rounded text-xs transition-colors ${
            isAlwaysOnTop ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle Always on Top"
        >
          <ShieldCheck size={14} />
        </button>

        <button
          className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Minimize"
        >
          <Minus size={14} />
        </button>
        <button
          className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Maximize"
        >
          <Square size={12} />
        </button>
        <button
          className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-red-500/80 transition-colors"
          title="Close"
        >
          <X size={14} />
        </button>
      </div>
    </header>
  );
};
