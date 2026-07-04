import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DailyLog } from '@/types';

interface LogStore {
  logs: Record<string, DailyLog>;
  saveLog: (log: DailyLog) => void;
  getLog: (date: string) => DailyLog | undefined;
  reset: () => void;
}

export const useLogStore = create<LogStore>()(
  persist(
    (set, get) => ({
      logs: {},
      saveLog: (log) =>
        set((state) => ({ logs: { ...state.logs, [log.date]: log } })),
      getLog: (date) => get().logs[date],
      reset: () => set({ logs: {} }),
    }),
    {
      name: 'dialuna.logs',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
