import { describe, expect, it } from 'vitest';

import { DailyLog, UserProfile } from '@/types';
import { computeInsights } from './insightsEngine';

const profile: UserProfile = {
  id: 'u1',
  nickname: 'Anna',
  ageRange: '25-30',
  averageCycleLength: 28,
  averagePeriodLength: 5,
  lastPeriodStartDate: '2026-06-14',
  lastPeriodEndDate: '2026-06-18',
  goals: ['understandCycle'],
  createdAt: '2026-06-14T00:00:00.000Z',
};

function makeLog(date: string, overrides: Partial<DailyLog> = {}): DailyLog {
  return {
    date,
    flow: 'none',
    symptoms: [],
    moods: [],
    energyLevel: 5,
    sleepQuality: 5,
    stressLevel: 5,
    workoutType: 'none',
    note: '',
    createdAt: `${date}T08:00:00.000Z`,
    updatedAt: `${date}T08:00:00.000Z`,
    ...overrides,
  };
}

describe('computeInsights', () => {
  it('counts logs and ranks top symptoms', () => {
    const logs = {
      '2026-06-15': makeLog('2026-06-15', { symptoms: ['cramps', 'fatigue'] }),
      '2026-06-16': makeLog('2026-06-16', { symptoms: ['cramps'] }),
      '2026-06-22': makeLog('2026-06-22', { symptoms: ['headache'] }),
    };
    const insights = computeInsights({ profile, logs });
    expect(insights.logCount).toBe(3);
    expect(insights.topSymptoms[0]).toEqual({ symptom: 'cramps', count: 2 });
    expect(insights.topSymptoms).toHaveLength(3);
  });

  it('averages energy and sleep per phase', () => {
    const logs = {
      // 06-15 = cycle day 2 → menstrual
      '2026-06-15': makeLog('2026-06-15', { energyLevel: 2, sleepQuality: 4 }),
      '2026-06-16': makeLog('2026-06-16', { energyLevel: 4, sleepQuality: 6 }),
      // 06-22 = cycle day 9 → follicular
      '2026-06-22': makeLog('2026-06-22', { energyLevel: 8, sleepQuality: 8 }),
    };
    const insights = computeInsights({ profile, logs });
    expect(insights.avgEnergyByPhase.menstrual).toBe(3);
    expect(insights.avgEnergyByPhase.follicular).toBe(8);
    expect(insights.avgSleepByPhase.menstrual).toBe(5);
  });

  it('returns the profile average cycle length', () => {
    const insights = computeInsights({ profile, logs: {} });
    expect(insights.avgCycleLength).toBe(28);
    expect(insights.logCount).toBe(0);
  });
});
