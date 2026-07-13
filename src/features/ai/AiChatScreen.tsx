import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { MessageBubble } from '@/components/ai/MessageBubble';
import { SuggestedPrompts } from '@/components/ai/SuggestedPrompts';
import { TypingDots } from '@/components/ai/TypingDots';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';
import { Screen } from '@/components/ui/Screen';
import { ChatMessage, useChat } from '@/features/ai/useChat';
import { usePremiumStore } from '@/store';
import { radius, spacing, typography, useTheme } from '@/theme';

export function AiChatScreen() {
  const p = useTheme();
  const { t } = useTranslation();
  const { messages, typing, send } = useChat();
  const isPremium = usePremiumStore((s) => s.isPremium);
  const remaining = usePremiumStore((s) => s.remainingFreeQuestions);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const submit = (text: string) => {
    send(text);
    setInput('');
  };

  return (
    <Screen scroll={false} edgeToEdge keyboardAvoiding>
      <Animated.View entering={FadeIn.duration(280)} style={styles.flexFill}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: p.text }]}>{t('ai.title')}</Text>
          <Text style={[styles.counter, { color: p.textFaint }]}>
            {isPremium
              ? t('ai.unlimited')
              : t('ai.remaining', { count: remaining() })}
          </Text>
        </View>

        {messages.length === 0 ? (
          <View style={[styles.emptyPanel, { backgroundColor: p.surface }]}>
            <Text style={[styles.emptyTitle, { color: p.text }]}>
              {t('ai.emptyTitle')}
            </Text>
            <Text style={[styles.emptyBody, { color: p.textMuted }]}>
              {t('ai.emptyBody')}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <MessageBubble role={item.role} text={item.text} />
            )}
            contentContainerStyle={styles.list}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: true })
            }
            ListFooterComponent={typing ? <TypingDots /> : null}
          />
        )}

        <SuggestedPrompts onSelect={submit} />

        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: p.surfaceStrong, color: p.text },
            ]}
            value={input}
            onChangeText={setInput}
            placeholder={t('ai.placeholder')}
            placeholderTextColor={p.textFaint}
            accessibilityLabel={t('ai.placeholder')}
            onSubmitEditing={() => submit(input)}
            returnKeyType="send"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.next')}
            onPress={() => submit(input)}
            style={({ pressed }) => [
              styles.sendBtn,
              { backgroundColor: p.primaryBtn },
              pressed && styles.sendBtnPressed,
            ]}
          >
            <Ionicons name="paper-plane" size={15} color={p.onPrimaryBtn} />
          </Pressable>
        </View>

        <View style={styles.disclaimer}>
          <DisclaimerBox text={t('disclaimer.ai')} />
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flexFill: { flex: 1 },
  header: {
    paddingHorizontal: spacing(2.25),
    paddingTop: spacing(1),
    paddingBottom: spacing(1.5),
  },
  title: {
    ...typography.headline,
  },
  counter: {
    ...typography.caption,
    marginTop: 2,
  },
  emptyPanel: {
    flex: 1,
    marginHorizontal: spacing(2.5),
    borderRadius: radius.md,
    padding: spacing(3),
    justifyContent: 'center',
  },
  emptyTitle: {
    ...typography.title,
    textAlign: 'center',
  },
  emptyBody: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing(1),
  },
  list: {
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(0.5),
  },
  input: {
    ...typography.body,
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 0,
    paddingHorizontal: spacing(1.75),
    minHeight: 44,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnPressed: {
    transform: [{ scale: 0.94 }],
  },
  disclaimer: {
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
  },
});
