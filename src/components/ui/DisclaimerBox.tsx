import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useTheme } from '@/theme';

interface Props {
  text: string;
}

export function DisclaimerBox({ text }: Props) {
  const p = useTheme();
  return (
    <View
      style={[styles.box, { backgroundColor: p.surface }]}
      accessibilityRole="text"
    >
      <Ionicons name="shield-checkmark-outline" size={18} color={p.accentInk} />
      <Text style={[styles.text, { color: p.textMuted }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    gap: spacing(1),
    borderRadius: radius.md,
    padding: spacing(1.5),
    alignItems: 'flex-start',
  },
  text: {
    ...typography.caption,
    flex: 1,
  },
});
