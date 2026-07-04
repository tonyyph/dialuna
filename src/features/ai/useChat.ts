import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCycleToday } from '@/features/cycle/useCycleToday';
import { generateAIResponse } from '@/services/aiCoachEngine';
import { useLogStore, usePremiumStore } from '@/store';

export interface ChatMessage {
  id: string;
  role: 'user' | 'coach';
  text: string;
}

const COACH_DELAY_MS = 600;

export function useChat() {
  const { t } = useTranslation();
  const ctx = useCycleToday();
  const logs = useLogStore((s) => s.logs);
  const canAskAi = usePremiumStore((s) => s.canAskAi);
  const consumeAiQuestion = usePremiumStore((s) => s.consumeAiQuestion);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const counter = useRef(0);

  const send = useCallback(
    (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || !ctx || typing) return;

      if (!canAskAi()) {
        router.push('/paywall');
        return;
      }
      consumeAiQuestion();

      const userMsg: ChatMessage = {
        id: `m${++counter.current}`,
        role: 'user',
        text: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setTyping(true);

      setTimeout(() => {
        const { text } = generateAIResponse({
          question: trimmed,
          profile: ctx.profile,
          prediction: ctx.prediction,
          twin: ctx.twin,
          recentLogs: Object.values(logs),
          t,
        });
        setMessages((prev) => [
          ...prev,
          { id: `m${++counter.current}`, role: 'coach', text },
        ]);
        setTyping(false);
      }, COACH_DELAY_MS);
    },
    [ctx, typing, canAskAi, consumeAiQuestion, logs, t]
  );

  return { messages, typing, send };
}
