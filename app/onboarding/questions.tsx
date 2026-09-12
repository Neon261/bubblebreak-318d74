import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Typography } from 'heroui-native';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { IntroOptionList } from '@/components/IntroOptionList';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { firstUnansweredIndex, INTRO_QUESTIONS } from '@/lib/introSentence';
import { goBackOrReplace } from '@/lib/navigation';
import { useAppStore } from '@/lib/store';

export default function OnboardingQuestionsScreen() {
  const router = useRouter();
  const firstName = useAppStore((state) => state.profile.firstName);
  const answers = useAppStore((state) => state.profile.introAnswers);
  const setIntroAnswer = useAppStore((state) => state.setIntroAnswer);

  const [index, setIndex] = useState(() =>
    Math.min(firstUnansweredIndex(answers), INTRO_QUESTIONS.length - 1),
  );

  const question = INTRO_QUESTIONS[index];
  if (!question) return null;

  const isLast = index === INTRO_QUESTIONS.length - 1;

  const select = (optionId: string) => {
    setIntroAnswer(question.id, optionId);
    if (isLast) router.push('/onboarding/sentence');
    else setIndex(index + 1);
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

      <View className="gap-2">
        <Typography type="body-xs" color="muted" className="tracking-widest uppercase">
          Question {index + 1} of {INTRO_QUESTIONS.length}
        </Typography>
        <Typography type="h3">{question.prompt}</Typography>
        <Typography type="body-sm" color="muted">
          {question.helper}
        </Typography>
      </View>

      <Animated.View key={question.id} entering={FadeInRight.duration(220)}>
        <IntroOptionList question={question} selectedId={answers[question.id]} onSelect={select} />
      </Animated.View>

      <Typography type="body-xs" color="muted">
        {firstName}, these five taps become one sentence. Nothing else about you is shown.
      </Typography>
    </ScrollView>
  );
}
