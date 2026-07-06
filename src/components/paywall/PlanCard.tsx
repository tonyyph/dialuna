import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface Props {
  title: string;
  price: string;
  period: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
}

export function PlanCard({ title, price, period, badge, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title} ${price} ${period}`}
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={[styles.card, selected && styles.selected]}
    >
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.price}>{price}</Text>
      <Text style={styles.period}>{period}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing(2),
    alignItems: 'center',
    gap: spacing(0.5),
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.softRose,
  },
  badge: {
    position: 'absolute',
    top: -12,
    backgroundColor: colors.mint,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(1),
    paddingVertical: 2,
  },
  badgeText: {
    ...typography.caption,
    color: colors.deepPlum,
    fontWeight: '700',
    fontSize: 10,
  },
  title: {
    ...typography.caption,
    marginTop: spacing(0.5),
  },
  price: {
    ...typography.subtitle,
  },
  period: {
    ...typography.caption,
  },
});
