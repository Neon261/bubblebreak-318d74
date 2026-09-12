import { PressableFeedback, Typography } from 'heroui-native';
import { Check } from 'lucide-react-native';
import { View } from 'react-native';

import type { IntroQuestion } from '@/lib/introSentence';
import { BRAND } from '@/lib/theme';
import { cn } from '@/lib/utils';

interface IntroOptionListProps {
  question: IntroQuestion;
  selectedId?: string;
  onSelect: (optionId: string) => void;
}

/** Tappable answer rows, shared by registration and the later edit screen. */
export function IntroOptionList({ question, selectedId, onSelect }: IntroOptionListProps) {
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
                'min-h-20 flex-row items-center gap-4 rounded-3xl border px-5 py-4',
                selected ? 'border-accent bg-accent-soft' : 'border-border bg-surface',
              )}
            >
              <Typography
                type="body-sm"
                className="flex-1"
                weight={selected ? 'semibold' : 'normal'}
              >
                {option.label}
              </Typography>
              <View
                className={cn(
                  'h-6 w-6 items-center justify-center rounded-lg border',
                  selected ? 'border-accent bg-accent' : 'border-border bg-background',
                )}
              >
                {selected ? <Check color={BRAND.paper} size={15} strokeWidth={3} /> : null}
              </View>
            </View>
          </PressableFeedback>
        );
      })}
    </View>
  );
}
