import { format, parseISO } from 'date-fns';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PhaseBadge } from '@/components/cycle/PhaseBadge';
import { MoonSheet } from '@/components/lunar/MoonSheet';
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
  const { typography } = useTheme();
  const profile = useUserStore((s) => s.profile);
  const logs = useLogStore((s) => s.logs);

  if (!date || !profile) return null;

  const twin = getHormoneTwinProfile({ date, profile, logs });
  const isToday = date === todayISO();

  return (
    <MoonSheet visible onClose={onClose} accessibilityLabel={t('common.close')}>
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
    </MoonSheet>
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
