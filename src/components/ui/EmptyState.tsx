import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useTheme } from '@/theme';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}

export function EmptyState({ icon = 'sparkles-outline', title, body }: Props) {
  const p = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: p.accent100 }]}>
        <Ionicons name={icon} size={40} color={p.accent} />
      </View>
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
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(1),
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
