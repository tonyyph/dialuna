import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Chip } from '@/components/ui/Chip';
import { spacing } from '@/theme';

const PROMPT_KEYS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'] as const;

interface Props {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: Props) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {PROMPT_KEYS.map((key) => {
        const prompt = t(`ai.prompts.${key}`);
        return (
          <Chip
            key={key}
            label={prompt}
            selected={false}
            onPress={() => onSelect(prompt)}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing(1),
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
  },
});
