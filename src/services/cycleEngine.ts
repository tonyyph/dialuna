import { CyclePhase, CyclePrediction, UserProfile } from '@/types';
import { addDaysISO, daysBetween, isWithinISO } from '@/utils/date';

export interface CycleEngineInput {
  lastPeriodStartDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  today: string;
}

type CycleProfile = Pick<
  UserProfile,
  'lastPeriodStartDate' | 'averageCycleLength' | 'averagePeriodLength'
>;

export interface DayInfo {
  cycleDay: number;
  phase: CyclePhase;
  isPredictedPeriod: boolean;
  isFertile: boolean;
  isPms: boolean;
  isOvulation: boolean;
}

const PMS_WINDOW_DAYS = 5;
const LUTEAL_LENGTH = 14;
const FERTILE_SPREAD = 3;

export function getPhaseForCycleDay(
  cycleDay: number,
  periodLength: number,
  cycleLength: number
): CyclePhase {
  const follicularEnd = Math.min(12, cycleLength - 2);
  const ovulationEnd = Math.min(16, cycleLength - 1);
  if (cycleDay <= periodLength) return 'menstrual';
  if (cycleDay <= follicularEnd) return 'follicular';
  if (cycleDay <= ovulationEnd) return 'ovulation';
  return 'luteal';
}

/** 0-based index of the cycle that `date` falls in, relative to lastPeriodStartDate. */
function cycleIndexFor(date: string, profile: CycleProfile): number {
  const days = daysBetween(profile.lastPeriodStartDate, date);
  return Math.floor(days / profile.averageCycleLength);
}

function cycleStartFor(date: string, profile: CycleProfile): string {
  const index = cycleIndexFor(date, profile);
  return addDaysISO(profile.lastPeriodStartDate, index * profile.averageCycleLength);
}

export function getCyclePrediction(input: CycleEngineInput): CyclePrediction {
  const profile: CycleProfile = {
    lastPeriodStartDate: input.lastPeriodStartDate,
    averageCycleLength: input.averageCycleLength,
    averagePeriodLength: input.averagePeriodLength,
  };
  const cycleStart = cycleStartFor(input.today, profile);
  const cycleDay = daysBetween(cycleStart, input.today) + 1;
  const nextPeriodStart = addDaysISO(cycleStart, input.averageCycleLength);
  const daysUntilPeriod = daysBetween(input.today, nextPeriodStart);

  const ovulationEstimate = addDaysISO(
    cycleStart,
    input.averageCycleLength - LUTEAL_LENGTH
  );
  const fertileWindowStart = addDaysISO(ovulationEstimate, -FERTILE_SPREAD);
  const fertileWindowEnd = addDaysISO(ovulationEstimate, FERTILE_SPREAD);

  const pmsWindowStart = addDaysISO(nextPeriodStart, -PMS_WINDOW_DAYS);
  const pmsWindowEnd = addDaysISO(nextPeriodStart, -1);
  const isPmsWindow = isWithinISO(input.today, pmsWindowStart, pmsWindowEnd);

  const unusualLength =
    input.averageCycleLength < 24 || input.averageCycleLength > 35;

  return {
    cycleDay,
    phase: getPhaseForCycleDay(
      cycleDay,
      input.averagePeriodLength,
      input.averageCycleLength
    ),
    isPmsWindow,
    nextPeriodStart,
    daysUntilPeriod,
    fertileWindowStart,
    fertileWindowEnd,
    ovulationEstimate,
    pmsWindowStart,
    pmsWindowEnd,
    confidenceScore: unusualLength ? 0.7 : 0.8,
  };
}

export function getDayInfo(date: string, profile: CycleProfile): DayInfo {
  const prediction = getCyclePrediction({
    lastPeriodStartDate: profile.lastPeriodStartDate,
    averageCycleLength: profile.averageCycleLength,
    averagePeriodLength: profile.averagePeriodLength,
    today: date,
  });
  // Dates before the first tracked period: normalize cycle day into range so
  // the calendar can still render a phase estimate.
  const normalizedDay =
    ((prediction.cycleDay % profile.averageCycleLength) +
      profile.averageCycleLength) %
      profile.averageCycleLength || profile.averageCycleLength;
  const phase = getPhaseForCycleDay(
    normalizedDay,
    profile.averagePeriodLength,
    profile.averageCycleLength
  );
  const isFuturePredictedCycle = date > profile.lastPeriodStartDate
    ? cycleIndexFor(date, profile) >= 1
    : false;

  return {
    cycleDay: normalizedDay,
    phase,
    isPredictedPeriod: phase === 'menstrual' && isFuturePredictedCycle,
    isFertile: isWithinISO(
      date,
      prediction.fertileWindowStart,
      prediction.fertileWindowEnd
    ),
    isPms: isWithinISO(date, prediction.pmsWindowStart, prediction.pmsWindowEnd),
    isOvulation: date === prediction.ovulationEstimate,
  };
}
