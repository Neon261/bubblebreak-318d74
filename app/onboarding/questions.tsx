import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, Typography } from 'heroui-native';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { IntroQuestionCard } from '@/components/IntroQuestionCard';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import {
  currentIntroQuestion,
  firstUnansweredIndex,
  hasAllIntroAnswers,
  hasIntroAnswer,
  INTRO_CATEGORIES,
  INTRO_CATEGORY_COUNT,
} from '@/lib/introSentence';
import { goBackOrReplace } from '@/lib/navigation';
import { useAppStore } from '@/lib/store';
import type { IntroAnswers } from '@/lib/types';

export default function OnboardingQuestionsScreen() {
  const router = useRouter();
  const firstName = useAppStore((state) => state.profile.firstName);
  const answers = useAppStore((state) => state.profile.introAnswers);
  const setIntroAnswer = useAppStore((state) => state.setIntroAnswer);
  const setIntroCustomAnswer = useAppStore((state) => state.setIntroCustomAnswer);
  const switchIntroQuestion = useAppStore((state) => state.switchIntroQuestion);

  const [index, setIndex] = useState(() =>
    Math.min(firstUnansweredIndex(answers), INTRO_CATEGORY_COUNT - 1),
  );

  const category = INTRO_CATEGORIES[index];
  if (!category) return null;

  const question = currentIntroQuestion(category.id, answers);
  if (!question) return null;

  // Switching a question drops its answer, so the next stop is whatever is
  // still blank rather than simply the group after this one.
  const advance = (next: IntroAnswers) => {
    if (hasAllIntroAnswers(next)) router.push('/onboarding/sentence');
    else setIndex(Math.min(firstUnansweredIndex(next), INTRO_CATEGORY_COUNT - 1));
  };

  const select = (optionId: string) => {
    setIntroAnswer(category.id, optionId);
    advance({ ...answers, [category.id]: { questionId: question.id, optionId } });
  };

  // Typing already saved on every keystroke; this only moves the flow on.
  const submitTyped = () => {
    if (hasIntroAnswer(answers[category.id])) advance(answers);
  };

  const back = () => {
    if (index > 0) setIndex(index - 1);
    else goBackOrReplace('/onboarding');
  };

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="gap-7 px-6 pb-12 pt-safe-offset-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <OnboardingProgress step={2} total={4} onBack={back} />

        <Typography type="body-xs" color="muted" className="tracking-widest uppercase">
          Five topics, five answers
        </Typography>

        <IntroQuestionCard
          category={category}
          question={question}
          selectedId={answers[category.id]?.optionId}
          onSelect={select}
          customText={answers[category.id]?.customText}
          onCustomChange={(text) => setIntroCustomAnswer(category.id, text)}
          onCustomSubmit={submitTyped}
          onSwitch={() => switchIntroQuestion(category.id)}
          step={`${index + 1} of ${INTRO_CATEGORY_COUNT}`}
        />

        {answers[category.id]?.customText ? (
          <Button onPress={submitTyped} isDisabled={!hasIntroAnswer(answers[category.id])}>
            <Button.Label>
              {hasAllIntroAnswers(answers) ? 'See my intro' : 'Next topic'}
            </Button.Label>
          </Button>
        ) : null}

        <Typography type="body-xs" color="muted">
          {firstName}, one question per topic, drawn at random. Do not like one? Swap it for another
          from the same topic, or write your own answer. All five turn into a short intro in your
          own voice — nothing else about you is shown.
        </Typography>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
