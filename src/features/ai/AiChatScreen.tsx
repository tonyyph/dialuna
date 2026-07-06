import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { MessageBubble } from '@/components/ai/MessageBubble';
import { SuggestedPrompts } from '@/components/ai/SuggestedPrompts';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';
import { EmptyState } from '@/components/ui/EmptyState';
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
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('ai.title')}</Text>
          <Text style={styles.counter}>
            {isPremium
              ? t('ai.unlimited')
              : t('ai.remaining', { count: remaining() })}
          </Text>
        </View>

        {messages.length === 0 ? (
          <View style={styles.flex}>
            <EmptyState
              lunaExpression="happy"
              title={t('ai.emptyTitle')}
              body={t('ai.emptyBody')}
            />
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
              typing ? <Text style={styles.typing}>{t('ai.typing')}</Text> : null
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
            style={styles.sendBtn}
          >
            <Ionicons name="arrow-up" size={20} color={colors.card} />
          </Pressable>
        </View>

        <View style={styles.disclaimer}>
          <DisclaimerBox text={t('disclaimer.ai')} />
        </View>
      </KeyboardAvoidingView>
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
  header: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(2),
    paddingBottom: spacing(1),
  },
  title: {
    ...typography.headline,
  },
  counter: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing(0.5),
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
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2),
    minHeight: 48,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
  },
});
