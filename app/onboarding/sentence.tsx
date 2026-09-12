import { Redirect, useRouter } from 'expo-router';
import { Button, Surface, Typography, useThemeColor } from 'heroui-native';
import { RefreshCw, Sparkles } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { hasAllIntroAnswers } from '@/lib/introSentence';
import { goBackOrReplace } from '@/lib/navigation';
import { useAppStore } from '@/lib/store';

export default function OnboardingSentenceScreen() {
  const router = useRouter();
  const [accent] = useThemeColor(['accent']);
  const intro = useAppStore((state) => state.profile.intro);
  const answers = useAppStore((state) => state.profile.introAnswers);
  const shuffleIntro = useAppStore((state) => state.shuffleIntro);

  // Reachable directly by link, and a swapped question leaves a topic blank.
  if (!intro || !hasAllIntroAnswers(answers)) return <Redirect href="/onboarding/questions" />;

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="grow gap-7 px-6 pb-12 pt-safe-offset-6"
      showsVerticalScrollIndicator={false}
    >
      <OnboardingProgress
        step={3}
        total={4}
        onBack={() => goBackOrReplace('/onboarding/questions')}
      />

      <View className="gap-2">
        <Typography type="h2">Here you are, in one line</Typography>
        <Typography type="body-sm" color="muted">
          This is the only thing other people read about you. No photo, no age, nothing to scroll.
        </Typography>
      </View>

      <Surface variant="secondary" className="gap-3 rounded-3xl p-5">
        <View className="flex-row items-center gap-2">
          <Sparkles color={accent} size={16} />
          <Typography type="body-xs" color="muted" className="tracking-widest uppercase">
            Your one-liner
          </Typography>
        </View>
        <Animated.View key={intro} entering={FadeIn.duration(240)}>
          <Typography type="h5">{intro}</Typography>
        </Animated.View>
      </Surface>

      <Typography type="body-xs" color="muted">
        Written on your phone from your five answers. Change the wording as often as you like — you
        can also redo the questions later from your profile.
      </Typography>

      <View className="grow" />

      <View className="gap-3">
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
        <Button onPress={() => router.push('/onboarding/verify')}>
          <Button.Label>That&apos;s me</Button.Label>
        </Button>
      </View>
    </ScrollView>
  );
}
