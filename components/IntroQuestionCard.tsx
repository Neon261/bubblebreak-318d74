import { PressableFeedback, Typography, useThemeColor } from 'heroui-native';
import { Shuffle } from 'lucide-react-native';
import { View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { IntroOptionList } from '@/components/IntroOptionList';
import type { IntroCategory, IntroQuestion } from '@/lib/introSentence';

interface IntroQuestionCardProps {
  category: IntroCategory;
  question: IntroQuestion;
  selectedId?: string;
  onSelect: (optionId: string) => void;
  /** Draws another question from the same group. */
  onSwitch: () => void;
  /** Small line next to the group name, e.g. "2 of 5". */
  step?: string;
  /** Tighter type for the list of all five groups in the editor. */
  compact?: boolean;
}

/**
 * One group's current question, with the control that swaps it for another
 * question from the same group. Shared by registration and the editor.
 */
export function IntroQuestionCard({
  category,
  question,
  selectedId,
  onSelect,
  onSwitch,
  step,
  compact = false,
}: IntroQuestionCardProps) {
  const [accent, muted] = useThemeColor(['accent', 'muted']);

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between gap-3">
        <Typography type="body-xs" className="text-accent tracking-widest uppercase">
          {category.label}
        </Typography>
        {step ? (
          <Typography type="body-xs" color="muted">
            {step}
          </Typography>
        ) : null}
      </View>

      <View className="gap-1">
        <Typography type={compact ? 'body' : 'h3'} weight={compact ? 'semibold' : 'normal'}>
          {question.prompt}
        </Typography>
        <Typography type="body-xs" color="muted">
          {question.helper}
        </Typography>
      </View>

      <Animated.View key={question.id} entering={FadeInRight.duration(220)} className="gap-3">
        <IntroOptionList question={question} selectedId={selectedId} onSelect={onSelect} />

        <PressableFeedback
          onPress={onSwitch}
          accessibilityRole="button"
          accessibilityLabel={`Show a different question about ${category.label.toLowerCase()}`}
          accessibilityHint="Keeps the same topic, swaps the question"
        >
          <View className="border-border flex-row items-center gap-2 self-start rounded-full border px-3.5 py-2">
            <Shuffle color={accent} size={14} />
            <Typography type="body-xs" weight="medium">
              Ask me something else
            </Typography>
          </View>
        </PressableFeedback>
      </Animated.View>

      {compact ? null : (
        <View className="flex-row items-center gap-2">
          <Shuffle color={muted} size={12} />
          <Typography type="body-xs" color="muted" className="flex-1">
            {category.about}
          </Typography>
        </View>
      )}
    </View>
  );
}
