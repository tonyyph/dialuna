import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AuroraStage } from '@/components/lunar/AuroraStage';
import { OrbitalMark } from '@/components/ui/OrbitalMark';
import { spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface LoadingAuroraProps {
  label: string;
  fullScreen?: boolean;
}

export function LoadingAurora({ label, fullScreen = false }: LoadingAuroraProps) {
  const { colors, typography } = useTheme();

  const content = (
    <View style={styles.content} accessibilityRole="progressbar" accessibilityLabel={label}>
      <OrbitalMark size={fullScreen ? 118 : 72} state="thinking" />
      <ActivityIndicator color={colors.primary} />
      <Text style={[typography.caption, styles.label, { color: fullScreen ? 'rgba(255,255,255,0.72)' : colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );

  if (!fullScreen) {
    return <View style={styles.inline}>{content}</View>;
  }

  return <AuroraStage style={styles.full}>{content}</AuroraStage>;
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
    justifyContent: 'center',
  },
  inline: {
    padding: spacing(3),
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(1),
  },
  label: {
    textAlign: 'center',
  },
});
