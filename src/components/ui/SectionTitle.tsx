import { StyleSheet, Text } from 'react-native';

import { spacing, typography, useTheme } from '@/theme';

interface Props {
  title: string;
}

export function SectionTitle({ title }: Props) {
  const p = useTheme();
  return (
    <Text style={[styles.title, { color: p.textFaint }]} accessibilityRole="header">
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.kicker, marginTop: spacing(3), marginBottom: spacing(1) },
});
