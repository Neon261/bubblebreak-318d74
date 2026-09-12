import { Description, Input, Label, TextField, Typography } from 'heroui-native';
import { View } from 'react-native';

import { cleanCustomText, customIntroFragment, type IntroCategory } from '@/lib/introSentence';

const MAX_LENGTH = 70;
/** Below this the preview is more noise than help. */
const PREVIEW_MIN = 3;

interface IntroCustomAnswerProps {
  category: IntroCategory;
  /** Exactly what they typed, straight from the profile. */
  value: string;
  onChangeText: (text: string) => void;
  /** Keyboard "done" — used to move the flow on. */
  onSubmit?: () => void;
  autoFocus?: boolean;
}

/**
 * The way out when none of the four options fits: their own wording, shaped to
 * fit this group's slot in the generated sentence.
 */
export function IntroCustomAnswer({
  category,
  value,
  onChangeText,
  onSubmit,
  autoFocus = false,
}: IntroCustomAnswerProps) {
  const cleaned = cleanCustomText(value);
  const fragment = cleaned.length >= PREVIEW_MIN ? customIntroFragment(category.id, value) : '';

  return (
    <View className="border-accent bg-accent-soft gap-2 rounded-2xl border px-4 py-3.5">
      <TextField>
        <Label>{category.custom.lead}</Label>
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder={category.custom.placeholder}
          autoCapitalize="none"
          autoCorrect
          autoFocus={autoFocus}
          maxLength={MAX_LENGTH}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          accessibilityLabel={`Your own answer about ${category.label.toLowerCase()}`}
        />
        <Description>Keep it short — a few words is plenty.</Description>
      </TextField>

      {fragment ? (
        <Typography type="body-xs" color="muted">
          In your sentence: {fragment}
        </Typography>
      ) : null}
    </View>
  );
}
