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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { MessageBubble } from '@/components/ai/MessageBubble';
import { SuggestedPrompts } from '@/components/ai/SuggestedPrompts';
import { Luna } from '@/components/mascot/Luna';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';
import { Screen } from '@/components/ui/Screen';
import { ChatMessage, useChat } from '@/features/ai/useChat';
import { usePremiumStore } from '@/store';
import { colors, radius, spacing, typography } from '@/theme';

export function AiChatScreen() {
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
      <View style={styles.header}>
        <View style={styles.coachAvatar}>
          <Luna expression="thinking" size={70} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.kicker}>{t('ai.subtitle')}</Text>
          <Text style={styles.title}>{t('ai.title')}</Text>
          <Text style={styles.counter}>
            {isPremium
              ? t('ai.unlimited')
              : t('ai.remaining', { count: remaining() })}
          </Text>
        </View>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyPanel}>
          <Text style={styles.emptyTitle}>{t('ai.emptyTitle')}</Text>
          <Text style={styles.emptyBody}>{t('ai.emptyBody')}</Text>
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
          ListFooterComponent={
            typing ? (
              <Animated.Text entering={FadeInDown.duration(220)} style={styles.typing}>
                {t('ai.typing')}
              </Animated.Text>
            ) : null
          }
        />
      )}

      <SuggestedPrompts onSelect={submit} />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={t('ai.placeholder')}
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel={t('ai.placeholder')}
          onSubmitEditing={() => submit(input)}
          returnKeyType="send"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.next')}
          onPress={() => submit(input)}
          style={({ pressed }) => [styles.sendBtn, pressed && styles.sendBtnPressed]}
        >
          <Ionicons name="arrow-up" size={20} color={colors.card} />
        </Pressable>
      </View>

      <View style={styles.disclaimer}>
        <DisclaimerBox text={t('disclaimer.ai')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(1.5),
    paddingBottom: spacing(1.5),
    marginHorizontal: spacing(2.5),
    marginTop: spacing(1.5),
    marginBottom: spacing(1),
    borderRadius: radius.sheet,
    backgroundColor: colors.deepPlum,
  },
  coachAvatar: {
    width: 82,
    height: 82,
    borderRadius: radius.sheet,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  kicker: {
    ...typography.caption,
    color: colors.peach,
  },
  title: {
    ...typography.headline,
    color: colors.card,
  },
  counter: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.78)',
    marginTop: spacing(0.5),
  },
  emptyPanel: {
    flex: 1,
    marginHorizontal: spacing(2.5),
    borderRadius: radius.sheet,
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
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
  typing: {
    ...typography.caption,
    marginLeft: spacing(4),
    marginBottom: spacing(1),
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
    backgroundColor: colors.glassStrong,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing(2),
    minHeight: 52,
  },
  sendBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  disclaimer: {
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
  },
});
