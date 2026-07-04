import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, radius, spacing, typography } from '@/theme';
import { CyclePhase } from '@/types';

interface Props {
  phase: CyclePhase;
  pms?: boolean;
}

export function PhaseBadge({ phase, pms = false }: Props) {
  const { t } = useTranslation();
  const label = pms ? t('phases.pms') : t(`phases.${phase}`);
  const color = pms ? colors.peach : colors.phase[phase];
  const softColor = pms ? colors.phaseSoft.ovulation : colors.phaseSoft[phase];

  return (
    <View style={[styles.badge, { backgroundColor: softColor }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.75),
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
});
