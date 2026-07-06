import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/Card';
import { spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

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
  const { colors, typography } = useTheme();
  return (
    <Card style={styles.card}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={typography.caption}>{label}</Text>
      <Text style={typography.subtitle}>{t(levelKey(score))}</Text>
      <View style={[styles.barTrack, { backgroundColor: colors.softRose }]}>
        <View style={[styles.barFill, { width: `${score}%`, backgroundColor: colors.primary }]} />
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
  barTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: spacing(0.5),
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
