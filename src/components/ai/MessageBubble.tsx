import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface Props {
  role: 'user' | 'coach';
  text: string;
}

export function MessageBubble({ role, text }: Props) {
  const isUser = role === 'user';
  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && <Text style={styles.avatar}>🌙</Text>}
      <View style={[styles.bubble, isUser ? styles.user : styles.coach]}>
        <Text style={[styles.text, isUser && styles.textUser]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing(1),
    marginBottom: spacing(1.5),
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    fontSize: 20,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
  },
  user: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radius.sm,
  },
  coach: {
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderBottomLeftRadius: radius.sm,
  },
  text: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 21,
  },
  textUser: {
    color: colors.card,
  },
});
