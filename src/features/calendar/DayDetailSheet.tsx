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
import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { todayISO } from '@/utils/date';

interface Props {
  date: string | null;
  onClose: () => void;
}

export function DayDetailSheet({ date, onClose }: Props) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useUserStore((s) => s.profile);
  const logs = useLogStore((s) => s.logs);

  if (!date || !profile) return null;

  const twin = getHormoneTwinProfile({ date, profile, logs });
  const isToday = date === todayISO();

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        onPress={onClose}
        accessibilityLabel={t('common.close')}
      />
      <Animated.View
        entering={SlideInDown.springify().damping(17).stiffness(150)}
        style={[
          styles.sheet,
          { backgroundColor: colors.glassStrong, borderColor: colors.glassBorder },
          { paddingBottom: Math.max(insets.bottom + spacing(3), spacing(5)) },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <Text style={typography.title}>{format(parseISO(date), 'EEEE, MMM d')}</Text>
        <View style={styles.badgeRow}>
          <PhaseBadge phase={twin.phase} pms={twin.isPmsWindow} />
          <Text style={typography.body}>
            {t('common.cycleDay', { day: twin.cycleDay })}
          </Text>
        </View>

        <View style={styles.scores}>
          <ScoreRow label={t('home.forecast.energy')} value={twin.energyScore} />
          <ScoreRow label={t('home.forecast.mood')} value={twin.moodScore} />
          <ScoreRow label={t('home.forecast.focus')} value={twin.focusScore} />
          <ScoreRow label={t('home.forecast.pain')} value={100 - twin.painRisk} />
        </View>

        <Text style={typography.body}>{t(twin.coachMessageKey)}</Text>
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
  const { colors, typography } = useTheme();
  return (
    <View style={styles.scoreRow}>
      <Text style={[typography.caption, styles.scoreLabel]}>{label}</Text>
      <View style={[styles.scoreTrack, { backgroundColor: colors.softRose }]}>
        <View style={[styles.scoreFill, { width: `${value}%`, backgroundColor: colors.primary }]} />
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
    borderWidth: 1,
    padding: spacing(3),
    gap: spacing(1.5),
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
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
  cta: {
    marginTop: spacing(1),
  },
});
