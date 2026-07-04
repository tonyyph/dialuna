import { CyclePhase, DailyLog, HormoneTwinDailyProfile, UserProfile } from '@/types';
import { addDaysISO } from '@/utils/date';
import { getCyclePrediction } from './cycleEngine';

interface BaseScores {
  energy: number;
  mood: number;
  focus: number;
  pain: number;
  pms: number;
}

const PHASE_SCORES: Record<CyclePhase, BaseScores> = {
  menstrual: { energy: 35, mood: 50, focus: 45, pain: 70, pms: 10 },
  follicular: { energy: 75, mood: 70, focus: 80, pain: 15, pms: 5 },
  ovulation: { energy: 85, mood: 80, focus: 70, pain: 20, pms: 5 },
  luteal: { energy: 55, mood: 55, focus: 55, pain: 35, pms: 30 },
};

const PMS_SCORES: BaseScores = { energy: 40, mood: 40, focus: 45, pain: 65, pms: 85 };

const RECENT_LOG_COUNT = 3;
const MAX_LOG_SHIFT = 15;
const NEUTRAL_LEVEL = 5.5;

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));

function recentLogsBefore(
  date: string,
  logs: Record<string, DailyLog>
): DailyLog[] {
  return Object.values(logs)
    .filter((log) => log.date <= date)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, RECENT_LOG_COUNT);
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Shift derived from 1-10 log levels: (avg − 5.5) * 4, clamped to ±15. */
function levelShift(avg: number | null): number {
  if (avg === null) return 0;
  return clamp((avg - NEUTRAL_LEVEL) * 4, -MAX_LOG_SHIFT, MAX_LOG_SHIFT);
}

export function getHormoneTwinProfile(args: {
  date: string;
  profile: UserProfile;
  logs: Record<string, DailyLog>;
}): HormoneTwinDailyProfile {
  const { date, profile, logs } = args;
  const prediction = getCyclePrediction({
    lastPeriodStartDate: profile.lastPeriodStartDate,
    averageCycleLength: profile.averageCycleLength,
    averagePeriodLength: profile.averagePeriodLength,
    today: date,
  });

  const base = prediction.isPmsWindow ? PMS_SCORES : PHASE_SCORES[prediction.phase];
  const recent = recentLogsBefore(date, logs);

  const energyAvg = average(
    recent.flatMap((log) => [log.energyLevel, log.sleepQuality])
  );
  const stressAvg = average(recent.map((log) => log.stressLevel));

  const energyScore = clamp(Math.round(base.energy + levelShift(energyAvg)));
  const moodScore = clamp(Math.round(base.mood - levelShift(stressAvg)));
  const focusScore = clamp(base.focus);

  const tipGroup = prediction.isPmsWindow ? 'pms' : prediction.phase;
  const tipKeys = (category: string) =>
    [0, 1, 2].map((i) => `tips.${category}.${tipGroup}.${i}`);

  return {
    date,
    cycleDay: prediction.cycleDay,
    phase: prediction.phase,
    isPmsWindow: prediction.isPmsWindow,
    hormoneTwinScore: Math.round(
      0.4 * energyScore + 0.3 * moodScore + 0.3 * focusScore
    ),
    energyScore,
    moodScore,
    focusScore,
    painRisk: clamp(base.pain),
    pmsProbability: clamp(base.pms),
    coachMessageKey: `coach.${tipGroup}`,
    foodTipKeys: tipKeys('food'),
    workoutTipKeys: tipKeys('workout'),
    selfCareTipKeys: tipKeys('selfcare'),
  };
}

export function getWeekForecast(args: {
  startDate: string;
  profile: UserProfile;
  logs: Record<string, DailyLog>;
}): HormoneTwinDailyProfile[] {
  return Array.from({ length: 7 }, (_, i) =>
    getHormoneTwinProfile({
      date: addDaysISO(args.startDate, i),
      profile: args.profile,
      logs: args.logs,
    })
  );
}
