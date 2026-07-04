import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

interface Props {
  /** Wrap content in a ScrollView (default true). */
  scroll?: boolean;
  /** Remove horizontal padding, e.g. for edge-to-edge headers. */
  edgeToEdge?: boolean;
}

export function Screen({ children, scroll = true, edgeToEdge = false }: PropsWithChildren<Props>) {
  const content = edgeToEdge ? children : <View style={styles.padded}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        <View style={styles.flex}>{content}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing(4),
  },
  padded: {
    paddingHorizontal: spacing(2.5),
    flex: 1,
  },
});
