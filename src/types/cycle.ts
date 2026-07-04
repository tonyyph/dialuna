export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface CyclePrediction {
  cycleDay: number;
  phase: CyclePhase;
  isPmsWindow: boolean;
  /** ISO yyyy-MM-dd */
  nextPeriodStart: string;
  daysUntilPeriod: number;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  ovulationEstimate: string;
  pmsWindowStart: string;
  pmsWindowEnd: string;
  /** 0-1 */
  confidenceScore: number;
}

export interface HormoneTwinDailyProfile {
  date: string;
  cycleDay: number;
  phase: CyclePhase;
  isPmsWindow: boolean;
  /** 0-100 */
  hormoneTwinScore: number;
  energyScore: number;
  moodScore: number;
  focusScore: number;
  painRisk: number;
  pmsProbability: number;
  /** i18n keys — resolve with t() at render time */
  coachMessageKey: string;
  foodTipKeys: string[];
  workoutTipKeys: string[];
  selfCareTipKeys: string[];
}
