import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface Props {
  title: string;
  price: string;
  period: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
}

export function PlanCard({ title, price, period, badge, selected, onPress }: Props) {
  const { colors, typography } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title} ${price} ${period}`}
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        selected && { borderColor: colors.primary, backgroundColor: colors.softRose },
        pressed && styles.pressed,
      ]}
    >
      {badge ? (
        <View style={[styles.badge, { backgroundColor: colors.mint }]}>
          <Text style={[typography.caption, styles.badgeText, { color: colors.deepPlum }]}>
            {badge}
          </Text>
        </View>
      ) : null}
      <Text style={[typography.caption, styles.title]}>{title}</Text>
      <Text style={typography.subtitle}>{price}</Text>
      <Text style={typography.caption}>{period}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.card,
    borderWidth: 2,
    padding: spacing(2),
    alignItems: 'center',
    gap: spacing(0.5),
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  badge: {
    position: 'absolute',
    top: -12,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(1),
    paddingVertical: 2,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 10,
  },
  title: {
    marginTop: spacing(0.5),
  },
});
