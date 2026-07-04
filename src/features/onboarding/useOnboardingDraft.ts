import { create } from 'zustand';

import { AgeRange, Goal } from '@/types';

/** In-memory draft of the profile being built during onboarding (not persisted). */
interface OnboardingDraft {
  nickname: string;
  ageRange: AgeRange;
  averageCycleLength: number;
  averagePeriodLength: number;
  lastPeriodStartDate: string | null;
  lastPeriodDuration: number;
  goals: Goal[];
  set: (patch: Partial<Omit<OnboardingDraft, 'set' | 'toggleGoal' | 'reset'>>) => void;
  toggleGoal: (goal: Goal) => void;
  reset: () => void;
}

const initial = {
  nickname: '',
  ageRange: '25-30' as AgeRange,
  averageCycleLength: 28,
  averagePeriodLength: 5,
  lastPeriodStartDate: null,
  lastPeriodDuration: 5,
  goals: [] as Goal[],
};

export const useOnboardingDraft = create<OnboardingDraft>()((set) => ({
  ...initial,
  set: (patch) => set(patch),
  toggleGoal: (goal) =>
    set((state) => ({
      goals: state.goals.includes(goal)
        ? state.goals.filter((g) => g !== goal)
        : [...state.goals, goal],
    })),
  reset: () => set(initial),
}));
