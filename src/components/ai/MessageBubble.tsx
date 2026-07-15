import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { duration, radius, spacing, typography, useTheme } from '@/theme';

interface Props {
  role: 'user' | 'coach';
  text: string;
}

export function MessageBubble({ role, text }: Props) {
  const p = useTheme();
  const { t } = useTranslation();
  const isUser = role === 'user';
  return (
    <Animated.View
      entering={FadeIn.duration(duration.quick)}
      style={[styles.row, isUser && styles.rowUser]}
    >
      <View
        style={[
          styles.bubble,
          { backgroundColor: isUser ? p.accent100 : 'transparent', borderColor: p.track },
        ]}
      >
        {isUser ? <Text style={[styles.text, { color: p.accent800 }]}>{text}</Text> : <>
          <ResponseBlock label={t('living.notice')} text={text} />
          <ResponseBlock label={t('living.why')} text={t('living.guidanceContext')} />
          <ResponseBlock label={t('living.help')} text={t('living.helpBody')} />
          <ResponseBlock label={t('living.monitor')} text={t('living.monitorBody')} />
          <ResponseBlock label={t('living.support')} text={t('living.supportBody')} muted />
        </>}
      </View>
    </Animated.View>
  );
}

function ResponseBlock({ label, text, muted = false }: { label: string; text: string; muted?: boolean }) {
  const p = useTheme();
  return <View style={[styles.responseBlock, { borderTopColor: p.track }]}><Text style={[styles.blockLabel, { color: p.accentInk }]}>{label}</Text><Text style={[styles.text, { color: muted ? p.textMuted : p.text }]}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: spacing(1.25) },
  rowUser: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '100%',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(1.75),
    paddingVertical: spacing(1.4),
  },
  text: { ...typography.bodySmall, fontSize: 13.5, lineHeight: 20 },
  responseBlock: { gap: spacing(0.75), paddingVertical: spacing(1.25), borderTopWidth: StyleSheet.hairlineWidth },
  blockLabel: { ...typography.micro },
});
