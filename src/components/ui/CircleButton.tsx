import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { shadows, useTheme } from '@/theme';

import { Pressable } from './Pressable';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  /** Accessibility label — required, icon-only button. */
  label: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function CircleButton({ icon, onPress, label, size = 38, style }: Props) {
  const p = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      scaleTo={0.94}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: p.surfaceStrong,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={Math.round(size * 0.42)} color={p.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', ...shadows.tiny },
});
