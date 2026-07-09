import { PropsWithChildren } from 'react';
import { Modal, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface MoonSheetProps {
  visible: boolean;
  onClose: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

export function MoonSheet({
  visible,
  onClose,
  accessibilityLabel,
  style,
  children,
}: PropsWithChildren<MoonSheetProps>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      />
      <Animated.View
        entering={SlideInDown.springify().damping(17).stiffness(150)}
        style={[
          styles.sheet,
          { backgroundColor: colors.glassStrong, borderColor: colors.glassBorder },
          { paddingBottom: Math.max(insets.bottom + spacing(3), spacing(5)) },
          style,
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    borderWidth: 1,
    padding: spacing(3),
    gap: spacing(1.5),
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: radius.pill,
  },
});

