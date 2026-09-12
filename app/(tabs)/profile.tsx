import {
  Chip,
  Input,
  Label,
  Surface,
  Switch,
  TextArea,
  TextField,
  Typography,
} from 'heroui-native';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { PersonAvatar } from '@/components/PersonAvatar';
import { RadiusSlider } from '@/components/RadiusSlider';
import { ReadyPicker } from '@/components/ReadyPicker';
import { TRAVEL_MODES, travelModeLabel } from '@/lib/geo';
import { ALL_INTERESTS, HOME, INTEREST_LABELS } from '@/lib/mockData';
import { peopleInRadius, useAppStore } from '@/lib/store';
import type { Interest } from '@/lib/types';

export default function ProfileScreen() {
  const profile = useAppStore((state) => state.profile);
  const updateProfile = useAppStore((state) => state.updateProfile);

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
        <View className="flex-row items-center gap-4">
          <PersonAvatar name={profile.name} colorClass="bg-accent-soft" size="lg" />
          <View className="flex-1 gap-1">
            <Typography type="h3">{profile.name}</Typography>
            <Typography type="body-sm" color="muted">
              {HOME.label}
            </Typography>
          </View>
        </View>

        <Surface variant="default" className="gap-4 rounded-3xl p-4">
          <TextField>
            <Label>Your name</Label>
            <Input
              value={profile.name}
              onChangeText={(text) => updateProfile({ name: text })}
              placeholder="What people see when you ping"
            />
          </TextField>

          <TextField>
            <Label>One line about you</Label>
            <TextArea
              value={profile.bio}
              onChangeText={(text) => updateProfile({ bio: text })}
              placeholder="Something a stranger could start a conversation with"
            />
          </TextField>
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
          <View className="gap-3">
            <Typography type="body-sm" weight="medium">
              How you usually get around
            </Typography>
            <View className="flex-row flex-wrap gap-2">
              {TRAVEL_MODES.map((mode) => {
                const selected = profile.travelMode === mode;
                return (
                  <Chip
                    key={mode}
                    variant={selected ? 'primary' : 'tertiary'}
                    color={selected ? 'accent' : 'default'}
                    onPress={() => updateProfile({ travelMode: mode })}
                  >
                    <Chip.Label>{travelModeLabel(mode)}</Chip.Label>
                  </Chip>
                );
              })}
            </View>
          </View>

          <ReadyPicker
            value={profile.defaultReadyMinutes}
            onChange={(minutes) => updateProfile({ defaultReadyMinutes: minutes })}
            label="Your usual head start"
            hint="Pre-filled when you join something. You can change it every time."
          />
        </Surface>

        <Surface variant="default" className="gap-3 rounded-3xl p-4">
          <RadiusSlider
            radiusKm={profile.radiusKm}
            onChange={(km) => updateProfile({ radiusKm: km })}
            hint={`${peopleInRadius(profile.radiusKm).length} people with the app are inside this radius.`}
          />
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
