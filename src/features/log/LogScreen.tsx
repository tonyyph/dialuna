import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { LevelSlider } from '@/components/ui/LevelSlider';
import { Screen } from '@/components/ui/Screen';
import { useCycleToday } from '@/features/cycle/useCycleToday';
import { generateLogReflection } from '@/services/aiCoachEngine';
import { useLogStore } from '@/store';
import { colors, radius, spacing, typography } from '@/theme';
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

const SYMPTOM_EMOJI: Record<Symptom, string> = {
  cramps: '🌀',
  headache: '🤕',
  bloating: '🎈',
  acne: '🫥',
  breastTenderness: '🌡️',
  backPain: '🦴',
  nausea: '🤢',
  fatigue: '🥱',
  moodSwings: '🎭',
  insomnia: '🌃',
};

const MOOD_EMOJI: Record<Mood, string> = {
  happy: '😊',
  calm: '😌',
  anxious: '😟',
  sad: '😢',
  angry: '😠',
  sensitive: '🥺',
};

const WORKOUT_EMOJI: Record<WorkoutType, string> = {
  none: '🛋️',
  walking: '🚶‍♀️',
  yoga: '🧘‍♀️',
  strength: '🏋️‍♀️',
  cardio: '🏃‍♀️',
  hiit: '🔥',
};

export function LogScreen() {
  const { t } = useTranslation();
  const today = todayISO();
  const existing = useLogStore((s) => s.logs[today]);
  const saveLog = useLogStore((s) => s.saveLog);
  const ctx = useCycleToday();

  const [flow, setFlow] = useState<FlowLevel>(existing?.flow ?? 'none');
  const [symptoms, setSymptoms] = useState<Symptom[]>(existing?.symptoms ?? []);
  const [moods, setMoods] = useState<Mood[]>(existing?.moods ?? []);
  const [energyLevel, setEnergyLevel] = useState(existing?.energyLevel ?? 5);
  const [sleepQuality, setSleepQuality] = useState(existing?.sleepQuality ?? 5);
  const [stressLevel, setStressLevel] = useState(existing?.stressLevel ?? 5);
  const [workoutType, setWorkoutType] = useState<WorkoutType>(
    existing?.workoutType ?? 'none'
  );
  const [note, setNote] = useState(existing?.note ?? '');
  const [reflection, setReflection] = useState<string | null>(null);

  const toggle = <T,>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  const onSave = () => {
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
  };

  return (
    <Screen
      keyboardAvoiding
      bottomAction={<Button label={t('log.save')} onPress={onSave} />}
    >
      <View style={styles.hero}>
        <Text style={styles.kicker}>{t('common.today')}</Text>
        <Text style={styles.title}>{t('log.title')}</Text>
        <Text style={styles.subtitle}>{t('log.subtitle')}</Text>
      </View>

      <Card variant="glass" style={styles.checkCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t('log.flow')}</Text>
          <Text style={styles.cardMeta}>{t(`flow.${flow}`)}</Text>
        </View>
        <View style={styles.chips}>
          {ALL_FLOW_LEVELS.map((level) => (
            <Chip
              key={level}
              label={t(`flow.${level}`)}
              selected={flow === level}
              onPress={() => setFlow(level)}
            />
          ))}
        </View>
      </Card>

      <Card style={styles.checkCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t('log.mood')}</Text>
          <Text style={styles.cardMeta}>{moods.length}</Text>
        </View>
        <View style={styles.chips}>
          {ALL_MOODS.map((mood) => (
            <Chip
              key={mood}
              label={t(`moods.${mood}`)}
              emoji={MOOD_EMOJI[mood]}
              selected={moods.includes(mood)}
              onPress={() => setMoods((m) => toggle(m, mood))}
            />
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t('log.symptoms')}</Text>
          <Text style={styles.cardMeta}>{symptoms.length}</Text>
        </View>
        <View style={styles.chips}>
          {ALL_SYMPTOMS.map((symptom) => (
            <Chip
              key={symptom}
              label={t(`symptoms.${symptom}`)}
              emoji={SYMPTOM_EMOJI[symptom]}
              selected={symptoms.includes(symptom)}
              onPress={() => setSymptoms((s) => toggle(s, symptom))}
            />
          ))}
        </View>
      </Card>

      <Card variant="glass" style={styles.sliders}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t('home.twinScore')}</Text>
          <Text style={styles.cardMeta}>{t('common.today')}</Text>
        </View>
        <LevelSlider
          label={t('log.energy')}
          value={energyLevel}
          onChange={setEnergyLevel}
        />
        <LevelSlider
          label={t('log.sleep')}
          value={sleepQuality}
          onChange={setSleepQuality}
        />
        <LevelSlider
          label={t('log.stress')}
          value={stressLevel}
          onChange={setStressLevel}
        />
      </Card>

      <Card style={styles.checkCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t('log.workout')}</Text>
          <Text style={styles.cardMeta}>{t(`workouts.${workoutType}`)}</Text>
        </View>
        <View style={styles.chips}>
          {ALL_WORKOUTS.map((workout) => (
            <Chip
              key={workout}
              label={t(`workouts.${workout}`)}
              emoji={WORKOUT_EMOJI[workout]}
              selected={workoutType === workout}
              onPress={() => setWorkoutType(workout)}
            />
          ))}
        </View>

        <Text style={styles.noteLabel}>{t('log.note')}</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder={t('log.notePlaceholder')}
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel={t('log.note')}
          multiline
        />
      </Card>

      {reflection && (
        <Animated.View entering={FadeInDown.duration(400)}>
          <Card variant="glass" style={styles.reflection}>
            <Text style={styles.reflectionTitle}>
              🌙 {t('log.reflectionTitle')}
            </Text>
            <Text style={styles.reflectionText}>{reflection}</Text>
          </Card>
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: spacing(1.5),
    marginBottom: spacing(2),
    padding: spacing(2.5),
    borderRadius: radius.sheet,
    backgroundColor: colors.deepPlum,
  },
  kicker: {
    ...typography.caption,
    color: colors.peach,
  },
  title: {
    ...typography.headline,
    color: colors.card,
    marginTop: spacing(0.5),
  },
  subtitle: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.78)',
    marginTop: spacing(0.5),
  },
  checkCard: {
    gap: spacing(1.5),
    marginBottom: spacing(2),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(2),
  },
  cardTitle: {
    ...typography.title,
  },
  cardMeta: {
    ...typography.caption,
    color: colors.primary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  sliders: {
    gap: spacing(2.5),
    marginBottom: spacing(2),
  },
  noteLabel: {
    ...typography.subtitle,
  },
  noteInput: {
    ...typography.body,
    backgroundColor: colors.glassStrong,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(2),
    minHeight: 96,
    textAlignVertical: 'top',
  },
  reflection: {
    marginTop: spacing(2),
    gap: spacing(1),
  },
  reflectionTitle: {
    ...typography.subtitle,
  },
  reflectionText: {
    ...typography.body,
  },
});
