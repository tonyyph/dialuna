import { create } from 'zustand';

import { Goal, Symptom } from '@/types';

/** In-memory draft of the profile being built during onboarding (not persisted). */
interface OnboardingDraft {
  nickname: string;
  email: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  lastPeriodStartDate: string | null;
  goals: Goal[];
  symptoms: Symptom[];
  set: (
    patch: Partial<
      Omit<OnboardingDraft, 'set' | 'toggleGoal' | 'toggleSymptom' | 'reset'>
    >
  ) => void;
  toggleGoal: (goal: Goal) => void;
  toggleSymptom: (symptom: Symptom) => void;
  reset: () => void;
}

const initial = {
  nickname: '',
  email: '',
  averageCycleLength: 28,
  averagePeriodLength: 5,
  lastPeriodStartDate: null,
  goals: [] as Goal[],
  symptoms: [] as Symptom[],
};

const toggle = <T,>(arr: T[], v: T) =>
  arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

export const useOnboardingDraft = create<OnboardingDraft>()((set) => ({
  ...initial,
  set: (patch) => set(patch),
  toggleGoal: (goal) => set((s) => ({ goals: toggle(s.goals, goal) })),
  toggleSymptom: (symptom) => set((s) => ({ symptoms: toggle(s.symptoms, symptom) })),
  reset: () => set(initial),
}));
