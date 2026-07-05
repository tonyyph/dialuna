import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { spacing } from '@/theme';

interface Props {
  style?: ViewStyle;
}

export function ChipGroup({ children, style }: PropsWithChildren<Props>) {
  return <View style={[styles.wrap, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
});
