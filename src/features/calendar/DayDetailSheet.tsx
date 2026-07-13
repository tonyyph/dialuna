import { format, parseISO } from 'date-fns';
import { router } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PhaseBadge } from '@/components/cycle/PhaseBadge';
import { Button } from '@/components/ui/Button';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';
import { getHormoneTwinProfile } from '@/services/hormoneTwinEngine';
import { useLogStore, useUserStore } from '@/store';
import { radius, spacing, typography, useTheme } from '@/theme';
import { todayISO } from '@/utils/date';

interface Props {
  date: string | null;
  onClose: () => void;
}

export function DayDetailSheet({ date, onClose }: Props) {
  const { t } = useTranslation();
  const p = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useUserStore((s) => s.profile);
  const logs = useLogStore((s) => s.logs);

  if (!date || !profile) return null;

  const twin = getHormoneTwinProfile({ date, profile, logs });
  const isToday = date === todayISO();

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, { backgroundColor: p.overlay }]}
        onPress={onClose}
        accessibilityLabel={t('common.close')}
      />
      <Animated.View
        entering={SlideInDown.springify().damping(17).stiffness(150)}
        style={[
          styles.sheet,
          { backgroundColor: p.surfaceStrong, paddingBottom: Math.max(insets.bottom + spacing(3), spacing(5)) },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: p.textFaint }]} />
        <Text style={[styles.date, { color: p.text }]}>{format(parseISO(date), 'EEEE, MMM d')}</Text>
        <View style={styles.badgeRow}>
          <PhaseBadge phase={twin.phase} pms={twin.isPmsWindow} />
          <Text style={[styles.cycleDay, { color: p.textMuted }]}>
            {t('common.cycleDay', { day: twin.cycleDay })}
          </Text>
        </View>

        <View style={styles.scores}>
          <ScoreRow label={t('home.forecast.energy')} value={twin.energyScore} />
          <ScoreRow label={t('home.forecast.mood')} value={twin.moodScore} />
          <ScoreRow label={t('home.forecast.focus')} value={twin.focusScore} />
          <ScoreRow label={t('home.forecast.pain')} value={100 - twin.painRisk} />
        </View>

        <Text style={[styles.coach, { color: p.text }]}>{t(twin.coachMessageKey)}</Text>
        <DisclaimerBox text={t('disclaimer.predictions')} />

        {isToday && (
          <Button
            label={t('calendar.detail.logDay')}
            onPress={() => {
              onClose();
              router.push('/(tabs)/log');
            }}
            style={styles.cta}
          />
        )}
      </Animated.View>
    </Modal>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  const p = useTheme();
  return (
    <View style={styles.scoreRow}>
      <Text style={[styles.scoreLabel, { color: p.textMuted }]}>{label}</Text>
      <View style={[styles.scoreTrack, { backgroundColor: p.accent100 }]}>
        <View style={[styles.scoreFill, { width: `${value}%`, backgroundColor: p.accent }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    padding: spacing(3),
    gap: spacing(1.5),
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
  },
  date: {
    ...typography.title,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
  },
  cycleDay: {
    ...typography.bodySmall,
  },
  scores: {
    gap: spacing(1),
    marginVertical: spacing(1),
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
  },
  scoreLabel: {
    ...typography.caption,
    width: 84,
  },
  scoreTrack: {
    flex: 1,
    height: 8,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  coach: {
    ...typography.bodySmall,
  },
  cta: {
    marginTop: spacing(1),
  },
});
