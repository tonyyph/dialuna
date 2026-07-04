import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface Props {
  text: string;
}

export function DisclaimerBox({ text }: Props) {
  return (
    <View style={styles.box} accessibilityRole="text">
      <Text style={styles.icon}>🌿</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    gap: spacing(1),
    backgroundColor: colors.phaseSoft.ovulation,
    borderRadius: radius.md,
    padding: spacing(1.5),
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 14,
    marginTop: 1,
  },
  text: {
    ...typography.caption,
    flex: 1,
  },
});
