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
import { radius, spacing } from '@/theme';
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

const SYMPTOM_EMOJI: Record<Symptom, string> = {
  cramps: '🌀',
  headache: '🤕',
  bloating: '🎈',
  acne: '🫥',
  breastTenderness: '🌡️',
  backPain: '🦴',
  nausea: '🤢',
  fatigue: '🥱',
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
  const { colors, typography } = useTheme();
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
      <View style={[styles.hero, { backgroundColor: colors.royalViolet }]}>
        <Text style={[typography.caption, { color: colors.softPeach }]}>
          {t('common.today')}
        </Text>
        <Text style={[typography.headline, styles.title, { color: colors.moonWhite }]}>
          {t('log.title')}
        </Text>
        <Text style={[typography.body, styles.subtitle]}>{t('log.subtitle')}</Text>
      </View>

      <Card variant="glass" style={styles.checkCard}>
        <View style={styles.cardHeader}>
          <Text style={typography.title}>{t('log.flow')}</Text>
          <Text style={[typography.caption, { color: colors.primary }]}>{t(`flow.${flow}`)}</Text>
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
          <Text style={typography.title}>{t('log.mood')}</Text>
          <Text style={[typography.caption, { color: colors.primary }]}>{moods.length}</Text>
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

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        <View style={styles.cardHeader}>
          <Text style={typography.title}>{t('log.symptoms')}</Text>
          <Text style={[typography.caption, { color: colors.primary }]}>{symptoms.length}</Text>
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
          <Text style={typography.title}>{t('home.twinScore')}</Text>
          <Text style={[typography.caption, { color: colors.primary }]}>{t('common.today')}</Text>
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
          <Text style={typography.title}>{t('log.workout')}</Text>
          <Text style={[typography.caption, { color: colors.primary }]}>
            {t(`workouts.${workoutType}`)}
          </Text>
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

        <Text style={typography.subtitle}>{t('log.note')}</Text>
        <TextInput
          style={[
            typography.bodyLarge,
            styles.noteInput,
            { backgroundColor: colors.glassStrong, borderColor: colors.border },
          ]}
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
            <Text style={typography.subtitle}>
              🌙 {t('log.reflectionTitle')}
            </Text>
            <Text style={typography.bodyLarge}>{reflection}</Text>
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
  },
  title: {
    marginTop: spacing(0.5),
  },
  subtitle: {
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  divider: {
    height: 1,
  },
  sliders: {
    gap: spacing(2.5),
    marginBottom: spacing(2),
  },
  noteInput: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing(2),
    minHeight: 96,
    textAlignVertical: 'top',
  },
  reflection: {
    marginTop: spacing(2),
    gap: spacing(1),
  },
});
