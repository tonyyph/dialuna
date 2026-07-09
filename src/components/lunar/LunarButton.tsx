import { StyleProp, ViewStyle } from 'react-native';

import { AppButton, AppButtonVariant } from '@/components/ui/AppButton';

interface LunarButtonProps {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function LunarButton(props: LunarButtonProps) {
  return <AppButton {...props} />;
}

