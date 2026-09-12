import { PressableFeedback, Typography } from 'heroui-native';
import { PencilLine, Shuffle } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { IntroCustomAnswer } from '@/components/IntroCustomAnswer';
import { IntroOptionList } from '@/components/IntroOptionList';
import { Heading } from '@/components/Heading';
import { cleanCustomText, type IntroCategory, type IntroQuestion } from '@/lib/introSentence';
import { BRAND } from '@/lib/theme';
import { cn } from '@/lib/utils';

interface IntroQuestionCardProps {
  category: IntroCategory;
  question: IntroQuestion;
  selectedId?: string;
  onSelect: (optionId: string) => void;
  /** Their own wording, when they went that way instead of tapping. */
  customText?: string;
  onCustomChange: (text: string) => void;
  /** Keyboard "done" on the typed answer. */
  onCustomSubmit?: () => void;
  /** Draws another question from the same group. */
  onSwitch: () => void;
  /** Small line next to the group name, e.g. "2 of 5". */
  step?: string;
  /** Tighter type for the list of all five groups in the editor. */
  compact?: boolean;
}

/**
 * One group's current question: the four options, the way to type your own
 * answer instead, and the control that swaps the question for another one from
 * the same group. Shared by registration and the editor.
 */
export function IntroQuestionCard({
  category,
  question,
  selectedId,
  onSelect,
  customText = '',
  onCustomChange,
  onCustomSubmit,
  onSwitch,
  step,
  compact = false,
}: IntroQuestionCardProps) {
  const [writing, setWriting] = useState(false);

  const typed = cleanCustomText(customText).length > 0;
  const showField = writing || typed;

  const selectOption = (optionId: string) => {
    setWriting(false);
    onSelect(optionId);
  };

  const switchQuestion = () => {
    setWriting(false);
    onSwitch();
  };

  const closeField = () => {
    setWriting(false);
    onCustomChange('');
  };

  return (
    <View className={cn('gap-5', compact && 'gap-3')}>
      <View className="flex-row items-center justify-between gap-3">
        <View className="bg-accent-soft rounded-full px-3 py-1.5">
          <Typography type="body-xs" className="text-accent tracking-widest uppercase">
            {category.label}
          </Typography>
        </View>
        {step ? (
          <Typography type="body-xs" color="muted">
            Question {step}
          </Typography>
        ) : null}
      </View>

      <View className={cn('gap-2', !compact && 'items-center px-2')}>
        <Heading type={compact ? 'h5' : 'h3'} className={cn(!compact && 'text-center')}>
          {question.prompt}
        </Heading>
        <Typography type="body-xs" color="muted" align={compact ? 'start' : 'center'}>
          {question.helper}
        </Typography>
      </View>

      <Animated.View key={question.id} entering={FadeInRight.duration(220)} className="gap-4">
        <IntroOptionList
          question={question}
          selectedId={showField ? undefined : selectedId}
          onSelect={selectOption}
        />

        {showField ? (
          <View className="gap-2.5">
            <IntroCustomAnswer
              category={category}
              value={customText}
              onChangeText={onCustomChange}
              onSubmit={onCustomSubmit}
              autoFocus={writing && !typed}
            />
            <PressableFeedback
              onPress={closeField}
              accessibilityRole="button"
              accessibilityLabel="Discard my own answer and go back to the options"
            >
              <Typography type="body-xs" color="muted" className="self-start px-1 underline">
                Back to the options
              </Typography>
            </PressableFeedback>
          </View>
        ) : (
          <PressableFeedback
            onPress={() => setWriting(true)}
            accessibilityRole="button"
            accessibilityLabel="None of these fit, write my own answer"
          >
            <View className="border-border bg-surface flex-row items-center gap-3 rounded-2xl border border-dashed px-4 py-3.5">
              <PencilLine color={BRAND.accent} size={16} />
              <Typography type="body-sm" className="flex-1">
                None of these fit — say it your way
              </Typography>
            </View>
          </PressableFeedback>
        )}

        <PressableFeedback
          onPress={switchQuestion}
          accessibilityRole="button"
          accessibilityLabel={`Show a different question about ${category.label.toLowerCase()}`}
          accessibilityHint="Keeps the same topic, swaps the question"
        >
          <View className="border-border flex-row items-center gap-2 self-start rounded-full border px-3.5 py-2">
            <Shuffle color={BRAND.accent} size={14} />
            <Typography type="body-xs" weight="medium">
              Ask me something else
            </Typography>
          </View>
        </PressableFeedback>
      </Animated.View>

      {compact ? null : (
        <View className="flex-row items-center gap-2">
          <Shuffle color={BRAND.muted} size={12} />
          <Typography type="body-xs" color="muted" className="flex-1">
            {category.about}
          </Typography>
        </View>
      )}
    </View>
  );
}
