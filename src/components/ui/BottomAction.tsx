import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { duration, sizes, spacing } from '@/theme';

interface BottomActionProps {
  style?: StyleProp<ViewStyle>;
}

export function BottomAction({ children, style }: PropsWithChildren<BottomActionProps>) {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={FadeInUp.duration(duration.quick)}
      style={[
        styles.wrap,
        { paddingBottom: Math.max(insets.bottom, spacing(1.5)) },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: sizes.screenPadding,
    paddingTop: spacing(1.25),
    backgroundColor: 'transparent',
  },
});
