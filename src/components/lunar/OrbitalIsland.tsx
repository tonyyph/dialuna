import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

type IconName = keyof typeof Ionicons.glyphMap;

interface OrbitalIslandProps {
  icon: IconName;
  label: string;
  value?: string;
  accent: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  active?: boolean;
}

export function OrbitalIsland({
  icon,
  label,
  value,
  accent,
  onPress,
  style,
  active = false,
}: OrbitalIslandProps) {
  const { colors, typography, shadows } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}. ${value}` : label}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.pressable,
        style,
        pressed && styles.pressed,
        active && styles.active,
      ]}
    >
      <View
        style={[
          styles.surface,
          shadows.sm,
          {
            backgroundColor: colors.glass,
            borderColor: active ? accent : 'rgba(255,255,255,0.18)',
          },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${accent}24` }]}>
          <Ionicons name={icon} size={20} color={accent} />
        </View>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={[typography.subtitle, styles.label, { color: colors.text.onDark }]}>
            {label}
          </Text>
          {value ? (
            <Text numberOfLines={1} style={[typography.caption, styles.value]}>
              {value}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    minWidth: 132,
    minHeight: 76,
  },
  surface: {
    minHeight: 76,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.96 }, { translateY: 2 }],
    opacity: 0.94,
  },
  active: {
    transform: [{ scale: 1.03 }],
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 13,
    lineHeight: 17,
  },
  value: {
    color: 'rgba(255,255,255,0.68)',
    marginTop: 2,
  },
});
