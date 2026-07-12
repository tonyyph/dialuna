import { StyleSheet, Text, View } from 'react-native';

import { Luna, LunaExpression } from '@/components/mascot/Luna';
import { spacing, typography, useTheme } from '@/theme';

interface Props {
  lunaExpression?: LunaExpression;
  title: string;
  body: string;
}

export function EmptyState({ lunaExpression = 'happy', title, body }: Props) {
  const p = useTheme();
  return (
    <View style={styles.container}>
      <Luna expression={lunaExpression} size={88} />
      <Text style={[styles.title, { color: p.text }]}>{title}</Text>
      <Text style={[styles.body, { color: p.textMuted }]}>{body}</Text>
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
  title: {
    ...typography.title,
    textAlign: 'center',
  },
  body: {
    ...typography.bodySmall,
    textAlign: 'center',
  },
});
