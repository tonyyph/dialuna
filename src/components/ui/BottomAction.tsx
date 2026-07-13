import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { sizes, spacing } from '@/theme';

interface BottomActionProps {
  style?: StyleProp<ViewStyle>;
}

export function BottomAction({ children, style }: PropsWithChildren<BottomActionProps>) {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={FadeInUp.duration(260)}
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
