import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { radius, spacing, typography, useTheme } from '@/theme';

interface Props {
  role: 'user' | 'coach';
  text: string;
}

export function MessageBubble({ role, text }: Props) {
  const p = useTheme();
  const isUser = role === 'user';
  return (
    <Animated.View
      entering={FadeInDown.duration(260)}
      style={[styles.row, isUser && styles.rowUser]}
    >
      <View
        style={[
          styles.bubble,
          { backgroundColor: isUser ? p.accent100 : p.surfaceStrong },
        ]}
      >
        <Text style={[styles.text, { color: isUser ? p.accent800 : p.text }]}>
          {text}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: spacing(1.25) },
  rowUser: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.md,
    paddingHorizontal: spacing(1.75),
    paddingVertical: spacing(1.4),
  },
  text: { ...typography.bodySmall, fontSize: 13.5, lineHeight: 20 },
});
