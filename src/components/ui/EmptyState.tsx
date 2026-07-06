import { StyleSheet, Text, View } from 'react-native';

import { LunaOrb, LunaOrbState } from '@/components/mascot/LunaOrb';
import { spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface Props {
  lunaState?: LunaOrbState;
  title: string;
  body: string;
}

export function EmptyState({ lunaState = 'idle', title, body }: Props) {
  const { typography } = useTheme();
  return (
    <View style={styles.container}>
      <LunaOrb state={lunaState} size={88} />
      <Text style={[styles.title, typography.title]}>{title}</Text>
      <Text style={[styles.body, typography.body]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing(6),
    paddingHorizontal: spacing(4),
    gap: spacing(1),
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
  },
});
