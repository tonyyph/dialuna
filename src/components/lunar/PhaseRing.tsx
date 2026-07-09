import Svg, { Circle, G } from 'react-native-svg';

import { CyclePhase } from '@/types/cycle';
import { useTheme } from '@/theme/useTheme';

interface PhaseRingProps {
  phase: CyclePhase;
  progress: number;
  size?: number;
}

const PHASE_ORDER: CyclePhase[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];

export function PhaseRing({ phase, progress, size = 210 }: PhaseRingProps) {
  const { colors } = useTheme();
  const strokeWidth = size >= 180 ? 5 : 4;
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const phaseIndex = PHASE_ORDER.indexOf(phase);
  const segmentLength = circumference / PHASE_ORDER.length;
  const gap = 10;
  const phaseColor = colors.phase[phase];

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      accessibilityLabel={`${phase} cycle phase ring`}
    >
      <G rotation="-90" origin={`${center}, ${center}`}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {PHASE_ORDER.map((phaseName, index) => (
          <Circle
            key={phaseName}
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.phase[phaseName]}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${segmentLength - gap} ${circumference - segmentLength + gap}`}
            strokeDashoffset={-index * segmentLength}
            opacity={index === phaseIndex ? 0.86 : 0.28}
            fill="transparent"
          />
        ))}
        <Circle
          cx={center}
          cy={center}
          r={radius - strokeWidth * 1.9}
          stroke={phaseColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={`${circumference * clampedProgress} ${circumference}`}
          opacity={0.8}
          fill="transparent"
        />
      </G>
    </Svg>
  );
}
