import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { AccentKey } from '@/theme/accents';

interface ThemeState {
  mode: 'dark' | 'light';
  accent: AccentKey;
  reduceMotion: boolean;
  setMode: (mode: 'dark' | 'light') => void;
  setAccent: (accent: AccentKey) => void;
  setReduceMotion: (value: boolean) => void;
  reset: () => void;
}

const initialState = {
  mode: 'dark' as const,
  accent: 'lavender' as AccentKey,
  reduceMotion: false,
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ...initialState,
      setMode: (mode) => set({ mode }),
      setAccent: (accent) => set({ accent }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      reset: () => set(initialState),
    }),
    {
      name: 'theme-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
