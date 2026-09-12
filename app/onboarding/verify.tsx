import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Spinner, Surface, Typography, useThemeColor } from 'heroui-native';
import { Check, ShieldCheck } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { goBackOrReplace } from '@/lib/navigation';
import { useAppStore } from '@/lib/store';
import { runVerification, VERIFY_PROVIDER, VERIFY_STEPS } from '@/lib/verification';

const PROMISES = [
  `${VERIFY_PROVIDER} does the document and liveness check on their side.`,
  'BubbleBreak only ever receives a pass and a reference code.',
  'No photo of you is stored or shown anywhere in the app.',
];

export default function OnboardingVerifyScreen() {
  const [accent, success] = useThemeColor(['accent', 'success']);
  const status = useAppStore((state) => state.profile.verification.status);
  const reference = useAppStore((state) => state.profile.verification.reference);
  const markVerified = useAppStore((state) => state.markVerified);
  const completeRegistration = useAppStore((state) => state.completeRegistration);

  const [runningStep, setRunningStep] = useState<number | undefined>(undefined);
  const cancelled = useRef(false);

  useEffect(
    () => () => {
      cancelled.current = true;
    },
    [],
  );

  const verified = status === 'verified';
  const running = runningStep !== undefined && !verified;

  const start = useCallback(async () => {
    cancelled.current = false;
    setRunningStep(0);
    const result = await runVerification(setRunningStep, () => cancelled.current);
    if (result) markVerified(result);
    setRunningStep(undefined);
  }, [markVerified]);

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="grow gap-7 px-6 pb-12 pt-safe-offset-6"
      showsVerticalScrollIndicator={false}
    >
      <OnboardingProgress
        step={4}
        total={4}
        onBack={running || verified ? undefined : () => goBackOrReplace('/onboarding/sentence')}
      />

      <View className="gap-2">
        <Typography type="h2">Prove you&apos;re a real person</Typography>
        <Typography type="body-sm" color="muted">
          Strangers are about to meet you somewhere within a few kilometres. Everyone here passes an
          identity check with {VERIFY_PROVIDER}, an outside provider, before they can use the app.
        </Typography>
      </View>

      <Surface variant="default" className="gap-3 rounded-3xl p-4">
        {PROMISES.map((line) => (
          <View key={line} className="flex-row gap-3">
            <Check color={accent} size={16} />
            <Typography type="body-sm" color="muted" className="flex-1">
              {line}
            </Typography>
          </View>
        ))}
      </Surface>

      {running ? (
        <Surface variant="secondary" className="gap-3 rounded-3xl p-4">
          {VERIFY_STEPS.map((label, index) => {
            const done = runningStep !== undefined && index < runningStep;
            const active = index === runningStep;
            return (
              <View key={label} className="h-6 flex-row items-center gap-3">
                <View className="h-5 w-5 items-center justify-center">
                  {done ? <Check color={success} size={16} /> : null}
                  {active ? <Spinner size="sm" /> : null}
                </View>
                <Typography type="body-sm" color={done || active ? 'default' : 'muted'}>
                  {label}
                </Typography>
              </View>
            );
          })}
        </Surface>
      ) : null}

      {verified ? (
        <Animated.View entering={FadeIn.duration(240)}>
          <Surface variant="secondary" className="gap-2 rounded-3xl p-5">
            <View className="flex-row items-center gap-2">
              <ShieldCheck color={success} size={20} />
              <Typography type="h5">You&apos;re verified</Typography>
            </View>
            <Typography type="body-sm" color="muted">
              {VERIFY_PROVIDER} confirmed you are a real person. Reference {reference}.
            </Typography>
          </Surface>
        </Animated.View>
      ) : null}

      <View className="grow" />

      <Typography type="body-xs" color="muted">
        Demo handoff: this build simulates the round-trip to {VERIFY_PROVIDER}, so nothing is
        uploaded from your phone.
      </Typography>

      {verified ? (
        <Button onPress={completeRegistration}>
          <Button.Label>Enter BubbleBreak</Button.Label>
        </Button>
      ) : (
        <Button onPress={() => void start()} isDisabled={running}>
          <Button.Label>{running ? 'Checking…' : `Verify with ${VERIFY_PROVIDER}`}</Button.Label>
        </Button>
      )}
    </ScrollView>
  );
}
