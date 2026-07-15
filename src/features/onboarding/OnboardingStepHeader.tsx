import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CircleButton } from '@/components/ui/CircleButton';
import { spacing, useTheme } from '@/theme';

interface Props {
  /** 1-based index into the four dotted steps. */
  step: 1 | 2 | 3 | 4;
}

export function OnboardingStepHeader({ step }: Props) {
  const { t } = useTranslation();
  const p = useTheme();
  return (
    <View style={styles.row}>
      <CircleButton icon="chevron-back" label={t('common.back')} onPress={() => router.back()} />
      <View style={styles.sequence} accessibilityLabel={t('living.calibrationProgress', { step })}>
        {[1, 2, 3, 4].map((n) => (
          <View
            key={n}
            style={[
              styles.segment,
              { backgroundColor: n <= step ? p.accent : p.fillSubtle, height: n === step ? 4 : 2 },
            ]}
          />
        ))}
      </View>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing(1),
    paddingBottom: spacing(1),
  },
  sequence: { width: 112, flexDirection: 'row', alignItems: 'center', gap: 4 },
  segment: { flex: 1, borderRadius: 2 },
  spacer: { width: 38 },
});
