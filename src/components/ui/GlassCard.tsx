import { PropsWithChildren } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { Card } from './Card';

interface GlassCardProps {
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  gradient?: boolean;
}

/** Legacy wrapper — the redesign has a single soft-card surface. */
export function GlassCard({ children, style }: PropsWithChildren<GlassCardProps>) {
  return <Card style={style}>{children}</Card>;
}
