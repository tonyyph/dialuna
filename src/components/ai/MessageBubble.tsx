import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface Props {
  role: 'user' | 'coach';
  text: string;
}

export function MessageBubble({ role, text }: Props) {
  const { colors, typography } = useTheme();
  const isUser = role === 'user';
  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.softRose }]}>
          <Ionicons name="moon" size={15} color={colors.primary} />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: colors.primary, borderBottomRightRadius: radius.sm }
            : {
                backgroundColor: colors.glassStrong,
                borderWidth: 1,
                borderColor: colors.glassBorder,
                borderBottomLeftRadius: radius.sm,
              },
        ]}
      >
        <Text style={[typography.bodyLarge, styles.text, isUser && { color: colors.card }]}>
          {text}
        </Text>
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
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
});
