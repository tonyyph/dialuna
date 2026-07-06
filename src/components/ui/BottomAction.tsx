import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, shadows, sizes, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface BottomActionProps {
  style?: StyleProp<ViewStyle>;
}

export function BottomAction({ children, style }: PropsWithChildren<BottomActionProps>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={FadeInUp.duration(260)}
      style={[
        styles.wrap,
        { backgroundColor: colors.glass, borderTopColor: colors.glassBorder },
        { paddingBottom: Math.max(insets.bottom, spacing(1.5)) },
        style,
      ]}
    >
      <View style={styles.surface}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: sizes.screenPadding,
    paddingTop: spacing(1.25),
    borderTopWidth: 1,
  },
  surface: {
    borderRadius: radius.card,
    ...shadows.xs,
  },
});
