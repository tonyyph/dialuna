import { format, parseISO, differenceInCalendarDays, addDays } from 'date-fns';

export const ISO_DATE = 'yyyy-MM-dd';

export function toISODate(date: Date): string {
  return format(date, ISO_DATE);
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Whole calendar days from a to b (positive when b is after a). */
export function daysBetween(a: string, b: string): number {
  return differenceInCalendarDays(parseISO(b), parseISO(a));
}

export function addDaysISO(date: string, days: number): string {
  return toISODate(addDays(parseISO(date), days));
}

export function isWithinISO(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}
