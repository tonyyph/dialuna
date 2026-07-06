import { StyleSheet, Text } from 'react-native';

import { spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface Props {
  title: string;
}

export function SectionTitle({ title }: Props) {
  const { typography } = useTheme();
  return (
    <Text style={[styles.title, typography.title]} accessibilityRole="header">
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing(3),
    marginBottom: spacing(1.5),
  },
});
