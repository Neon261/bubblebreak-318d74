import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, Chip, Input, Label, Surface, Switch, TextField, Typography } from 'heroui-native';
import { RefreshCw, Sparkles } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { BubbleField } from '@/components/BubbleField';
import { Heading } from '@/components/Heading';
import { PersonAvatar } from '@/components/PersonAvatar';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { ALL_INTERESTS, INTEREST_LABELS } from '@/lib/mockData';
import { currentLocationLabel } from '@/lib/pings';
import { useAppStore } from '@/lib/store';
import { BRAND } from '@/lib/theme';
import type { Interest } from '@/lib/types';

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useAppStore((state) => state.profile);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const setFirstName = useAppStore((state) => state.setFirstName);
  const shuffleIntro = useAppStore((state) => state.shuffleIntro);

  const [nameDraft, setNameDraft] = useState(profile.firstName);

  const toggleInterest = (interest: Interest) => {
    const has = profile.interests.includes(interest);
    updateProfile({
      interests: has
        ? profile.interests.filter((item) => item !== interest)
        : [...profile.interests, interest],
    });
  };

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="gap-5 px-5 pb-12 pt-safe-offset-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative flex-row items-center gap-4 overflow-hidden py-1">
          <BubbleField preset="header" animate={false} />
          <PersonAvatar name={profile.firstName} colorClass="bg-accent-soft" size="lg" />
          <View className="flex-1 gap-1">
            <Heading type="h3">{profile.firstName}</Heading>
            <Typography type="body-sm" color="muted">
              {currentLocationLabel(profile)}
            </Typography>
            <View className="flex-row">
              <VerifiedBadge label={`Verified by ${profile.verification.provider}`} />
            </View>
          </View>
        </View>

        <Surface variant="secondary" className="relative gap-3 overflow-hidden rounded-3xl p-4">
          <BubbleField preset="rise" animate={false} />
          <View className="flex-row items-center gap-2">
            <Sparkles color={BRAND.accent} size={16} />
            <Typography type="body-xs" color="muted" className="tracking-widest uppercase">
              What people read about you
            </Typography>
          </View>
          <Typography type="body">{profile.intro}</Typography>
          <View className="gap-2">
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
            <Button variant="ghost" onPress={() => router.push('/intro')}>
              <Button.Label>Answer the questions again</Button.Label>
            </Button>
          </View>
        </Surface>

        <Surface variant="default" className="gap-4 rounded-3xl p-4">
          <TextField>
            <Label>First name</Label>
            <Input
              value={nameDraft}
              onChangeText={setNameDraft}
              onBlur={() => setFirstName(nameDraft.trim() || profile.firstName)}
              placeholder="What people see when you ping"
              autoCapitalize="words"
              maxLength={24}
            />
          </TextField>
        </Surface>

        <Surface variant="default" className="gap-2 rounded-3xl p-4">
          <View className="flex-row items-center gap-2">
            <VerifiedBadge />
            <Typography type="body-sm" weight="medium">
              Identity check passed
            </Typography>
          </View>
          <Typography type="body-xs" color="muted">
            {profile.verification.provider} confirmed you are a real person. Reference{' '}
            {profile.verification.reference}. Everyone you meet here passed the same check — no
            photos, no ages, just verified people.
          </Typography>
        </Surface>

        <Surface variant="default" className="gap-3 rounded-3xl p-4">
          <Typography type="body-sm" weight="medium">
            What pulls you out of the house
          </Typography>
          <View className="flex-row flex-wrap gap-2">
            {ALL_INTERESTS.map((interest) => {
              const selected = profile.interests.includes(interest);
              return (
                <Chip
                  key={interest}
                  variant={selected ? 'primary' : 'tertiary'}
                  color={selected ? 'accent' : 'default'}
                  onPress={() => toggleInterest(interest)}
                >
                  <Chip.Label>{INTEREST_LABELS[interest]}</Chip.Label>
                </Chip>
              );
            })}
          </View>
          <Typography type="body-xs" color="muted">
            Used to sort what we suggest — you still see everything nearby.
          </Typography>
        </Surface>

        <Surface variant="default" className="gap-4 rounded-3xl p-4">
          <View className="flex-row items-center gap-4">
            <View className="flex-1 gap-0.5">
              <Typography type="body-sm" weight="medium">
                Let strangers ping me
              </Typography>
              <Typography type="body-xs" color="muted">
                Off means you can still start pings, but nobody reaches you.
              </Typography>
            </View>
            <Switch
              isSelected={profile.openToPings}
              onSelectedChange={(value) => updateProfile({ openToPings: value })}
            >
              <Switch.Thumb />
            </Switch>
          </View>

          <View className="flex-row items-center gap-4">
            <View className="flex-1 gap-0.5">
              <Typography type="body-sm" weight="medium">
                Push notifications
              </Typography>
              <Typography type="body-xs" color="muted">
                Buzz when someone heads out or a plan gets a time.
              </Typography>
            </View>
            <Switch
              isSelected={profile.notificationsEnabled}
              onSelectedChange={(value) => updateProfile({ notificationsEnabled: value })}
            >
              <Switch.Thumb />
            </Switch>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
