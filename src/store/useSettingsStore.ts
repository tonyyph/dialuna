import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppTheme = 'light' | 'dark';
export type Units = 'us' | 'metric';

interface SettingsState {
  notifPeriod: boolean;
  notifOvulation: boolean;
  notifDaily: boolean;
  /** Days, clamped 10-16. Feeds the cycle engine's ovulation estimate. */
  lutealLength: number;
  units: Units;
  theme: AppTheme;
}

interface SettingsStore extends SettingsState {
  set: (patch: Partial<SettingsState>) => void;
  reset: () => void;
}

const DEFAULTS: SettingsState = {
  notifPeriod: true,
  notifOvulation: true,
  notifDaily: false,
  lutealLength: 14,
  units: 'us',
  theme: 'light',
};

const clampLuteal = (n: number) => Math.min(16, Math.max(10, Math.round(n)));

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      set: (patch) =>
        set(
          patch.lutealLength === undefined
            ? patch
            : { ...patch, lutealLength: clampLuteal(patch.lutealLength) }
        ),
      reset: () => set(DEFAULTS),
    }),
    {
      name: 'dialuna.settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
