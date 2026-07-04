import { describe, expect, it } from 'vitest';

import { DailyLog, UserProfile } from '@/types';
import { getHormoneTwinProfile, getWeekForecast } from './hormoneTwinEngine';

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

describe('getHormoneTwinProfile', () => {
  it('uses follicular base scores without logs', () => {
    // 2026-06-22 = cycle day 9 → follicular
    const twin = getHormoneTwinProfile({ date: '2026-06-22', profile, logs: {} });
    expect(twin.phase).toBe('follicular');
    expect(twin.energyScore).toBe(75);
    expect(twin.moodScore).toBe(70);
    expect(twin.focusScore).toBe(80);
    expect(twin.painRisk).toBe(15);
    expect(twin.coachMessageKey).toBe('coach.follicular');
  });

  it('overrides with PMS scores inside the PMS window', () => {
    // 2026-07-08 is within PMS window (07-07..07-11)
    const twin = getHormoneTwinProfile({ date: '2026-07-08', profile, logs: {} });
    expect(twin.isPmsWindow).toBe(true);
    expect(twin.pmsProbability).toBe(85);
    expect(twin.painRisk).toBe(65);
    expect(twin.coachMessageKey).toBe('coach.pms');
    expect(twin.foodTipKeys[0]).toBe('tips.food.pms.0');
  });

  it('shifts energy up when recent logs show high energy and sleep', () => {
    const logs = {
      '2026-06-20': makeLog('2026-06-20', { energyLevel: 9, sleepQuality: 9 }),
      '2026-06-21': makeLog('2026-06-21', { energyLevel: 9, sleepQuality: 9 }),
    };
    const base = getHormoneTwinProfile({ date: '2026-06-22', profile, logs: {} });
    const boosted = getHormoneTwinProfile({ date: '2026-06-22', profile, logs });
    expect(boosted.energyScore).toBeGreaterThan(base.energyScore);
    expect(boosted.energyScore).toBeLessThanOrEqual(base.energyScore + 15);
  });

  it('shifts mood down when recent logs show high stress', () => {
    const logs = {
      '2026-06-21': makeLog('2026-06-21', { stressLevel: 10 }),
    };
    const base = getHormoneTwinProfile({ date: '2026-06-22', profile, logs: {} });
    const stressed = getHormoneTwinProfile({ date: '2026-06-22', profile, logs });
    expect(stressed.moodScore).toBeLessThan(base.moodScore);
  });

  it('clamps all scores to 0-100 and computes weighted twin score', () => {
    const twin = getHormoneTwinProfile({ date: '2026-06-22', profile, logs: {} });
    const expected = Math.round(
      0.4 * twin.energyScore + 0.3 * twin.moodScore + 0.3 * twin.focusScore
    );
    expect(twin.hormoneTwinScore).toBe(expected);
    for (const v of [twin.energyScore, twin.moodScore, twin.focusScore, twin.painRisk, twin.pmsProbability]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });
});

describe('getWeekForecast', () => {
  it('returns 7 consecutive daily profiles', () => {
    const week = getWeekForecast({ startDate: '2026-07-05', profile, logs: {} });
    expect(week).toHaveLength(7);
    expect(week[0].date).toBe('2026-07-05');
    expect(week[6].date).toBe('2026-07-11');
    // 07-07..07-11 fall in the PMS window
    expect(week[3].isPmsWindow).toBe(true);
  });
});
