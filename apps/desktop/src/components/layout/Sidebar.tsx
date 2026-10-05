import React from 'react';
import {
  Home,
  Play,
  Film,
  Music,
  GraduationCap,
  Sparkles,
  SlidersHorizontal,
  History,
  FolderSync,
  Wrench,
  Settings,
} from 'lucide-react';

export type MainNavRoute =
  | 'home'
  | 'player'
  | 'library'
  | 'music'
  | 'learning'
  | 'ai'
  | 'history'
  | 'tools'
  | 'settings';

export interface SidebarProps {
  currentRoute: MainNavRoute;
  onRouteChange: (route: MainNavRoute) => void;
  hasActiveMedia: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onRouteChange, hasActiveMedia }) => {
  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'player' as const, label: 'Now Playing', icon: Play, badge: hasActiveMedia ? 'Active' : undefined },
    { id: 'library' as const, label: 'Media Library', icon: Film },
    { id: 'music' as const, label: 'Music Mode', icon: Music },
    { id: 'learning' as const, label: 'NOVA Learn', icon: GraduationCap, highlight: true },
    { id: 'ai' as const, label: 'Ask Video', icon: Sparkles, highlight: true },
    { id: 'tools' as const, label: 'Media Tools', icon: Wrench },
    { id: 'history' as const, label: 'History', icon: History },
  ];

  return (
    <aside className="w-56 bg-zinc-950/90 border-r border-white/10 flex flex-col justify-between py-3 select-none z-40">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div className="px-3">
          <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 px-3 mb-2">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onRouteChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      size={16}
                      className={
                        isActive
                          ? 'text-cyan-400'
                          : item.highlight
                          ? 'text-indigo-400'
                          : 'text-zinc-400'
                      }
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Settings */}
      <div className="px-3 pt-2 border-t border-white/5">
        <button
          onClick={() => onRouteChange('settings')}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
            currentRoute === 'settings'
              ? 'bg-white/10 text-white border border-white/15'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Settings size={16} className="text-zinc-400" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
