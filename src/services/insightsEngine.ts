import { CyclePhase, DailyLog, Symptom, UserProfile } from '@/types';
import { getCyclePrediction, getPhaseForCycleDay } from './cycleEngine';
import { daysBetween } from '@/utils/date';

export interface Insights {
  logCount: number;
  avgCycleLength: number;
  confidenceScore: number;
  topSymptoms: { symptom: Symptom; count: number }[];
  avgEnergyByPhase: Partial<Record<CyclePhase, number>>;
  avgSleepByPhase: Partial<Record<CyclePhase, number>>;
  /** Sleep averages inside vs outside the PMS window, null when no data. */
  pmsSleepAvg: number | null;
  otherSleepAvg: number | null;
  nextPmsStart: string;
  nextPmsEnd: string;
}

function phaseOf(
  date: string,
  profile: UserProfile,
  lutealLength?: number
): CyclePhase {
  const days = daysBetween(profile.lastPeriodStartDate, date);
  const offset =
    ((days % profile.averageCycleLength) + profile.averageCycleLength) %
    profile.averageCycleLength;
  return getPhaseForCycleDay(
    offset + 1,
    profile.averagePeriodLength,
    profile.averageCycleLength,
    lutealLength
  );
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

export function computeInsights(args: {
  profile: UserProfile;
  logs: Record<string, DailyLog>;
  lutealLength?: number;
}): Insights {
  const { profile, logs, lutealLength } = args;
  const logList = Object.values(logs);

  const symptomCounts = new Map<Symptom, number>();
  const energyByPhase = new Map<CyclePhase, number[]>();
  const sleepByPhase = new Map<CyclePhase, number[]>();
  const pmsSleep: number[] = [];
  const otherSleep: number[] = [];

  for (const log of logList) {
    for (const symptom of log.symptoms) {
      symptomCounts.set(symptom, (symptomCounts.get(symptom) ?? 0) + 1);
    }
    const phase = phaseOf(log.date, profile, lutealLength);
    energyByPhase.set(phase, [...(energyByPhase.get(phase) ?? []), log.energyLevel]);
    sleepByPhase.set(phase, [...(sleepByPhase.get(phase) ?? []), log.sleepQuality]);

    const prediction = getCyclePrediction({
      lastPeriodStartDate: profile.lastPeriodStartDate,
      averageCycleLength: profile.averageCycleLength,
      averagePeriodLength: profile.averagePeriodLength,
      today: log.date,
      lutealLength,
    });
    (prediction.isPmsWindow ? pmsSleep : otherSleep).push(log.sleepQuality);
  }

  const avg = (values: number[]) =>
    round1(values.reduce((s, v) => s + v, 0) / values.length);

  const avgEnergyByPhase: Partial<Record<CyclePhase, number>> = {};
  for (const [phase, values] of energyByPhase) avgEnergyByPhase[phase] = avg(values);
  const avgSleepByPhase: Partial<Record<CyclePhase, number>> = {};
  for (const [phase, values] of sleepByPhase) avgSleepByPhase[phase] = avg(values);

  const today = new Date().toISOString().slice(0, 10);
  const prediction = getCyclePrediction({
    lastPeriodStartDate: profile.lastPeriodStartDate,
    averageCycleLength: profile.averageCycleLength,
    averagePeriodLength: profile.averagePeriodLength,
    today,
    lutealLength,
  });

  return {
    logCount: logList.length,
    avgCycleLength: profile.averageCycleLength,
    confidenceScore: prediction.confidenceScore,
    topSymptoms: [...symptomCounts.entries()]
      .map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3),
    avgEnergyByPhase,
    avgSleepByPhase,
    pmsSleepAvg: pmsSleep.length ? avg(pmsSleep) : null,
    otherSleepAvg: otherSleep.length ? avg(otherSleep) : null,
    nextPmsStart: prediction.pmsWindowStart,
    nextPmsEnd: prediction.pmsWindowEnd,
  };
}
