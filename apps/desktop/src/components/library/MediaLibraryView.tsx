import React, { useState } from 'react';
import {
  Film,
  Music,
  Heart,
  Clock,
  Search,
  LayoutGrid,
  List as ListIcon,
  Play,
  FolderPlus,
  SlidersHorizontal,
  Folder,
} from 'lucide-react';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { MediaItemRecord } from '@nova/shared-types';
import { formatDuration } from '../player/Timeline';

export interface MediaLibraryViewProps {
  onPlayMedia: (item: MediaItemRecord) => void;
  onOpenFolderPicker: () => void;
}

export const MediaLibraryView: React.FC<MediaLibraryViewProps> = ({
  onPlayMedia,
  onOpenFolderPicker,
}) => {
  const {
    items,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    toggleFavorite,
    positions,
  } = useLibraryStore();
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  const categories = [
    { id: 'all', label: 'All Media', icon: Film },
    { id: 'videos', label: 'Videos', icon: Film },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'recent', label: 'Recent', icon: Clock },
  ];

  // Filtering
  const filteredItems = items.filter((item) => {
    if (activeCategory === 'videos' && item.mediaType !== 'video') return false;
    if (activeCategory === 'music' && item.mediaType !== 'audio') return false;
    if (activeCategory === 'favorites' && !item.favorite) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.filename.toLowerCase().includes(q) ||
        item.container.toLowerCase().includes(q) ||
        (item.videoCodec && item.videoCodec.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden bg-zinc-950">
      {/* Top Header & Search */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 gap-4">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Search & Layout Controls */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="relative">
            <Search size={14} className="text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library..."
              className="bg-black/50 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 w-52"
            />
          </div>

          <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded ${layoutMode === 'grid' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setLayoutMode('list')}
              className={`p-1.5 rounded ${layoutMode === 'list' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-white'}`}
              title="List View"
            >
              <ListIcon size={14} />
            </button>
          </div>

          <button
            onClick={onOpenFolderPicker}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:opacity-90 transition-opacity"
          >
            <FolderPlus size={14} />
            <span>Add Folder</span>
          </button>
        </div>
      </div>

      {/* Main Items Display */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3 text-zinc-500 text-xs">
            <Film size={36} className="text-zinc-700" />
            <span>No media found matching current filter</span>
          </div>
        ) : layoutMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const pos = positions[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => onPlayMedia(item)}
                  className="group rounded-xl glass-panel border border-white/10 overflow-hidden cursor-pointer hover:border-cyan-500/40 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-cyan-500/5 relative"
                >
                  {/* Poster / Thumbnail Placeholder */}
                  <div className="h-40 bg-gradient-to-tr from-zinc-900 via-slate-900 to-zinc-950 flex items-center justify-center relative overflow-hidden">
                    <Film size={32} className="text-zinc-700 group-hover:scale-110 transition-transform duration-300" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/90 text-white flex items-center justify-center shadow-lg shadow-cyan-500/50">
                        <Play size={20} className="ml-1" />
                      </div>
                    </div>

                    {/* Top Quality Badge */}
                    {item.qualityLabel && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-cyan-300 border border-cyan-500/30">
                        {item.qualityLabel}
                      </span>
                    )}

                    {/* HDR Badge */}
                    {item.hdr && (
                      <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        HDR
                      </span>
                    )}

                    {/* Duration Badge */}
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-black/80 text-zinc-300">
                      {formatDuration(item.duration)}
                    </span>

                    {/* Progress Bar (Resume Position) */}
                    {pos && pos.percentage > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div
                          className="h-full bg-cyan-400"
                          style={{ width: `${pos.percentage}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Metadata Info Box */}
                  <div className="p-3.5 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <h3
                        className="text-xs font-bold text-white truncate max-w-[200px]"
                        title={item.filename}
                      >
                        {item.filename}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className="text-zinc-500 hover:text-red-400 p-0.5"
                      >
                        <Heart
                          size={14}
                          className={item.favorite ? 'text-red-400 fill-red-400' : ''}
                        />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] text-zinc-400 font-mono">
                      <span>{item.container}</span>
                      <span>•</span>
                      <span>{item.videoCodec || item.audioCodec}</span>
                      {pos && (
                        <>
                          <span>•</span>
                          <span className="text-cyan-400 font-semibold">
                            Resume {formatDuration(pos.position)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onPlayMedia(item)}
                className="p-3 rounded-xl glass-panel border border-white/5 flex items-center justify-between cursor-pointer hover:border-cyan-500/30 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-cyan-400">
                    <Play size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{item.filename}</h3>
                    <div className="flex items-center space-x-2 text-[10px] text-zinc-400 font-mono mt-0.5">
                      <span>{item.qualityLabel || item.container}</span>
                      <span>•</span>
                      <span>{item.videoCodec}</span>
                      <span>•</span>
                      <span>{formatDuration(item.duration)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    className="text-zinc-500 hover:text-red-400"
                  >
                    <Heart
                      size={16}
                      className={item.favorite ? 'text-red-400 fill-red-400' : ''}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
