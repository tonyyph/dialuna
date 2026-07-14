import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  WithSpringConfig,
} from 'react-native-reanimated';

import {
  colors,
  duration,
  gradients,
  radiusV2,
  SemanticColorSet,
  semanticColors,
  shadowsV2,
  springV2,
  typographyV2,
} from '@/theme';

type ThemeMode = 'light' | 'dark';

export default function DesignShowcase() {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const theme = semanticColors[mode];

  return (
    <ScrollView
      style={{ backgroundColor: theme.background.canvas }}
      contentContainerStyle={styles.content}
    >
      <View style={styles.row}>
        <Text style={[typographyV2.titleL, { color: theme.content.primary }]}>
          Design Showcase (v2)
        </Text>
        <ThemeToggle mode={mode} onChange={setMode} theme={theme} />
      </View>

      <Section title="Colors (raw)" theme={theme}>
        <View style={styles.swatchRow}>
          {Object.entries(colors).map(([name, hex]) => (
            <Swatch key={name} label={name} color={hex} theme={theme} />
          ))}
        </View>
      </Section>

      <Section title="Semantic colors (current theme)" theme={theme}>
        <View style={styles.swatchRow}>
          <Swatch label="background.canvas" color={theme.background.canvas} theme={theme} />
          <Swatch label="background.elevated" color={theme.background.elevated} theme={theme} />
          <Swatch label="brand.primary" color={theme.brand.primary} theme={theme} />
          <Swatch label="brand.secondary" color={theme.brand.secondary} theme={theme} />
          <Swatch label="brand.accent" color={theme.brand.accent} theme={theme} />
          <Swatch label="signal.period" color={theme.signal.period} theme={theme} />
          <Swatch label="signal.warning" color={theme.signal.warning} theme={theme} />
        </View>
      </Section>

      <Section title="Gradients" theme={theme}>
        <GradientSwatch label="nightField — hierarchy" colors={gradients.nightField} theme={theme} />
        <GradientSwatch label="irisDepth — depth" colors={gradients.irisDepth} theme={theme} />
        <GradientSwatch label="aquaMist — state (recovery)" colors={gradients.aquaMist} theme={theme} />
        <GradientSwatch label="coralHalo — attention (biological)" colors={gradients.coralHalo} theme={theme} />
        <GradientSwatch label="lunarSheen — focus" colors={gradients.lunarSheen} theme={theme} />
      </Section>

      <Section title="Radius" theme={theme}>
        <View style={styles.swatchRow}>
          {Object.entries(radiusV2).map(([name, value]) => (
            <View key={name} style={styles.radiusItem}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: Math.min(value, 32),
                  backgroundColor: theme.surface.raised,
                }}
              />
              <Text style={[typographyV2.micro, { color: theme.content.tertiary }]}>
                {name} ({value})
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Shadows" theme={theme}>
        <View style={styles.swatchRow}>
          {(['base', 'elevated', 'floating'] as const).map((tier) => (
            <View
              key={tier}
              style={[
                styles.shadowSample,
                { backgroundColor: theme.surface.raised },
                shadowsV2[tier],
              ]}
            >
              <Text style={[typographyV2.micro, { color: theme.content.secondary }]}>{tier}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Typography" theme={theme}>
        {Object.entries(typographyV2).map(([name, style]) => (
          <Text key={name} style={[style, { color: theme.content.primary }]}>
            {name} — Aa 123
          </Text>
        ))}
      </Section>

      <Section title="Motion" theme={theme}>
        <View style={styles.swatchRow}>
          <SpringDemo label="responsive" config={springV2.responsive} theme={theme} />
          <SpringDemo label="fluid" config={springV2.fluid} theme={theme} />
          <SpringDemo label="gentle" config={springV2.gentle} theme={theme} />
        </View>
        <DurationDemo theme={theme} />
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  theme,
  children,
}: {
  title: string;
  theme: SemanticColorSet;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[typographyV2.labelL, { color: theme.content.secondary }]}>{title}</Text>
      {children}
    </View>
  );
}

function Swatch({ label, color, theme }: { label: string; color: string; theme: SemanticColorSet }) {
  return (
    <View style={styles.swatchItem}>
      <View
        style={[styles.swatchColor, { backgroundColor: color, borderColor: theme.border.subtle }]}
      />
      <Text style={[typographyV2.micro, { color: theme.content.tertiary }]}>{label}</Text>
    </View>
  );
}

function GradientSwatch({
  label,
  colors: stops,
  theme,
}: {
  label: string;
  colors: readonly [string, string, ...string[]];
  theme: SemanticColorSet;
}) {
  return (
    <View style={styles.gradientBlock}>
      <LinearGradient colors={stops} style={styles.gradientSwatch} />
      <Text style={[typographyV2.labelM, { color: theme.content.secondary }]}>{label}</Text>
    </View>
  );
}

function ThemeToggle({
  mode,
  onChange,
  theme,
}: {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
  theme: SemanticColorSet;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Toggle light/dark preview"
      onPress={() => onChange(mode === 'dark' ? 'light' : 'dark')}
      style={[styles.toggle, { borderColor: theme.border.strong }]}
    >
      <Text style={[typographyV2.labelM, { color: theme.content.primary }]}>
        {mode === 'dark' ? 'Dark' : 'Light'}
      </Text>
    </Pressable>
  );
}

function SpringDemo({
  label,
  config,
  theme,
}: {
  label: string;
  config: WithSpringConfig;
  theme: SemanticColorSet;
}) {
  const offset = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return (
    <View style={styles.springItem}>
      <Animated.View
        style={[styles.springDot, { backgroundColor: theme.brand.primary }, animatedStyle]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Play ${label} spring`}
        onPress={() => {
          // Reanimated shared values are mutated via `.value` by design (not React state).
          // eslint-disable-next-line react-hooks/immutability
          offset.value = withSpring(offset.value === 0 ? -24 : 0, config);
        }}
        style={[styles.springButton, { borderColor: theme.border.subtle }]}
      >
        <Text style={[typographyV2.micro, { color: theme.content.secondary }]}>{label}</Text>
      </Pressable>
    </View>
  );
}

function DurationDemo({ theme }: { theme: SemanticColorSet }) {
  const width = useSharedValue(40);
  const animatedStyle = useAnimatedStyle(() => ({ width: width.value }));

  return (
    <View style={styles.durationItem}>
      <Animated.View
        style={[styles.durationBar, { backgroundColor: theme.brand.accent }, animatedStyle]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Play duration.expressive"
        onPress={() => {
          // eslint-disable-next-line react-hooks/immutability -- see SpringDemo above
          width.value = withTiming(width.value === 40 ? 220 : 40, {
            duration: duration.expressive,
          });
        }}
        style={[styles.springButton, { borderColor: theme.border.subtle }]}
      >
        <Text style={[typographyV2.micro, { color: theme.content.secondary }]}>
          duration.expressive ({duration.expressive}ms)
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 24, paddingBottom: 80 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggle: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderRadius: 999 },
  section: { gap: 12 },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatchItem: { alignItems: 'center', gap: 4, width: 72 },
  swatchColor: { width: 48, height: 48, borderRadius: 12, borderWidth: 1 },
  gradientBlock: { gap: 4, marginBottom: 8 },
  gradientSwatch: { height: 64, borderRadius: 16 },
  radiusItem: { alignItems: 'center', gap: 4 },
  shadowSample: {
    width: 96,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  springItem: { alignItems: 'center', gap: 8 },
  springDot: { width: 16, height: 16, borderRadius: 8 },
  springButton: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderRadius: 8 },
  durationItem: { gap: 8, marginTop: 12 },
  durationBar: { height: 12, borderRadius: 6 },
});
