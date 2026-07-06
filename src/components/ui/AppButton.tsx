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

import { radius, sizes, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

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
  const { colors, typography, shadows } = useTheme();
  const inactive = disabled || loading;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const variantStyle: Record<AppButtonVariant, ViewStyle> = {
    primary: { backgroundColor: colors.primary, ...shadows.glow },
    secondary: { backgroundColor: colors.softRose, borderWidth: 1, borderColor: colors.glassBorder },
    ghost: { backgroundColor: 'transparent' },
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
        variantStyle[variant],
        inactive && styles.disabled,
        pressed && !inactive && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.card : colors.primary} />
      ) : (
        <Text
          style={[
            styles.label,
            typography.button,
            { color: variant === 'primary' ? colors.card : colors.primary },
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
    minHeight: sizes.buttonHeight,
    borderRadius: radius.lg,
    paddingHorizontal: spacing(3),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
    textAlign: 'center',
  },
});
