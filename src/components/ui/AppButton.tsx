import * as Haptics from 'expo-haptics';
import { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { radius, shadows, spacing, typography, useTheme } from '@/theme';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: PropsWithChildren<AppButtonProps>) {
  const p = useTheme();
  const inactive = disabled || loading;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && { backgroundColor: p.primaryBtn, ...shadows.button },
        variant === 'secondary' && { backgroundColor: p.surfaceStrong, ...shadows.tiny },
        variant === 'ghost' && styles.ghost,
        inactive && styles.disabled,
        pressed && !inactive && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? p.onPrimaryBtn : p.accent} />
      ) : (
        <Text
          style={[
            styles.label,
            { color: variant === 'primary' ? p.onPrimaryBtn : p.text },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.button,
    paddingHorizontal: spacing(3),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.48,
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.95,
  },
  label: {
    ...typography.button,
    textAlign: 'center',
  },
});
