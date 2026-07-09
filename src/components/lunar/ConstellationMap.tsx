import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface ConstellationNode {
  x: number;
  y: number;
  color: string;
  label: string;
  active?: boolean;
  locked?: boolean;
}

interface ConstellationMapProps {
  nodes: ConstellationNode[];
  accessibilityLabel: string;
}

export function ConstellationMap({ nodes, accessibilityLabel }: ConstellationMapProps) {
  return (
    <View style={styles.map} accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      {nodes.map((node) => (
        <StarNode key={node.label} {...node} />
      ))}
      <View style={styles.lineOne} />
      <View style={styles.lineTwo} />
      <View style={styles.lineThree} />
    </View>
  );
}

function StarNode({
  x,
  y,
  color,
  label,
  active = false,
  locked = false,
}: ConstellationNode) {
  const { typography } = useTheme();
  return (
    <View style={[styles.starNode, { left: x, top: y }]}>
      <View style={[styles.starGlow, active && styles.starGlowActive, { backgroundColor: color }]} />
      <View style={[styles.starDot, { backgroundColor: locked ? 'rgba(255,255,255,0.22)' : color }]}>
        {locked ? <Ionicons name="lock-closed" size={10} color="#FFF8F1" /> : null}
      </View>
      <Text numberOfLines={1} style={[typography.caption, styles.starLabel]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: 330,
    height: 230,
    alignSelf: 'center',
    marginTop: spacing(2),
  },
  starNode: {
    position: 'absolute',
    alignItems: 'center',
    width: 92,
  },
  starGlow: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    opacity: 0.15,
    top: -12,
  },
  starGlowActive: {
    width: 64,
    height: 64,
    borderRadius: 32,
    top: -20,
    opacity: 0.22,
  },
  starDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  starLabel: {
    color: 'rgba(255,255,255,0.74)',
    marginTop: spacing(0.5),
    textAlign: 'center',
  },
  lineOne: {
    position: 'absolute',
    left: 78,
    top: 58,
    width: 122,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    transform: [{ rotate: '18deg' }],
  },
  lineTwo: {
    position: 'absolute',
    left: 118,
    top: 132,
    width: 146,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    transform: [{ rotate: '-28deg' }],
  },
  lineThree: {
    position: 'absolute',
    left: 96,
    top: 122,
    width: 100,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    transform: [{ rotate: '58deg' }],
  },
});

