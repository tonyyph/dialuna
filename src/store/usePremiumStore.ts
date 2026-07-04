import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { FREE_AI_QUESTIONS_PER_DAY, PremiumPlan } from '@/types';
import { todayISO } from '@/utils/date';

interface PremiumStore {
  isPremium: boolean;
  plan: PremiumPlan;
  aiQuestionsUsedToday: number;
  lastResetDate: string;
  canAskAi: () => boolean;
  consumeAiQuestion: () => void;
  remainingFreeQuestions: () => number;
  purchase: (plan: Exclude<PremiumPlan, null>) => void;
  restore: () => void;
  togglePremiumDev: () => void;
  reset: () => void;
}

export const usePremiumStore = create<PremiumStore>()(
  persist(
    (set, get) => {
      const usedToday = () => {
        const state = get();
        return state.lastResetDate === todayISO() ? state.aiQuestionsUsedToday : 0;
      };
      return {
        isPremium: false,
        plan: null,
        aiQuestionsUsedToday: 0,
        lastResetDate: todayISO(),
        canAskAi: () =>
          get().isPremium || usedToday() < FREE_AI_QUESTIONS_PER_DAY,
        remainingFreeQuestions: () =>
          Math.max(0, FREE_AI_QUESTIONS_PER_DAY - usedToday()),
        consumeAiQuestion: () => {
          if (get().isPremium) return;
          set({ aiQuestionsUsedToday: usedToday() + 1, lastResetDate: todayISO() });
        },
        purchase: (plan) => set({ isPremium: true, plan }),
        restore: () => {
          // Mock: nothing to restore without a real store backend.
        },
        togglePremiumDev: () =>
          set((state) => ({
            isPremium: !state.isPremium,
            plan: state.isPremium ? null : 'yearly',
          })),
        reset: () =>
          set({
            isPremium: false,
            plan: null,
            aiQuestionsUsedToday: 0,
            lastResetDate: todayISO(),
          }),
      };
    },
    {
      name: 'dialuna.premium',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
