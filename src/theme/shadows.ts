import { ViewStyle } from 'react-native';

const warm = '#5a3c14';

const tiny: ViewStyle = {
  shadowColor: warm, shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08, shadowRadius: 8, elevation: 1,
};
const soft: ViewStyle = {
  shadowColor: warm, shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.08, shadowRadius: 24, elevation: 3,
};
const float: ViewStyle = {
  shadowColor: '#3c2814', shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 0.16, shadowRadius: 34, elevation: 8,
};
const hero: ViewStyle = {
  shadowColor: '#785411', shadowOffset: { width: 0, height: 18 },
  shadowOpacity: 0.14, shadowRadius: 40, elevation: 6,
};
const button: ViewStyle = {
  shadowColor: '#000000', shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.16, shadowRadius: 22, elevation: 4,
};
const chip: ViewStyle = {
  shadowColor: '#785411', shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.22, shadowRadius: 14, elevation: 3,
};

export const shadows = {
  none: {},
  tiny, soft, float, hero, button, chip,
} satisfies Record<string, ViewStyle>;
