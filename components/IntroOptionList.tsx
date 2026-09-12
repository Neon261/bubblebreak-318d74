import { Typography, useThemeColor } from 'heroui-native';
import { Check } from 'lucide-react-native';
import { View } from 'react-native';
import { PressableFeedback } from 'heroui-native';

import type { IntroQuestion } from '@/lib/introSentence';
import { cn } from '@/lib/utils';

interface IntroOptionListProps {
  question: IntroQuestion;
  selectedId?: string;
  onSelect: (optionId: string) => void;
}

/** Tappable answer rows, shared by registration and the later edit screen. */
export function IntroOptionList({ question, selectedId, onSelect }: IntroOptionListProps) {
  const [accent] = useThemeColor(['accent']);

  return (
    <View className="gap-2.5">
      {question.options.map((option) => {
        const selected = option.id === selectedId;
        return (
          <PressableFeedback
            key={option.id}
            onPress={() => onSelect(option.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
          >
            <View
              className={cn(
                'flex-row items-center gap-3 rounded-2xl border px-4 py-3.5',
                selected ? 'border-accent bg-accent-soft' : 'border-border bg-surface',
              )}
            >
              <Typography type="body-sm" className="flex-1" weight={selected ? 'medium' : 'normal'}>
                {option.label}
              </Typography>
              {selected ? <Check color={accent} size={18} /> : null}
            </View>
          </PressableFeedback>
        );
      })}
    </View>
  );
}
