export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type Symptom =
  | 'cramps'
  | 'headache'
  | 'bloating'
  | 'acne'
  | 'breastTenderness'
  | 'backPain'
  | 'nausea'
  | 'fatigue'
  | 'moodSwings'
  | 'insomnia';

export type Mood = 'happy' | 'calm' | 'anxious' | 'sad' | 'angry' | 'sensitive';

export type WorkoutType = 'none' | 'walking' | 'yoga' | 'strength' | 'cardio' | 'hiit';

export interface DailyLog {
  /** ISO yyyy-MM-dd, unique key */
  date: string;
  flow: FlowLevel;
  symptoms: Symptom[];
  moods: Mood[];
  /** 1-10 */
  energyLevel: number;
  /** 1-10 */
  sleepQuality: number;
  /** 1-10 */
  stressLevel: number;
  workoutType: WorkoutType;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export const ALL_FLOW_LEVELS: FlowLevel[] = ['none', 'spotting', 'light', 'medium', 'heavy'];

export const ALL_SYMPTOMS: Symptom[] = [
  'cramps',
  'headache',
  'bloating',
  'acne',
  'breastTenderness',
  'backPain',
  'nausea',
  'fatigue',
  'moodSwings',
  'insomnia',
];

/** The eight symptoms offered during onboarding (handoff order). */
export const ONBOARDING_SYMPTOMS: Symptom[] = [
  'cramps',
  'bloating',
  'headache',
  'fatigue',
  'moodSwings',
  'acne',
  'breastTenderness',
  'insomnia',
];

export const ALL_MOODS: Mood[] = ['happy', 'calm', 'anxious', 'sad', 'angry', 'sensitive'];

export const ALL_WORKOUTS: WorkoutType[] = ['none', 'walking', 'yoga', 'strength', 'cardio', 'hiit'];
