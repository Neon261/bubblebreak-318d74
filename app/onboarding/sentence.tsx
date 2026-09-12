import { Redirect, useRouter } from 'expo-router';
import { Button, Surface, Typography } from 'heroui-native';
import { RefreshCw, Sparkles } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { BubbleField } from '@/components/BubbleField';
import { Heading } from '@/components/Heading';
import { hasAllIntroAnswers } from '@/lib/introSentence';
import { goBackOrReplace } from '@/lib/navigation';
import { useAppStore } from '@/lib/store';
import { BRAND } from '@/lib/theme';

export default function OnboardingSentenceScreen() {
  const router = useRouter();
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

      <View className="relative gap-2 overflow-hidden">
        <BubbleField preset="header" />
        <Heading type="h2">This is how you introduce yourself</Heading>
        <Typography type="body-sm" color="muted">
          Written in your own voice from your five answers. It is the only thing other people read
          about you — no photo, no age, nothing to scroll.
        </Typography>
      </View>

      <Surface variant="secondary" className="relative gap-3 overflow-hidden rounded-3xl p-5">
        <BubbleField preset="rise" />
        <View className="flex-row items-center gap-2">
          <Sparkles color={BRAND.accent} size={16} />
          <Typography type="body-xs" color="muted" className="tracking-widest uppercase">
            Your intro
          </Typography>
        </View>
        <Animated.View key={intro} entering={FadeIn.duration(240)}>
          <Typography type="body" className="leading-relaxed">
            {intro}
          </Typography>
        </Animated.View>
      </Surface>

      <Typography type="body-xs" color="muted">
        Put together on your phone, so nothing you typed leaves it. Try other wordings as often as
        you like — you can also redo the questions later from your profile.
      </Typography>

      <View className="grow" />

      <View className="gap-3">
        <Button variant="tertiary" onPress={shuffleIntro}>
          <Button.Label>
            <View className="flex-row items-center gap-2">
              <RefreshCw color={BRAND.accent} size={16} />
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
