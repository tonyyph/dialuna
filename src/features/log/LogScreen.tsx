import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { AuroraStage } from '@/components/lunar/AuroraStage';
import { LunarCompanion } from '@/components/lunar/LunarCompanion';
import { Button } from '@/components/ui/Button';
import { LevelSlider } from '@/components/ui/LevelSlider';
import { Screen } from '@/components/ui/Screen';
import { useCycleToday } from '@/features/cycle/useCycleToday';
import { generateLogReflection } from '@/services/aiCoachEngine';
import { useLogStore } from '@/store';
import { radius, shadows, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import {
  ALL_FLOW_LEVELS,
  ALL_MOODS,
  ALL_SYMPTOMS,
  ALL_WORKOUTS,
  DailyLog,
  FlowLevel,
  Mood,
  Symptom,
  WorkoutType,
} from '@/types';
import { todayISO } from '@/utils/date';

type RitualStep = 'intro' | 'mood' | 'signals' | 'energy' | 'movement' | 'reflection' | 'complete';
type IconName = keyof typeof Ionicons.glyphMap;

const STEP_ORDER: RitualStep[] = ['intro', 'mood', 'signals', 'energy', 'movement', 'reflection'];

const MOOD_ICON: Record<Mood, IconName> = {
  happy: 'sunny',
  calm: 'water',
  anxious: 'pulse',
  sad: 'rainy',
  angry: 'flame',
  sensitive: 'heart',
};

const SYMPTOM_ICON: Record<Symptom, IconName> = {
  cramps: 'fitness',
  headache: 'partly-sunny',
  bloating: 'ellipse',
  acne: 'sparkles',
  breastTenderness: 'body',
  backPain: 'walk',
  nausea: 'leaf',
  fatigue: 'moon',
};

const WORKOUT_ICON: Record<WorkoutType, IconName> = {
  none: 'bed',
  walking: 'walk',
  yoga: 'accessibility',
  strength: 'barbell',
  cardio: 'heart',
  hiit: 'flash',
};

export function LogScreen() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const today = todayISO();
  const existing = useLogStore((s) => s.logs[today]);
  const saveLog = useLogStore((s) => s.saveLog);
  const ctx = useCycleToday();

  const [step, setStep] = useState<RitualStep>('intro');
  const [flow, setFlow] = useState<FlowLevel>(existing?.flow ?? 'none');
  const [symptoms, setSymptoms] = useState<Symptom[]>(existing?.symptoms ?? []);
  const [moods, setMoods] = useState<Mood[]>(existing?.moods ?? []);
  const [energyLevel, setEnergyLevel] = useState(existing?.energyLevel ?? 5);
  const [sleepQuality, setSleepQuality] = useState(existing?.sleepQuality ?? 5);
  const [stressLevel, setStressLevel] = useState(existing?.stressLevel ?? 5);
  const [workoutType, setWorkoutType] = useState<WorkoutType>(existing?.workoutType ?? 'none');
  const [note, setNote] = useState(existing?.note ?? '');
  const [reflection, setReflection] = useState<string | null>(null);

  const stepIndex = Math.max(0, STEP_ORDER.indexOf(step));
  const progress = step === 'complete' ? STEP_ORDER.length : stepIndex + 1;

  const selectedSummary = useMemo(() => {
    if (step === 'mood') return moods.map((mood) => t(`moods.${mood}`)).join(', ');
    if (step === 'signals') return `${t(`flow.${flow}`)} · ${symptoms.length}`;
    if (step === 'movement') return t(`workouts.${workoutType}`);
    return t('common.today');
  }, [flow, moods, step, symptoms.length, t, workoutType]);

  const toggle = <T,>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  const saveRitual = () => {
    const now = new Date().toISOString();
    const log: DailyLog = {
      date: today,
      flow,
      symptoms,
      moods,
      energyLevel,
      sleepQuality,
      stressLevel,
      workoutType,
      note: note.trim(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    saveLog(log);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (ctx) {
      setReflection(
        generateLogReflection({
          log,
          prediction: ctx.prediction,
          nickname: ctx.profile.nickname,
          t,
        })
      );
    }
    setStep('complete');
  };

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextIndex = STEP_ORDER.indexOf(step) + 1;
    const nextStep = STEP_ORDER[nextIndex];
    if (nextStep) {
      setStep(nextStep);
      return;
    }
    saveRitual();
  };

  const goBack = () => {
    if (step === 'intro') {
      router.back();
      return;
    }
    if (step === 'complete') {
      setStep('reflection');
      return;
    }
    const previousStep = STEP_ORDER[STEP_ORDER.indexOf(step) - 1] ?? 'intro';
    setStep(previousStep);
  };

  return (
    <Screen edgeToEdge keyboardAvoiding contentContainerStyle={styles.screenContent}>
      <AuroraStage intensity="ritual" style={styles.stage}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={goBack}
            hitSlop={10}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back" size={22} color={colors.moonWhite} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[typography.caption, styles.headerMeta]}>{t('log.ritual.title')}</Text>
            <Text style={[typography.subtitle, styles.headerTitle]}>{selectedSummary}</Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={[typography.caption, styles.progressText]}>
              {progress}/{STEP_ORDER.length}
            </Text>
          </View>
        </View>

        <View style={styles.moonHeader}>
          <LunarCompanion size={92} state={step === 'complete' ? 'celebrating' : 'idle'} />
          <View style={styles.phaseStrip} accessibilityLabel={t('log.ritual.progress')}>
            {STEP_ORDER.map((item, index) => (
              <View
                key={item}
                style={[
                  styles.phaseDot,
                  {
                    backgroundColor:
                      index <= stepIndex || step === 'complete'
                        ? colors.champagneGold
                        : 'rgba(255,255,255,0.22)',
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </AuroraStage>

      <View style={styles.ritualSurface}>
        {step === 'intro' ? <IntroStep onNext={goNext} /> : null}
        {step === 'mood' ? (
          <MoodStep moods={moods} onToggle={(mood) => setMoods((items) => toggle(items, mood))} onNext={goNext} />
        ) : null}
        {step === 'signals' ? (
          <SignalsStep
            flow={flow}
            symptoms={symptoms}
            onFlow={setFlow}
            onToggle={(symptom) => setSymptoms((items) => toggle(items, symptom))}
            onNext={goNext}
          />
        ) : null}
        {step === 'energy' ? (
          <EnergyStep
            energy={energyLevel}
            sleep={sleepQuality}
            stress={stressLevel}
            onEnergy={setEnergyLevel}
            onSleep={setSleepQuality}
            onStress={setStressLevel}
            onNext={goNext}
          />
        ) : null}
        {step === 'movement' ? (
          <MovementStep workout={workoutType} onSelect={setWorkoutType} onNext={goNext} />
        ) : null}
        {step === 'reflection' ? (
          <ReflectionStep note={note} onNote={setNote} onComplete={saveRitual} />
        ) : null}
        {step === 'complete' ? <CompleteStep reflection={reflection} /> : null}
      </View>
    </Screen>
  );
}

function IntroStep({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const { typography } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(360)} style={styles.step}>
      <Text style={typography.displayXl}>{t('log.ritual.introTitle')}</Text>
      <Text style={typography.bodyLarge}>{t('log.ritual.introBody')}</Text>
      <View style={styles.ctaWrap}>
        <Button label={t('log.ritual.start')} onPress={onNext} />
      </View>
    </Animated.View>
  );
}

function MoodStep({
  moods,
  onToggle,
  onNext,
}: {
  moods: Mood[];
  onToggle: (mood: Mood) => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const { typography } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(360)} style={styles.step}>
      <Question title={t('log.ritual.moodTitle')} helper={t('log.ritual.moodHelper')} />
      <View style={styles.orbitOptions}>
        {ALL_MOODS.map((mood) => (
          <RitualOption
            key={mood}
            icon={MOOD_ICON[mood]}
            label={t(`moods.${mood}`)}
            selected={moods.includes(mood)}
            onPress={() => onToggle(mood)}
          />
        ))}
      </View>
      <Text style={typography.caption}>{t('log.ritual.multiSelect')}</Text>
      <Button label={t('common.continue')} onPress={onNext} />
    </Animated.View>
  );
}

function SignalsStep({
  flow,
  symptoms,
  onFlow,
  onToggle,
  onNext,
}: {
  flow: FlowLevel;
  symptoms: Symptom[];
  onFlow: (flow: FlowLevel) => void;
  onToggle: (symptom: Symptom) => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Animated.View entering={FadeInDown.duration(360)} style={styles.step}>
      <Question title={t('log.ritual.signalsTitle')} helper={t('log.ritual.signalsHelper')} />
      <View style={styles.flowRail}>
        {ALL_FLOW_LEVELS.map((level) => (
          <MiniChoice
            key={level}
            label={t(`flow.${level}`)}
            selected={flow === level}
            onPress={() => onFlow(level)}
          />
        ))}
      </View>
      <View style={styles.orbitOptions}>
        {ALL_SYMPTOMS.map((symptom) => (
          <RitualOption
            key={symptom}
            icon={SYMPTOM_ICON[symptom]}
            label={t(`symptoms.${symptom}`)}
            selected={symptoms.includes(symptom)}
            onPress={() => onToggle(symptom)}
          />
        ))}
      </View>
      <Button label={t('common.continue')} onPress={onNext} />
    </Animated.View>
  );
}

function EnergyStep({
  energy,
  sleep,
  stress,
  onEnergy,
  onSleep,
  onStress,
  onNext,
}: {
  energy: number;
  sleep: number;
  stress: number;
  onEnergy: (value: number) => void;
  onSleep: (value: number) => void;
  onStress: (value: number) => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Animated.View entering={FadeInDown.duration(360)} style={styles.step}>
      <Question title={t('log.ritual.energyTitle')} helper={t('log.ritual.energyHelper')} />
      <View style={styles.sliderPanel}>
        <LevelSlider label={t('log.energy')} value={energy} onChange={onEnergy} />
        <LevelSlider label={t('log.sleep')} value={sleep} onChange={onSleep} />
        <LevelSlider label={t('log.stress')} value={stress} onChange={onStress} />
      </View>
      <Button label={t('common.continue')} onPress={onNext} />
    </Animated.View>
  );
}

function MovementStep({
  workout,
  onSelect,
  onNext,
}: {
  workout: WorkoutType;
  onSelect: (workout: WorkoutType) => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Animated.View entering={FadeInDown.duration(360)} style={styles.step}>
      <Question title={t('log.ritual.movementTitle')} helper={t('log.ritual.movementHelper')} />
      <View style={styles.orbitOptions}>
        {ALL_WORKOUTS.map((item) => (
          <RitualOption
            key={item}
            icon={WORKOUT_ICON[item]}
            label={t(`workouts.${item}`)}
            selected={workout === item}
            onPress={() => onSelect(item)}
          />
        ))}
      </View>
      <Button label={t('common.continue')} onPress={onNext} />
    </Animated.View>
  );
}

function ReflectionStep({
  note,
  onNote,
  onComplete,
}: {
  note: string;
  onNote: (value: string) => void;
  onComplete: () => void;
}) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(360)} style={styles.step}>
      <Question title={t('log.ritual.reflectionTitle')} helper={t('log.ritual.reflectionHelper')} />
      <TextInput
        style={[
          typography.bodyLarge,
          styles.journalInput,
          { backgroundColor: colors.surface.elevated, borderColor: colors.border },
        ]}
        value={note}
        onChangeText={onNote}
        placeholder={t('log.ritual.reflectionPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel={t('log.note')}
        multiline
      />
      <Button label={t('log.ritual.complete')} onPress={onComplete} />
    </Animated.View>
  );
}

function CompleteStep({ reflection }: { reflection: string | null }) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(360)} style={styles.step}>
      <View style={styles.completeMoon}>
        <LunarCompanion size={128} state="celebrating" />
      </View>
      <Text style={[typography.displayXl, styles.completeTitle]}>{t('log.ritual.completeTitle')}</Text>
      <Text style={typography.bodyLarge}>
        {reflection ?? t('log.ritual.completeBody')}
      </Text>
      <View style={[styles.savedBadge, { backgroundColor: colors.softRose }]}>
        <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
        <Text style={[typography.caption, { color: colors.primary }]}>{t('log.ritual.saved')}</Text>
      </View>
      <View style={styles.completionActions}>
        <Button label={t('log.ritual.returnOrbit')} onPress={() => router.push('/(tabs)/home')} />
        <Button label={t('log.ritual.askLuna')} variant="secondary" onPress={() => router.push('/(tabs)/ai')} />
      </View>
    </Animated.View>
  );
}

function Question({ title, helper }: { title: string; helper: string }) {
  const { typography } = useTheme();
  return (
    <View style={styles.question}>
      <Text style={typography.displayXl}>{title}</Text>
      <Text style={typography.bodyLarge}>{helper}</Text>
    </View>
  );
}

function RitualOption({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: IconName;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, typography, shadows } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        shadows.sm,
        {
          backgroundColor: selected ? colors.royalViolet : colors.surface.elevated,
          borderColor: selected ? colors.primary : colors.border,
        },
        pressed && styles.optionPressed,
      ]}
    >
      <View style={[styles.optionIcon, { backgroundColor: selected ? 'rgba(255,255,255,0.16)' : colors.softRose }]}>
        <Ionicons name={icon} size={20} color={selected ? colors.moonWhite : colors.primary} />
      </View>
      <Text
        numberOfLines={2}
        style={[
          typography.subtitle,
          styles.optionLabel,
          { color: selected ? colors.moonWhite : colors.textPrimary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function MiniChoice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, typography } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.miniChoice,
        {
          backgroundColor: selected ? colors.royalViolet : colors.surface.elevated,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[typography.caption, { color: selected ? colors.moonWhite : colors.textSecondary }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: spacing(12),
  },
  stage: {
    minHeight: 318,
    borderBottomLeftRadius: radius.sheet,
    borderBottomRightRadius: radius.sheet,
  },
  header: {
    paddingTop: spacing(2.5),
    paddingHorizontal: spacing(2.5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  headerMeta: {
    color: 'rgba(255,255,255,0.68)',
  },
  headerTitle: {
    color: '#FFF8F1',
    marginTop: 2,
  },
  progressBadge: {
    minWidth: 48,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: 'rgba(255,255,255,0.74)',
  },
  moonHeader: {
    alignItems: 'center',
    marginTop: spacing(2.5),
  },
  phaseStrip: {
    flexDirection: 'row',
    gap: spacing(0.75),
    marginTop: spacing(1),
  },
  phaseDot: {
    width: 22,
    height: 6,
    borderRadius: 3,
  },
  ritualSurface: {
    paddingHorizontal: spacing(2.5),
    marginTop: -spacing(4),
  },
  step: {
    borderRadius: radius.sheet,
    backgroundColor: '#FFFCF8',
    padding: spacing(3),
    gap: spacing(2.25),
    minHeight: 492,
    ...shadows.lg,
  },
  ctaWrap: {
    marginTop: 'auto',
  },
  question: {
    gap: spacing(1),
  },
  orbitOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1.25),
  },
  option: {
    width: '48%',
    minHeight: 104,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing(1.5),
    justifyContent: 'space-between',
  },
  optionPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.94,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 14,
    lineHeight: 19,
  },
  flowRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  miniChoice: {
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing(1.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderPanel: {
    gap: spacing(2.5),
  },
  journalInput: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing(2),
    minHeight: 180,
    textAlignVertical: 'top',
  },
  completeMoon: {
    alignSelf: 'center',
  },
  completeTitle: {
    textAlign: 'center',
  },
  savedBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.75),
    borderRadius: radius.pill,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1),
  },
  completionActions: {
    gap: spacing(1.25),
    marginTop: 'auto',
  },
});
