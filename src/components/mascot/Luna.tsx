import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

import { Palette, useTheme } from '@/theme';

export type LunaExpression = 'happy' | 'thinking' | 'sleeping' | 'celebrating' | 'comforting';

interface LunaProps {
  expression?: LunaExpression;
  size?: number;
}

const CRESCENT_PATH =
  'M85 20 C55 20 35 45 35 70 C35 95 55 120 85 120 C68 112 58 92 58 70 C58 48 68 28 85 20 Z';

function renderBackground(expression: LunaExpression, p: Palette) {
  switch (expression) {
    case 'thinking':
      return (
        <>
          <Circle
            cx={100}
            cy={30}
            r={10}
            fill="none"
            stroke={p.accent200}
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
          <Circle cx={112} cy={18} r={3} fill={p.accent200} />
        </>
      );
    case 'sleeping':
      return (
        <>
          <SvgText x={95} y={35} fontSize={14} fill={p.accent200}>
            z
          </SvgText>
          <SvgText x={105} y={25} fontSize={10} fill={p.accent200}>
            z
          </SvgText>
        </>
      );
    case 'celebrating':
      return (
        <>
          <Circle cx={30} cy={30} r={2} fill={p.accent400} />
          <Circle cx={105} cy={25} r={2.5} fill={p.accent400} />
          <Circle cx={110} cy={55} r={1.6} fill={p.accent200} />
          <Circle cx={25} cy={60} r={1.8} fill={p.accent200} />
        </>
      );
    case 'comforting':
      return (
        <Path
          d="M70 55 C65 50 55 52 55 60 C55 68 70 78 70 78 C70 78 85 68 85 60 C85 52 75 50 70 55 Z"
          fill={p.accent400}
          opacity={0.4}
        />
      );
    case 'happy':
      return null;
  }
}

function renderFace(expression: LunaExpression, p: Palette) {
  switch (expression) {
    case 'happy':
      return (
        <>
          <Circle cx={60} cy={63} r={3.2} fill={p.text} />
          <Circle cx={72} cy={66} r={3.2} fill={p.text} />
          <Path
            d="M61 78 Q66 84 72 79"
            stroke={p.text}
            strokeWidth={2.2}
            fill="none"
            strokeLinecap="round"
          />
          <Circle cx={55} cy={72} r={4} fill={p.accent400} opacity={0.35} />
          <Circle cx={79} cy={74} r={4} fill={p.accent400} opacity={0.35} />
        </>
      );
    case 'thinking':
      return (
        <>
          <Path
            d="M56 60 Q60 56 64 60"
            stroke={p.text}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <Circle cx={60} cy={66} r={2.6} fill={p.text} />
          <Circle cx={72} cy={68} r={2.6} fill={p.text} />
          <Path
            d="M63 80 Q66 82 70 80"
            stroke={p.text}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    case 'sleeping':
      return (
        <>
          <Path
            d="M56 63 Q60 60 64 63"
            stroke={p.text}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M68 66 Q72 63 76 66"
            stroke={p.text}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M62 78 Q66 80 70 78"
            stroke={p.text}
            strokeWidth={1.6}
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    case 'celebrating':
      return (
        <>
          <Path d="M57 60 L63 66 M63 60 L57 66" stroke={p.text} strokeWidth={2.2} strokeLinecap="round" />
          <Path d="M69 63 L75 69 M75 63 L69 69" stroke={p.text} strokeWidth={2.2} strokeLinecap="round" />
          <Path
            d="M58 76 Q66 88 76 76"
            stroke={p.text}
            strokeWidth={2.2}
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    case 'comforting':
      return (
        <>
          <Path
            d="M57 65 Q60 62 63 65"
            stroke={p.text}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M69 67 Q72 64 75 67"
            stroke={p.text}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M62 80 Q66 83 71 80"
            stroke={p.text}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
  }
}

export function Luna({ expression = 'happy', size = 96 }: LunaProps) {
  const p = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 140 140" accessibilityLabel={`Luna, ${expression}`}>
      {renderBackground(expression, p)}
      <Path d={CRESCENT_PATH} fill={p.accent200} stroke={p.accent400} strokeWidth={2} />
      {renderFace(expression, p)}
    </Svg>
  );
}
