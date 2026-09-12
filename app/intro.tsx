import { Button, Surface, Typography, useThemeColor } from 'heroui-native';
import { RefreshCw, Sparkles } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { IntroOptionList } from '@/components/IntroOptionList';
import { INTRO_QUESTIONS } from '@/lib/introSentence';
import { goBackOrReplace } from '@/lib/navigation';
import { useAppStore } from '@/lib/store';

/** Answer the registration questions again, any time, from your profile. */
export default function IntroEditorScreen() {
  const [accent] = useThemeColor(['accent']);
  const intro = useAppStore((state) => state.profile.intro);
  const answers = useAppStore((state) => state.profile.introAnswers);
  const setIntroAnswer = useAppStore((state) => state.setIntroAnswer);
  const shuffleIntro = useAppStore((state) => state.shuffleIntro);

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-6 px-5 pb-12 pt-4"
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

      {INTRO_QUESTIONS.map((question) => (
        <View key={question.id} className="gap-3">
          <View className="gap-0.5">
            <Typography type="body-sm" weight="semibold">
              {question.prompt}
            </Typography>
            <Typography type="body-xs" color="muted">
              {question.helper}
            </Typography>
          </View>
          <IntroOptionList
            question={question}
            selectedId={answers[question.id]}
            onSelect={(optionId) => setIntroAnswer(question.id, optionId)}
          />
        </View>
      ))}

      <Button onPress={() => goBackOrReplace('/(tabs)/profile')}>
        <Button.Label>Done</Button.Label>
      </Button>
    </ScrollView>
  );
}
