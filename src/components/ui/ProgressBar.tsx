import { StyleSheet, View } from 'react-native';

import { radius as radiusTokens, useTheme } from '@/theme';

interface ProgressBarProps {
  value: number;
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  trackColor?: string;
  thickness?: number;
  length?: number;
  radius?: number;
}

export function ProgressBar({
  value,
  orientation = 'horizontal',
  color,
  trackColor,
  thickness = 8,
  length = 64,
  radius = radiusTokens.pill,
}: ProgressBarProps) {
  const p = useTheme();
  const fill = color ?? p.accent;
  const track = trackColor ?? p.track;
  const clamped = Math.max(0, Math.min(100, value));
  const isVertical = orientation === 'vertical';

  return (
    <View
      style={[
        styles.track,
        { borderRadius: radius, backgroundColor: track },
        isVertical
          ? { width: thickness, height: length, justifyContent: 'flex-end' }
          : { height: thickness, width: '100%' },
      ]}
    >
      <View
        style={[
          { borderRadius: radius, backgroundColor: fill },
          isVertical ? { height: `${clamped}%`, width: '100%' } : { width: `${clamped}%`, height: '100%' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
  },
});
