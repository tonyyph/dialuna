import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { AuroraStage } from '@/components/lunar/AuroraStage';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';
import { OrbitalMark } from '@/components/ui/OrbitalMark';
import { Screen } from '@/components/ui/Screen';
import { ChatMessage, useChat } from '@/features/ai/useChat';
import { usePremiumStore } from '@/store';
import { radius, shadows, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

const PROMPT_KEYS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'] as const;

export function AiChatScreen() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const { messages, typing, send } = useChat();
  const isPremium = usePremiumStore((s) => s.isPremium);
  const remaining = usePremiumStore((s) => s.remainingFreeQuestions);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    send(trimmed);
    setInput('');
  };

  return (
    <Screen scroll={false} edgeToEdge keyboardAvoiding>
      <AuroraStage style={styles.stage}>
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={[typography.caption, styles.heroMeta]}>{t('ai.coach.kicker')}</Text>
            <Text style={[typography.displayXl, styles.heroTitle]}>{t('ai.coach.title')}</Text>
            <Text style={[typography.body, styles.heroBody]}>
              {isPremium ? t('ai.unlimited') : t('ai.remaining', { count: remaining() })}
            </Text>
          </View>
          <OrbitalMark state={typing ? 'thinking' : 'listening'} size={104} premium={isPremium} />
        </View>
      </AuroraStage>

      <View style={styles.chatShell}>
        {messages.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(360)} style={styles.emptyState}>
            <Text style={[typography.displayL, styles.emptyTitle]}>{t('ai.coach.emptyTitle')}</Text>
            <Text style={typography.bodyLarge}>{t('ai.coach.emptyBody')}</Text>
            <PromptConstellation onSelect={submit} />
          </Animated.View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(message) => message.id}
            renderItem={({ item }) => <CoachMessage role={item.role} text={item.text} />}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={typing ? <SignalPulse /> : null}
          />
        )}

        {messages.length > 0 ? <PromptRail onSelect={submit} /> : null}

        <View style={[styles.composer, { backgroundColor: colors.surface.elevated, borderColor: colors.border }]}>
          <TextInput
            style={[typography.bodyLarge, styles.input]}
            value={input}
            onChangeText={setInput}
            placeholder={t('ai.coach.placeholder')}
            placeholderTextColor={colors.textSecondary}
            accessibilityLabel={t('ai.coach.placeholder')}
            onSubmitEditing={() => submit(input)}
            returnKeyType="send"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.next')}
            onPress={() => submit(input)}
            style={({ pressed }) => [
              styles.sendButton,
              { backgroundColor: colors.primary },
              pressed && styles.sendPressed,
            ]}
          >
            <Ionicons name="arrow-up" size={20} color={colors.card} />
          </Pressable>
        </View>

        <View style={styles.disclaimer}>
          <DisclaimerBox text={t('disclaimer.ai')} />
        </View>
      </View>
    </Screen>
  );
}

function PromptConstellation({ onSelect }: { onSelect: (prompt: string) => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.promptConstellation}>
      {PROMPT_KEYS.slice(0, 5).map((key, index) => (
        <PromptSignal
          key={key}
          label={t(`ai.prompts.${key}`)}
          onPress={() => onSelect(t(`ai.prompts.${key}`))}
          variant={index % 2 === 0 ? 'wide' : 'compact'}
        />
      ))}
    </View>
  );
}

function PromptRail({ onSelect }: { onSelect: (prompt: string) => void }) {
  const { t } = useTranslation();
  return (
    <FlatList
      horizontal
      data={PROMPT_KEYS}
      keyExtractor={(key) => key}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.promptRail}
      renderItem={({ item }) => (
        <PromptSignal
          label={t(`ai.prompts.${item}`)}
          onPress={() => onSelect(t(`ai.prompts.${item}`))}
          variant="rail"
        />
      )}
    />
  );
}

function PromptSignal({
  label,
  onPress,
  variant,
}: {
  label: string;
  onPress: () => void;
  variant: 'compact' | 'wide' | 'rail';
}) {
  const { colors, typography, shadows } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.prompt,
        variant === 'wide' && styles.promptWide,
        variant === 'rail' && styles.promptRailItem,
        shadows.sm,
        { backgroundColor: colors.glassStrong, borderColor: colors.glassBorder },
        pressed && styles.promptPressed,
      ]}
    >
      <Ionicons name="sparkles" size={15} color={colors.primary} />
      <Text numberOfLines={variant === 'rail' ? 1 : 2} style={[typography.caption, styles.promptText]}>
        {label}
      </Text>
    </Pressable>
  );
}

function CoachMessage({ role, text }: { role: 'user' | 'coach'; text: string }) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const isUser = role === 'user';

  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      {!isUser ? (
        <View style={[styles.signalMark, { backgroundColor: colors.softRose }]}>
          <Ionicons name="moon" size={16} color={colors.primary} />
        </View>
      ) : null}
      <View
        style={[
          styles.message,
          isUser
            ? { backgroundColor: colors.royalViolet }
            : {
                backgroundColor: colors.surface.elevated,
                borderColor: colors.glassBorder,
                borderWidth: 1,
              },
        ]}
      >
        {!isUser ? (
          <Text style={[typography.caption, { color: colors.primary }]}>{t('ai.coach.note')}</Text>
        ) : null}
        <Text style={[typography.bodyLarge, isUser && { color: colors.moonWhite }]}>{text}</Text>
      </View>
    </View>
  );
}

function SignalPulse() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  return (
    <Animated.View entering={FadeInDown.duration(240)} style={styles.signalPulse}>
      <View style={[styles.pulseIcon, { backgroundColor: colors.softRose }]}>
        <Ionicons name="radio" size={18} color={colors.primary} />
      </View>
      <Text style={[typography.caption, { color: colors.primary }]}>{t('ai.coach.thinking')}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stage: {
    minHeight: 284,
    borderBottomLeftRadius: radius.sheet,
    borderBottomRightRadius: radius.sheet,
  },
  hero: {
    paddingTop: spacing(3),
    paddingHorizontal: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(2),
  },
  heroCopy: {
    flex: 1,
  },
  heroMeta: {
    color: 'rgba(255,255,255,0.68)',
  },
  heroTitle: {
    color: '#FFF8F1',
    marginTop: spacing(0.5),
  },
  heroBody: {
    color: 'rgba(255,255,255,0.76)',
    marginTop: spacing(1),
  },
  chatShell: {
    flex: 1,
    marginTop: -spacing(4),
  },
  emptyState: {
    flex: 1,
    marginHorizontal: spacing(2.5),
    borderRadius: radius.sheet,
    backgroundColor: '#FFFCF8',
    padding: spacing(3),
    gap: spacing(2),
    ...shadows.lg,
  },
  emptyTitle: {
    maxWidth: 260,
  },
  promptConstellation: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1.25),
    marginTop: spacing(1),
  },
  prompt: {
    minHeight: 52,
    width: '48%',
    borderRadius: radius.card,
    borderWidth: 1,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1.25),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.75),
  },
  promptWide: {
    width: '100%',
  },
  promptRail: {
    gap: spacing(1),
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
  },
  promptRailItem: {
    width: 220,
  },
  promptPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.94,
  },
  promptText: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(5),
    paddingBottom: spacing(1),
  },
  messageRow: {
    flexDirection: 'row',
    gap: spacing(1),
    alignItems: 'flex-end',
    marginBottom: spacing(1.5),
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  signalMark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    maxWidth: '82%',
    borderRadius: radius.card,
    padding: spacing(2),
    gap: spacing(0.75),
  },
  signalPulse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    marginLeft: spacing(5.5),
    marginBottom: spacing(1.5),
  },
  pulseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    minHeight: 62,
    borderRadius: radius.sheet,
    borderWidth: 1,
    marginHorizontal: spacing(2.5),
    paddingLeft: spacing(2),
    paddingRight: spacing(0.75),
    ...shadows.sm,
  },
  input: {
    flex: 1,
    minHeight: 50,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  disclaimer: {
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
  },
});
