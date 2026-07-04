import { describe, expect, it } from 'vitest';

import { getCyclePrediction, getDayInfo, getPhaseForCycleDay } from './cycleEngine';

const profile = {
  lastPeriodStartDate: '2026-06-14',
  averageCycleLength: 28,
  averagePeriodLength: 5,
};

describe('getCyclePrediction', () => {
  it('is cycle day 1 on the period start date', () => {
    const p = getCyclePrediction({ ...profile, today: '2026-06-14' });
    expect(p.cycleDay).toBe(1);
    expect(p.phase).toBe('menstrual');
  });

  it('is luteal on cycle day 22 of a 28-day cycle', () => {
    const p = getCyclePrediction({ ...profile, today: '2026-07-05' });
    expect(p.cycleDay).toBe(22);
    expect(p.phase).toBe('luteal');
  });

  it('predicts next period start and countdown', () => {
    const p = getCyclePrediction({ ...profile, today: '2026-07-05' });
    expect(p.nextPeriodStart).toBe('2026-07-12');
    expect(p.daysUntilPeriod).toBe(7);
  });

  it('marks PMS window as the last 5 days before next period', () => {
    const outside = getCyclePrediction({ ...profile, today: '2026-07-05' });
    expect(outside.isPmsWindow).toBe(false);
    const inside = getCyclePrediction({ ...profile, today: '2026-07-08' });
    expect(inside.isPmsWindow).toBe(true);
    expect(inside.pmsWindowStart).toBe('2026-07-07');
    expect(inside.pmsWindowEnd).toBe('2026-07-11');
  });

  it('estimates ovulation at cycleLength - 14 with ±3 day fertile window', () => {
    const p = getCyclePrediction({ ...profile, today: '2026-06-20' });
    // 14 days before next period (2026-07-12) = cycle day 15
    expect(p.ovulationEstimate).toBe('2026-06-28');
    expect(p.fertileWindowStart).toBe('2026-06-25');
    expect(p.fertileWindowEnd).toBe('2026-07-01');
  });

  it('wraps into the next cycle when today passes the predicted start', () => {
    const p = getCyclePrediction({ ...profile, today: '2026-07-12' });
    expect(p.cycleDay).toBe(1);
    expect(p.phase).toBe('menstrual');
    expect(p.nextPeriodStart).toBe('2026-08-09');
  });

  it('lowers confidence for unusual cycle lengths', () => {
    const normal = getCyclePrediction({ ...profile, today: '2026-07-05' });
    const short = getCyclePrediction({
      ...profile,
      averageCycleLength: 22,
      today: '2026-07-05',
    });
    expect(normal.confidenceScore).toBeCloseTo(0.8);
    expect(short.confidenceScore).toBeCloseTo(0.7);
  });
});

describe('getPhaseForCycleDay', () => {
  it('maps days to phases for a 28/5 cycle', () => {
    expect(getPhaseForCycleDay(1, 5, 28)).toBe('menstrual');
    expect(getPhaseForCycleDay(5, 5, 28)).toBe('menstrual');
    expect(getPhaseForCycleDay(6, 5, 28)).toBe('follicular');
    expect(getPhaseForCycleDay(12, 5, 28)).toBe('follicular');
    expect(getPhaseForCycleDay(13, 5, 28)).toBe('ovulation');
    expect(getPhaseForCycleDay(16, 5, 28)).toBe('ovulation');
    expect(getPhaseForCycleDay(17, 5, 28)).toBe('luteal');
    expect(getPhaseForCycleDay(28, 5, 28)).toBe('luteal');
  });
});

describe('getDayInfo', () => {
  it('flags predicted period days in a future cycle', () => {
    const info = getDayInfo('2026-07-13', profile);
    expect(info.isPredictedPeriod).toBe(true);
    expect(info.phase).toBe('menstrual');
  });

  it('flags fertile and PMS days', () => {
    expect(getDayInfo('2026-06-28', profile).isOvulation).toBe(true);
    expect(getDayInfo('2026-06-25', profile).isFertile).toBe(true);
    expect(getDayInfo('2026-07-08', profile).isPms).toBe(true);
  });

  it('handles dates before the last period start', () => {
    const info = getDayInfo('2026-06-10', profile);
    expect(info.cycleDay).toBeGreaterThanOrEqual(1);
    expect(info.cycleDay).toBeLessThanOrEqual(28);
  });
});
