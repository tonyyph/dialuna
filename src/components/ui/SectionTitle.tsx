import { StyleSheet, Text } from 'react-native';

import { spacing, typography } from '@/theme';

interface Props {
  title: string;
}

export function SectionTitle({ title }: Props) {
  return (
    <Text style={styles.title} accessibilityRole="header">
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    marginTop: spacing(3),
    marginBottom: spacing(1.5),
  },
});
