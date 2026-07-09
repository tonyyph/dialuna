import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface Props {
  text: string;
}

export function DisclaimerBox({ text }: Props) {
  const { colors, typography } = useTheme();
  return (
    <View
      style={[styles.box, { backgroundColor: colors.phaseSoft.ovulation }]}
      accessibilityRole="text"
    >
      <Ionicons name="leaf" size={15} color={colors.semantic.info} style={styles.icon} />
      <Text style={[styles.text, typography.caption]}>{text}</Text>
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
  icon: {
    marginTop: 1,
  },
  text: {
    flex: 1,
  },
});
