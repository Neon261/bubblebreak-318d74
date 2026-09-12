import { useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Button, PressableFeedback, Surface, Typography } from 'heroui-native';
import { BellRing, MapPin, Radar, Users } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { PingSummaryCard } from '@/components/PingSummaryCard';
import { BubbleField } from '@/components/BubbleField';
import { Heading, Wordmark } from '@/components/Heading';
import { RadiusSlider } from '@/components/RadiusSlider';
import { useTicker } from '@/hooks/useTicker';
import { distanceKm, formatClock, formatCountdown } from '@/lib/geo';
import { SPOTS } from '@/lib/mockData';
import {
  currentLocation,
  currentLocationLabel,
  isHostedByMe,
  isOver,
  isSettled,
  needsMyAnswer,
  pingList,
  pingRoute,
  pingSpot,
  spotsTaken,
} from '@/lib/pings';
import { peopleInRadius, useAppStore } from '@/lib/store';
import { BRAND } from '@/lib/theme';

/** A shared value that repeatedly animates from 0 to 1, for pulsing UI effects. */
function usePulse(durationMs: number): SharedValue<number> {
  const pulse = useSharedValue(0);

  useEffect(() => {
    // oxlint-disable-next-line react/immutability -- Reanimated's SharedValue is mutable by design; writing to `.value` is the documented API for worklet-driven animations.
    pulse.value = withRepeat(
      withTiming(1, { duration: durationMs, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, [pulse, durationMs]);

  return pulse;
}

export default function PingHomeScreen() {
  const router = useRouter();
  const now = useTicker(1000);

  const profile = useAppStore((state) => state.profile);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const setLocation = useAppStore((state) => state.setLocation);
  const pings = useAppStore((state) => state.pings);
  const pingIds = useAppStore((state) => state.pingIds);

  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string>();
  const origin = currentLocation(profile);
  const locationLabel = currentLocationLabel(profile);

  const nearbyPeople = useMemo(
    () => peopleInRadius(profile.radiusKm, origin).length,
    [origin, profile.radiusKm],
  );
  const nearbySpots = useMemo(
    () => SPOTS.filter((spot) => distanceKm(origin, spot.location) <= profile.radiusKm).length,
    [origin, profile.radiusKm],
  );

  const all = useMemo(() => pingList(pings, pingIds), [pings, pingIds]);
  const liveHosted = all.find((ping) => isHostedByMe(ping) && ping.status === 'open');
  const openInvites = all.filter(needsMyAnswer);
  const nextPlan = useMemo(
    () =>
      [...all]
        .filter((ping) => isSettled(ping) && !isOver(ping, now))
        .sort((a, b) => (a.meetAt ?? 0) - (b.meetAt ?? 0))[0],
    [all, now],
  );

  const pulse = usePulse(2200);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.25 }],
    opacity: 0.4 * (1 - pulse.value),
  }));

  const grantLocation = async () => {
    setLocating(true);
    setLocationError(undefined);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setLocation('denied');
        setLocationError('Location was not allowed. Hamburg city centre stays selected.');
        return;
      }
      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation('granted', {
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      });
    } catch {
      setLocationError('We could not read your location. Hamburg city centre stays selected.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-6 px-5 pb-12 pt-safe-offset-4"
      showsVerticalScrollIndicator={false}
    >
      <View className="relative gap-2 overflow-hidden pb-1">
        <BubbleField preset="header" />
        <Wordmark size="sm" />
        <Heading type="h2" className="max-w-64">
          Out of your bubble
        </Heading>
        <View className="flex-row items-center gap-1.5">
          <MapPin color={BRAND.accent} size={14} />
          <Typography type="body-sm" color="muted">
            {locationLabel}
          </Typography>
        </View>
      </View>

      <Surface variant="default" className="border-border gap-4 rounded-3xl border p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <Typography type="body-sm" weight="semibold">
              {locationLabel}
            </Typography>
            <Typography type="body-xs" color="muted">
              {profile.locationPermission === 'granted'
                ? 'Only your phone uses this position for nearby ideas and travel estimates.'
                : 'This is the default. You can only change it by granting your phone’s GPS location.'}
            </Typography>
          </View>
          <MapPin color={BRAND.secondary} size={20} />
        </View>
        <Button variant="secondary" size="sm" onPress={grantLocation} isLoading={locating}>
          <Button.Label>
            {profile.locationPermission === 'granted' ? 'Refresh GPS location' : 'Use my GPS location'}
          </Button.Label>
        </Button>
        {locationError ? (
          <Typography type="body-xs" className="text-danger">
            {locationError}
          </Typography>
        ) : null}
        <RadiusSlider
          radiusKm={profile.radiusKm}
          onChange={(km) => updateProfile({ radiusKm: km })}
          hint={`${nearbyPeople} people with the app are inside this radius right now.`}
        />
      </Surface>

      <View className="relative items-center justify-center overflow-hidden rounded-[40px] py-5">
        <BubbleField
          bubbles={[
            { size: 84, top: 4, left: 2, tint: 'teal', opacity: 0.55, drift: 9, duration: 5000 },
            {
              size: 40,
              bottom: 16,
              right: 10,
              tint: 'lilac',
              hollow: true,
              opacity: 0.8,
              drift: 14,
              duration: 3800,
              delay: 500,
            },
            {
              size: 16,
              top: 34,
              right: 46,
              tint: 'apricot',
              drift: 18,
              duration: 3000,
              delay: 200,
            },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            ringStyle,
            {
              position: 'absolute',
              height: 208,
              width: 208,
              borderRadius: 104,
              borderWidth: 2,
              borderColor: BRAND.accent,
            },
          ]}
        />
        <PressableFeedback
          onPress={() => router.push('/discover')}
          accessibilityRole="button"
          accessibilityLabel="Find something happening around me"
        >
          <View className="bg-accent h-52 w-52 items-center justify-center gap-2 rounded-full">
            <Radar color="#ffffff" size={40} />
            <Heading type="h4" className="text-accent-foreground">
              Get me out
            </Heading>
            <Typography type="body-xs" align="center" className="text-accent-foreground px-8">
              {nearbySpots} places within {profile.radiusKm} km
            </Typography>
          </View>
        </PressableFeedback>
      </View>

      {liveHosted ? (
        <Surface variant="default" className="gap-3 rounded-3xl p-4">
          <View className="flex-row items-center gap-2">
            <Users color={BRAND.accent} size={16} />
            <Typography type="body-sm" weight="semibold">
              Your ping is live
            </Typography>
          </View>
          <Typography type="body-sm" color="muted">
            {pingSpot(liveHosted)?.name} · {spotsTaken(liveHosted)} of {liveHosted.spotsForOthers}{' '}
            {liveHosted.spotsForOthers === 1 ? 'spot' : 'spots'} taken,{' '}
            {liveHosted.notifiedIds.length} phones buzzed
          </Typography>
          <Button onPress={() => router.push(pingRoute(liveHosted))}>
            <Button.Label>Open it</Button.Label>
          </Button>
        </Surface>
      ) : null}

      {nextPlan?.meetAt ? (
        <Surface variant="secondary" className="relative gap-2 overflow-hidden rounded-3xl p-4">
          <BubbleField preset="soft" animate={false} />
          <Typography type="body-xs" color="muted" className="tracking-widest uppercase">
            Next plan
          </Typography>
          <Heading type="h5">
            {pingSpot(nextPlan)?.name} at {formatClock(nextPlan.meetAt)}
          </Heading>
          <Typography type="body-sm" color="muted">
            In {formatCountdown(nextPlan.meetAt - now)} · {nextPlan.joins.length} people
          </Typography>
          <Button variant="secondary" onPress={() => router.push(pingRoute(nextPlan))}>
            <Button.Label>See the plan</Button.Label>
          </Button>
        </Surface>
      ) : null}

      {openInvites.length > 0 ? (
        <Surface variant="default" className="border-border gap-3 rounded-3xl border p-4">
          <View className="flex-row items-center gap-2">
            <BellRing color={BRAND.accent} size={16} />
            <Typography type="body-sm" weight="semibold">
              {openInvites.length === 1
                ? 'Someone nearby is heading out'
                : `${openInvites.length} people nearby are heading out`}
            </Typography>
          </View>
          {openInvites.slice(0, 2).map((ping) => (
            <PingSummaryCard
              key={ping.id}
              ping={ping}
              myName={profile.firstName}
              showDetails
              onPress={() => router.push(pingRoute(ping))}
            />
          ))}
        </Surface>
      ) : null}

      <View className="gap-3 px-1 pt-2">
        <Heading type="h5">What would you like to do?</Heading>
        <Surface variant="secondary" className="gap-2 rounded-3xl p-4">
          <Typography type="body-sm" weight="semibold">
            1 · Find an interesting activity
          </Typography>
          <Typography type="body-xs" color="muted">
            Tap Get me out to see nearby places and things happening today.
          </Typography>
          <Button size="sm" onPress={() => router.push('/discover')}>
            <Button.Label>Get me out</Button.Label>
          </Button>
        </Surface>
        <Surface variant="default" className="border-border gap-2 rounded-3xl border p-4">
          <Typography type="body-sm" weight="semibold">
            2 · Join another person’s plan
          </Typography>
          <Typography type="body-xs" color="muted">
            Open Invitations to answer nearby pings and keep up with chats.
          </Typography>
          <Button variant="secondary" size="sm" onPress={() => router.push('/invites')}>
            <Button.Label>Check invitations</Button.Label>
          </Button>
        </Surface>
      </View>
    </ScrollView>
  );
}
