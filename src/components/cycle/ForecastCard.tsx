import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/theme';

interface Props {
  emoji: string;
  label: string;
  /** 0-100; higher is better (invert pain before passing). */
  score: number;
}

function levelKey(score: number): string {
  if (score < 45) return 'home.level.low';
  if (score < 65) return 'home.level.steady';
  return 'home.level.high';
}

export function ForecastCard({ emoji, label, score }: Props) {
  const { t } = useTranslation();
  return (
    <Card style={styles.card}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.level}>{t(levelKey(score))}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${score}%` }]} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: spacing(0.5),
    padding: spacing(2),
  },
  emoji: {
    fontSize: 22,
  },
  label: {
    ...typography.caption,
  },
  level: {
    ...typography.h3,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.softRose,
    marginTop: spacing(0.5),
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
