import { create } from 'zustand';
import { SubtitleStyleOptions, HardwareAccelerationMode } from '@nova/shared-types';

export interface SettingsStoreState {
  theme: 'dark' | 'light' | 'system';
  aiServiceUrl: string;
  aiMode: 'local' | 'cloud' | 'disabled';
  hardwareAcceleration: HardwareAccelerationMode;
  seekStepSeconds: number; // default 5s
  volumeStepPercent: number; // default 5%
  enableHistory: boolean;
  autoResume: boolean;
  smartPause: boolean;
  subtitleStyles: SubtitleStyleOptions;

  // Actions
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setAiServiceUrl: (url: string) => void;
  setAiMode: (mode: 'local' | 'cloud' | 'disabled') => void;
  setHardwareAcceleration: (mode: HardwareAccelerationMode) => void;
  setSeekStepSeconds: (secs: number) => void;
  setEnableHistory: (enabled: boolean) => void;
  setAutoResume: (enabled: boolean) => void;
  setSmartPause: (enabled: boolean) => void;
  updateSubtitleStyles: (styles: Partial<SubtitleStyleOptions>) => void;
}

export const useSettingsStore = create<SettingsStoreState>((set) => ({
  theme: 'dark',
  aiServiceUrl: 'http://127.0.0.1:8000', // matches the user's running python uvicorn command
  aiMode: 'local',
  hardwareAcceleration: 'auto',
  seekStepSeconds: 5,
  volumeStepPercent: 5,
  enableHistory: true,
  autoResume: true,
  smartPause: false,
  subtitleStyles: {
    fontSize: 22,
    fontFamily: 'Plus Jakarta Sans',
    color: '#ffffff',
    outlineColor: '#000000',
    outlineWidth: 2,
    backgroundColor: '#000000',
    backgroundOpacity: 0.65,
    bold: true,
    italic: false,
    bottomOffsetPercent: 8,
  },

  setTheme: (theme) => set({ theme }),
  setAiServiceUrl: (aiServiceUrl) => set({ aiServiceUrl }),
  setAiMode: (aiMode) => set({ aiMode }),
  setHardwareAcceleration: (hardwareAcceleration) => set({ hardwareAcceleration }),
  setSeekStepSeconds: (seekStepSeconds) => set({ seekStepSeconds }),
  setEnableHistory: (enableHistory) => set({ enableHistory }),
  setAutoResume: (autoResume) => set({ autoResume }),
  setSmartPause: (smartPause) => set({ smartPause }),
  updateSubtitleStyles: (styles) =>
    set((s) => ({
      subtitleStyles: { ...s.subtitleStyles, ...styles },
    })),
}));
