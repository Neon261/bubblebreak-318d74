import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Typography } from 'heroui-native';
import { ScrollView } from 'react-native';

import { IntroQuestionCard } from '@/components/IntroQuestionCard';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import {
  currentIntroQuestion,
  firstUnansweredIndex,
  hasAllIntroAnswers,
  INTRO_CATEGORIES,
  INTRO_CATEGORY_COUNT,
} from '@/lib/introSentence';
import { goBackOrReplace } from '@/lib/navigation';
import { useAppStore } from '@/lib/store';

export default function OnboardingQuestionsScreen() {
  const router = useRouter();
  const firstName = useAppStore((state) => state.profile.firstName);
  const answers = useAppStore((state) => state.profile.introAnswers);
  const setIntroAnswer = useAppStore((state) => state.setIntroAnswer);
  const switchIntroQuestion = useAppStore((state) => state.switchIntroQuestion);

  const [index, setIndex] = useState(() =>
    Math.min(firstUnansweredIndex(answers), INTRO_CATEGORY_COUNT - 1),
  );

  const category = INTRO_CATEGORIES[index];
  if (!category) return null;

  const question = currentIntroQuestion(category.id, answers);
  if (!question) return null;

  const select = (optionId: string) => {
    setIntroAnswer(category.id, optionId);
    const next = { ...answers, [category.id]: { questionId: question.id, optionId } };
    // Switching a question drops its answer, so the next stop is whatever is
    // still blank rather than simply the group after this one.
    if (hasAllIntroAnswers(next)) router.push('/onboarding/sentence');
    else setIndex(Math.min(firstUnansweredIndex(next), INTRO_CATEGORY_COUNT - 1));
  };

  const back = () => {
    if (index > 0) setIndex(index - 1);
    else goBackOrReplace('/onboarding');
  };

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-7 px-6 pb-12 pt-safe-offset-6"
      showsVerticalScrollIndicator={false}
    >
      <OnboardingProgress step={2} total={4} onBack={back} />

      <Typography type="body-xs" color="muted" className="tracking-widest uppercase">
        Five topics, five taps
      </Typography>

      <IntroQuestionCard
        category={category}
        question={question}
        selectedId={answers[category.id]?.optionId}
        onSelect={select}
        onSwitch={() => switchIntroQuestion(category.id)}
        step={`${index + 1} of ${INTRO_CATEGORY_COUNT}`}
      />

      <Typography type="body-xs" color="muted">
        {firstName}, one question per topic, drawn at random. Do not like one? Swap it for another
        from the same topic. All five become a single sentence — nothing else about you is shown.
      </Typography>
    </ScrollView>
  );
}
