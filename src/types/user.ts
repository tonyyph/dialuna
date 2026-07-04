export type Goal =
  | 'understandCycle'
  | 'reducePms'
  | 'improveMood'
  | 'planWorkouts'
  | 'skinInsights'
  | 'pregnancyPlanning'
  | 'betterSleep';

export type AgeRange = '18-24' | '25-30' | '31-35' | '36-45' | '46+';

export interface UserProfile {
  id: string;
  nickname: string;
  ageRange: AgeRange;
  averageCycleLength: number;
  averagePeriodLength: number;
  /** ISO yyyy-MM-dd */
  lastPeriodStartDate: string;
  /** ISO yyyy-MM-dd */
  lastPeriodEndDate: string | null;
  goals: Goal[];
  createdAt: string;
}

export const ALL_GOALS: Goal[] = [
  'understandCycle',
  'reducePms',
  'improveMood',
  'planWorkouts',
  'skinInsights',
  'pregnancyPlanning',
  'betterSleep',
];

export const ALL_AGE_RANGES: AgeRange[] = ['18-24', '25-30', '31-35', '36-45', '46+'];
