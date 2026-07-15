import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomAction } from '@/components/ui/BottomAction';
import { duration, sizes, spacing, useTheme } from '@/theme';

interface Props {
  /** Wrap content in a ScrollView (default true). */
  scroll?: boolean;
  /** Remove horizontal padding, e.g. for edge-to-edge headers. */
  edgeToEdge?: boolean;
  /** Fixed bottom action area. Content receives extra bottom inset automatically. */
  bottomAction?: ReactNode;
  /** Enable KeyboardAvoidingView for form/chat surfaces. */
  keyboardAvoiding?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  scroll = true,
  edgeToEdge = false,
  bottomAction,
  keyboardAvoiding = false,
  contentContainerStyle,
  style,
}: PropsWithChildren<Props>) {
  const p = useTheme();
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const bottomInset = bottomAction
    ? sizes.bottomActionMinHeight + Math.max(insets.bottom, spacing(1.5))
    : spacing(12);
  const content = edgeToEdge ? (
    children
  ) : (
    <Animated.View
      entering={reduceMotion ? undefined : FadeIn.duration(duration.standard)}
      style={[styles.padded, !scroll && styles.flex]}
    >
      {children}
    </Animated.View>
  );

  const body = (
    <View style={[styles.safe, { backgroundColor: p.bgGradient[0] }, style]}>
      <LinearGradient
        colors={p.bgGradient}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: bottomInset },
              contentContainerStyle,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {content}
          </ScrollView>
        ) : (
          <View
            style={[
              styles.flex,
              { paddingBottom: bottomInset },
              contentContainerStyle,
            ]}
          >
            {content}
          </View>
        )}
        {bottomAction ? <BottomAction>{bottomAction}</BottomAction> : null}
      </SafeAreaView>
    </View>
  );

  if (!keyboardAvoiding) return body;

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {body}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: sizes.screenPadding,
  },
});
