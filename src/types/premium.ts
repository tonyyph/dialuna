export type PremiumPlan = 'monthly' | 'yearly' | 'lifetime' | null;

export interface PremiumState {
  isPremium: boolean;
  plan: PremiumPlan;
  aiQuestionsUsedToday: number;
  /** ISO yyyy-MM-dd of last counter reset */
  lastResetDate: string;
}

export const FREE_AI_QUESTIONS_PER_DAY = 3;
