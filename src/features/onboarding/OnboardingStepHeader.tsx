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
      <View style={styles.dots}>
        {[1, 2, 3, 4].map((n) => (
          <View
            key={n}
            style={[
              styles.dot,
              { backgroundColor: n === step ? p.accent : p.fillSubtle },
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
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  spacer: { width: 38 },
});
