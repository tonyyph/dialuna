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

import { colors, radius, shadows, sizes, spacing, typography } from '@/theme';

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
        styles[variant],
        inactive && styles.disabled,
        pressed && !inactive && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.card : colors.primary} />
      ) : (
        <Text style={[styles.label, variant !== 'primary' && styles.labelAlt]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.buttonHeight,
    borderRadius: radius.lg,
    paddingHorizontal: spacing(3),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primary: {
    backgroundColor: colors.primary,
    ...shadows.glow,
  },
  secondary: {
    backgroundColor: colors.softRose,
    borderWidth: 1,
    borderColor: colors.glassBorder,
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
    opacity: 0.94,
    transform: [{ scale: 0.975 }],
  },
  label: {
    ...typography.button,
    color: colors.card,
    textAlign: 'center',
  },
  labelAlt: {
    color: colors.primary,
  },
});
