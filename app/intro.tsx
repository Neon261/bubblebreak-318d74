import { Button, Surface, Typography, useThemeColor } from 'heroui-native';
import { RefreshCw, Sparkles } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { IntroQuestionCard } from '@/components/IntroQuestionCard';
import { currentIntroQuestion, hasAllIntroAnswers, INTRO_CATEGORIES } from '@/lib/introSentence';
import { goBackOrReplace } from '@/lib/navigation';
import { useAppStore } from '@/lib/store';

/** Answer the registration questions again, any time, from your profile. */
export default function IntroEditorScreen() {
  const [accent] = useThemeColor(['accent']);
  const intro = useAppStore((state) => state.profile.intro);
  const answers = useAppStore((state) => state.profile.introAnswers);
  const setIntroAnswer = useAppStore((state) => state.setIntroAnswer);
  const setIntroCustomAnswer = useAppStore((state) => state.setIntroCustomAnswer);
  const switchIntroQuestion = useAppStore((state) => state.switchIntroQuestion);
  const shuffleIntro = useAppStore((state) => state.shuffleIntro);

  const complete = hasAllIntroAnswers(answers);

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="gap-7 px-5 pb-12 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Surface variant="secondary" className="gap-3 rounded-3xl p-5">
          <View className="flex-row items-center gap-2">
            <Sparkles color={accent} size={16} />
            <Typography type="body-xs" color="muted" className="tracking-widest uppercase">
              What people read
            </Typography>
          </View>
          <Animated.View key={intro} entering={FadeIn.duration(240)}>
            <Typography type="h5">{intro}</Typography>
          </Animated.View>
          {complete ? null : (
            <Typography type="body-xs" color="muted">
              You swapped a question — pick or type an answer below and the sentence updates.
            </Typography>
          )}
          <Button variant="tertiary" onPress={shuffleIntro}>
            <Button.Label>
              <View className="flex-row items-center gap-2">
                <RefreshCw color={accent} size={16} />
                <Typography type="body-sm" weight="medium">
                  Try another wording
                </Typography>
              </View>
            </Button.Label>
          </Button>
        </Surface>

        {INTRO_CATEGORIES.map((category) => {
          const question = currentIntroQuestion(category.id, answers);
          if (!question) return null;
          return (
            <IntroQuestionCard
              key={category.id}
              compact
              category={category}
              question={question}
              selectedId={answers[category.id]?.optionId}
              onSelect={(optionId) => setIntroAnswer(category.id, optionId)}
              customText={answers[category.id]?.customText}
              onCustomChange={(text) => setIntroCustomAnswer(category.id, text)}
              onSwitch={() => switchIntroQuestion(category.id)}
            />
          );
        })}

        <Button onPress={() => goBackOrReplace('/(tabs)/profile')}>
          <Button.Label>Done</Button.Label>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
