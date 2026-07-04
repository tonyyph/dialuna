import { CyclePrediction, DailyLog, HormoneTwinDailyProfile, UserProfile } from '@/types';

export type AiIntent =
  | 'tired'
  | 'workout'
  | 'cravings'
  | 'mood'
  | 'food'
  | 'cramps'
  | 'week'
  | 'sleep'
  | 'general';

type TFunction = (key: string, opts?: object) => string;

const INTENT_KEYWORDS: Record<Exclude<AiIntent, 'general'>, string[]> = {
  // Order matters: first match wins. Specific intents before broad ones.
  cramps: ['cramp', 'đau bụng', 'dau bung'],
  tired: ['tired', 'exhausted', 'fatigue', 'mệt', 'met moi'],
  workout: ['hiit', 'workout', 'exercise', 'train', 'gym', 'run', 'tập', 'tap luyen'],
  cravings: ['craving', 'sweets', 'sugar', 'thèm', 'them ngot'],
  sleep: ['sleep', 'insomnia', 'ngủ', 'ngu ngon'],
  mood: ['mood', 'emotional', 'feelings', 'tâm trạng', 'tam trang', 'cảm xúc', 'cam xuc'],
  food: ['eat', 'food', 'meal', 'diet', 'ăn', 'an gi'],
  week: ['week', 'tuần', 'tuan nay'],
};

const HEALTH_INTENTS: AiIntent[] = ['tired', 'cramps', 'mood', 'cravings', 'sleep'];

/** Phases where the "high energy" advice variant applies. */
const HIGH_ENERGY_PHASES = ['follicular', 'ovulation'];

export function detectIntent(question: string): AiIntent {
  const q = question.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some((kw) => q.includes(kw))) return intent as AiIntent;
  }
  return 'general';
}

function phaseGroup(prediction: CyclePrediction): string {
  return prediction.isPmsWindow ? 'pms' : prediction.phase;
}

function energyVariant(prediction: CyclePrediction): 'high' | 'low' {
  return !prediction.isPmsWindow && HIGH_ENERGY_PHASES.includes(prediction.phase)
    ? 'high'
    : 'low';
}

export function generateAIResponse(args: {
  question: string;
  profile: UserProfile;
  prediction: CyclePrediction;
  twin: HormoneTwinDailyProfile;
  recentLogs: DailyLog[];
  t: TFunction;
}): { text: string; includesDisclaimer: boolean } {
  const { question, profile, prediction, t } = args;
  const intent = detectIntent(question);
  const group = phaseGroup(prediction);
  const variant = energyVariant(prediction);

  const context = {
    name: profile.nickname,
    cycleDay: prediction.cycleDay,
    daysUntilPeriod: prediction.daysUntilPeriod,
    phase: t(`phases.${prediction.phase}`),
  };

  const parts = [
    t(`ai.answer.${intent}`, context),
    t(`ai.why.${group}`),
    t(`ai.try.${intent}.${variant}`),
  ];

  const includesDisclaimer = HEALTH_INTENTS.includes(intent);
  if (includesDisclaimer) parts.push(t('disclaimer.short'));

  return { text: parts.join('\n\n'), includesDisclaimer };
}

export function generateLogReflection(args: {
  log: DailyLog;
  prediction: CyclePrediction;
  nickname?: string;
  t: TFunction;
}): string {
  const { log, prediction, nickname, t } = args;
  const group = phaseGroup(prediction);
  const parts = [t(`log.reflection.${group}`, { name: nickname ?? '' })];

  if (log.symptoms.length > 0) {
    parts.push(
      t('log.reflection.symptomNote', {
        symptom: t(`symptoms.${log.symptoms[0]}`),
      })
    );
  }
  return parts.join('\n\n');
}
