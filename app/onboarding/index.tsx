import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Button,
  Description,
  FieldError,
  Input,
  Label,
  TextField,
  Typography,
} from 'heroui-native';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { OnboardingProgress } from '@/components/OnboardingProgress';
import { BubbleField } from '@/components/BubbleField';
import { Heading, Wordmark } from '@/components/Heading';
import { useAppStore } from '@/lib/store';

const MIN_NAME_LENGTH = 2;

export default function OnboardingNameScreen() {
  const router = useRouter();
  const savedName = useAppStore((state) => state.profile.firstName);
  const setFirstName = useAppStore((state) => state.setFirstName);

  const [value, setValue] = useState(savedName);
  const [submitted, setSubmitted] = useState(false);

  const trimmed = value.trim();
  const invalid = submitted && trimmed.length < MIN_NAME_LENGTH;

  const submit = () => {
    setSubmitted(true);
    if (trimmed.length < MIN_NAME_LENGTH) return;
    setFirstName(trimmed);
    router.push('/onboarding/questions');
  };

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="grow gap-7 px-6 pb-10 pt-safe-offset-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <OnboardingProgress step={1} total={4} />

        <View className="relative gap-2 overflow-hidden">
          <BubbleField preset="header" />
          <Wordmark size="sm" />
          <Heading type="h2">What should people call you?</Heading>
          <Typography type="body-sm" color="muted">
            Your first name is all we ask for. No photo, no age, no life story — a few quick
            questions turn into a short intro written in your own voice instead.
          </Typography>
        </View>

        <TextField isInvalid={invalid}>
          <Label>First name</Label>
          <Input
            value={value}
            onChangeText={setValue}
            placeholder="Alex"
            autoCapitalize="words"
            autoCorrect={false}
            autoComplete="given-name"
            maxLength={24}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          <Description>
            Shown exactly like this when your ping lands on someone&apos;s phone.
          </Description>
          <FieldError>Two letters minimum — we need something to call you.</FieldError>
        </TextField>

        <View className="grow" />

        <Button onPress={submit}>
          <Button.Label>Next: five questions</Button.Label>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
