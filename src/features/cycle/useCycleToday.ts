import { useMemo } from 'react';

import { getCyclePrediction } from '@/services/cycleEngine';
import { getHormoneTwinProfile, getWeekForecast } from '@/services/hormoneTwinEngine';
import { useLogStore, useUserStore } from '@/store';
import { todayISO } from '@/utils/date';

/** Today's prediction, twin profile and 7-day forecast for the current user. */
export function useCycleToday() {
  const profile = useUserStore((s) => s.profile);
  const logs = useLogStore((s) => s.logs);
  const today = todayISO();

  return useMemo(() => {
    if (!profile) return null;
    const prediction = getCyclePrediction({
      lastPeriodStartDate: profile.lastPeriodStartDate,
      averageCycleLength: profile.averageCycleLength,
      averagePeriodLength: profile.averagePeriodLength,
      today,
    });
    const twin = getHormoneTwinProfile({ date: today, profile, logs });
    const week = getWeekForecast({ startDate: today, profile, logs });
    return { profile, prediction, twin, week, today };
  }, [profile, logs, today]);
}
