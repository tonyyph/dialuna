import { describe, expect, it } from 'vitest';

import { DailyLog, UserProfile } from '@/types';
import { detectIntent, generateAIResponse, generateLogReflection } from './aiCoachEngine';
import { getCyclePrediction } from './cycleEngine';
import { getHormoneTwinProfile } from './hormoneTwinEngine';

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

// Fake t(): returns "key{json-of-options}" so tests can assert key + interpolation.
const t = (key: string, opts?: object) =>
  opts ? `${key}${JSON.stringify(opts)}` : key;

function contextFor(date: string) {
  const prediction = getCyclePrediction({
    lastPeriodStartDate: profile.lastPeriodStartDate,
    averageCycleLength: profile.averageCycleLength,
    averagePeriodLength: profile.averagePeriodLength,
    today: date,
  });
  const twin = getHormoneTwinProfile({ date, profile, logs: {} });
  return { prediction, twin };
}

describe('detectIntent', () => {
  it('detects English keywords', () => {
    expect(detectIntent('Why am I feeling tired today?')).toBe('tired');
    expect(detectIntent('Can I do HIIT today?')).toBe('workout');
    expect(detectIntent('Why am I craving sweets?')).toBe('cravings');
    expect(detectIntent('Is my mood related to my cycle?')).toBe('mood');
    expect(detectIntent('What should I eat today?')).toBe('food');
    expect(detectIntent('How can I reduce cramps?')).toBe('cramps');
    expect(detectIntent('What should I expect this week?')).toBe('week');
    expect(detectIntent('How can I sleep better?')).toBe('sleep');
    expect(detectIntent('Tell me something')).toBe('general');
  });

  it('detects Vietnamese keywords', () => {
    expect(detectIntent('Sao hôm nay mình mệt thế?')).toBe('tired');
    expect(detectIntent('Hôm nay tập HIIT được không?')).toBe('workout');
    expect(detectIntent('Sao mình thèm đồ ngọt?')).toBe('cravings');
    expect(detectIntent('Tâm trạng mình có liên quan chu kỳ không?')).toBe('mood');
    expect(detectIntent('Hôm nay nên ăn gì?')).toBe('food');
    expect(detectIntent('Làm sao giảm đau bụng kinh?')).toBe('cramps');
    expect(detectIntent('Tuần này mình nên chuẩn bị gì?')).toBe('week');
    expect(detectIntent('Làm sao để ngủ ngon hơn?')).toBe('sleep');
  });
});

describe('generateAIResponse', () => {
  it('builds a phase-contextual answer with disclaimer for health intents', () => {
    const { prediction, twin } = contextFor('2026-07-05'); // luteal, day 22
    const res = generateAIResponse({
      question: 'How can I reduce cramps?',
      profile,
      prediction,
      twin,
      recentLogs: [],
      t,
    });
    expect(res.text).toContain('ai.answer.cramps');
    expect(res.text).toContain('ai.why.luteal');
    expect(res.text).toContain('ai.try.cramps.low');
    expect(res.text).toContain('disclaimer.short');
    expect(res.includesDisclaimer).toBe(true);
  });

  it('omits disclaimer for non-health intents and uses high-energy variant in follicular', () => {
    const { prediction, twin } = contextFor('2026-06-22'); // follicular, day 9
    const res = generateAIResponse({
      question: 'What should I expect this week?',
      profile,
      prediction,
      twin,
      recentLogs: [],
      t,
    });
    expect(res.text).toContain('ai.try.week.high');
    expect(res.text).not.toContain('disclaimer.short');
    expect(res.includesDisclaimer).toBe(false);
  });

  it('uses PMS variants inside the PMS window', () => {
    const { prediction, twin } = contextFor('2026-07-08'); // PMS window
    const res = generateAIResponse({
      question: 'Why am I feeling tired today?',
      profile,
      prediction,
      twin,
      recentLogs: [],
      t,
    });
    expect(res.text).toContain('ai.why.pms');
    expect(res.text).toContain('ai.try.tired.low');
  });

  it('interpolates cycle context into the answer', () => {
    const { prediction, twin } = contextFor('2026-07-05');
    const res = generateAIResponse({
      question: 'Why am I feeling tired today?',
      profile,
      prediction,
      twin,
      recentLogs: [],
      t,
    });
    expect(res.text).toContain('"cycleDay":22');
    expect(res.text).toContain('"name":"Anna"');
  });
});

describe('generateLogReflection', () => {
  const log: DailyLog = {
    date: '2026-07-05',
    flow: 'none',
    symptoms: ['cramps'],
    moods: ['sensitive'],
    energyLevel: 4,
    sleepQuality: 5,
    stressLevel: 6,
    workoutType: 'yoga',
    note: '',
    createdAt: '2026-07-05T08:00:00.000Z',
    updatedAt: '2026-07-05T08:00:00.000Z',
  };

  it('reflects the current phase and mentions logged symptoms', () => {
    const { prediction } = contextFor('2026-07-05');
    const text = generateLogReflection({ log, prediction, t });
    expect(text).toContain('log.reflection.luteal');
    expect(text).toContain('log.reflection.symptomNote');
  });

  it('skips symptom note when nothing was logged', () => {
    const { prediction } = contextFor('2026-06-22');
    const text = generateLogReflection({
      log: { ...log, symptoms: [] },
      prediction,
      t,
    });
    expect(text).toContain('log.reflection.follicular');
    expect(text).not.toContain('symptomNote');
  });
});
