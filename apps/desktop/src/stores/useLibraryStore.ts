import { create } from 'zustand';
import {
  MediaItemRecord,
  PlaylistRecord,
  BookmarkRecord,
  PlaybackPositionRecord,
} from '@nova/shared-types';

export interface LibraryStoreState {
  items: MediaItemRecord[];
  folders: string[];
  playlists: PlaylistRecord[];
  bookmarks: BookmarkRecord[];
  positions: Record<string, PlaybackPositionRecord>; // mediaId -> position
  activeCategory: string;
  searchQuery: string;
  sortBy: 'name' | 'dateAdded' | 'duration' | 'size';
  sortOrder: 'asc' | 'desc';

  // Actions
  addItem: (item: MediaItemRecord) => void;
  addItems: (items: MediaItemRecord[]) => void;
  removeFolder: (folder: string) => void;
  addFolder: (folder: string) => void;
  toggleFavorite: (id: string) => void;
  savePosition: (mediaId: string, position: number, duration: number) => void;
  getPosition: (mediaId: string) => PlaybackPositionRecord | undefined;
  addBookmark: (mediaId: string, timestamp: number, title: string, note?: string) => void;
  deleteBookmark: (id: string) => void;
  setActiveCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setSort: (by: 'name' | 'dateAdded' | 'duration' | 'size', order: 'asc' | 'desc') => void;
}

export const useLibraryStore = create<LibraryStoreState>((set, get) => ({
  items: [
    {
      id: 'fixture-sample-1',
      path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      filename: 'BigBuckBunny_1080p.mp4',
      mediaType: 'video',
      container: 'MP4',
      duration: 596,
      size: 158008374,
      width: 1920,
      height: 1080,
      qualityLabel: '1080p Full HD',
      fps: 30,
      videoCodec: 'H264',
      videoBitrate: 2100000,
      audioCodec: 'AAC',
      audioChannels: 6,
      hdr: false,
      dateAdded: new Date().toISOString(),
      playCount: 1,
      favorite: true,
    },
    {
      id: 'fixture-sample-2',
      path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      filename: 'ElephantsDream_720p.mp4',
      mediaType: 'video',
      container: 'MP4',
      duration: 653,
      size: 92451000,
      width: 1280,
      height: 720,
      qualityLabel: '720p HD',
      fps: 24,
      videoCodec: 'H264',
      videoBitrate: 1100000,
      audioCodec: 'AAC',
      audioChannels: 2,
      hdr: false,
      dateAdded: new Date(Date.now() - 86400000).toISOString(),
      playCount: 0,
      favorite: false,
    },
    {
      id: 'fixture-sample-3',
      path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      filename: 'TearsOfSteel_4K.mp4',
      mediaType: 'video',
      container: 'MP4',
      duration: 734,
      size: 384000000,
      width: 3840,
      height: 2160,
      qualityLabel: '2160p 4K UHD',
      fps: 60,
      videoCodec: 'HEVC',
      videoBitrate: 18400000,
      audioCodec: 'AC3',
      audioChannels: 6,
      hdr: true,
      dateAdded: new Date(Date.now() - 172800000).toISOString(),
      playCount: 3,
      favorite: true,
    }
  ],
  folders: ['C:\\Users\\USER\\Videos'],
  playlists: [
    {
      id: 'pl-favorites',
      name: 'Best 4K HDR Demos',
      itemCount: 3,
      totalDuration: 1983,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  bookmarks: [
    {
      id: 'bm-1',
      mediaId: 'fixture-sample-1',
      timestamp: 45.2,
      title: 'Bunny emerges from tree trunk',
      note: 'Notice the fur detail and contrast levels',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bm-2',
      mediaId: 'fixture-sample-3',
      timestamp: 124.0,
      title: 'VFX Bridge Scene',
      note: 'Good high-bitrate benchmark',
      createdAt: new Date().toISOString(),
    }
  ],
  positions: {
    'fixture-sample-1': {
      mediaId: 'fixture-sample-1',
      position: 142.5,
      duration: 596,
      percentage: 23.9,
      updatedAt: new Date().toISOString(),
      completed: false,
    }
  },
  activeCategory: 'all',
  searchQuery: '',
  sortBy: 'dateAdded',
  sortOrder: 'desc',

  addItem: (item) =>
    set((s) => ({
      items: s.items.some((i) => i.id === item.id) ? s.items : [item, ...s.items],
    })),
  addItems: (newItems) =>
    set((s) => {
      const existingIds = new Set(s.items.map((i) => i.id));
      const filtered = newItems.filter((i) => !existingIds.has(i.id));
      return { items: [...filtered, ...s.items] };
    }),
  addFolder: (folder) =>
    set((s) => ({
      folders: s.folders.includes(folder) ? s.folders : [...s.folders, folder],
    })),
  removeFolder: (folder) =>
    set((s) => ({
      folders: s.folders.filter((f) => f !== folder),
    })),
  toggleFavorite: (id) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, favorite: !i.favorite } : i)),
    })),
  savePosition: (mediaId, position, duration) =>
    set((s) => {
      const percentage = duration > 0 ? (position / duration) * 100 : 0;
      return {
        positions: {
          ...s.positions,
          [mediaId]: {
            mediaId,
            position,
            duration,
            percentage,
            updatedAt: new Date().toISOString(),
            completed: percentage >= 92,
          },
        },
      };
    }),
  getPosition: (mediaId) => get().positions[mediaId],
  addBookmark: (mediaId, timestamp, title, note) =>
    set((s) => ({
      bookmarks: [
        {
          id: `bm-${Date.now()}`,
          mediaId,
          timestamp,
          title,
          note,
          createdAt: new Date().toISOString(),
        },
        ...s.bookmarks,
      ],
    })),
  deleteBookmark: (id) =>
    set((s) => ({
      bookmarks: s.bookmarks.filter((b) => b.id !== id),
    })),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
}));
