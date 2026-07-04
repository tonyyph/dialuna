import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '@/theme';

interface Props {
  emoji: string;
  title: string;
  body: string;
}

export function EmptyState({ emoji, title, body }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing(6),
    paddingHorizontal: spacing(4),
    gap: spacing(1),
  },
  emoji: {
    fontSize: 44,
    marginBottom: spacing(1),
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
  },
  body: {
    ...typography.bodySmall,
    textAlign: 'center',
  },
});
