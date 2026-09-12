import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Button, PressableFeedback, Surface, Typography, useThemeColor } from 'heroui-native';
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
import { useEffect } from 'react';

import { PingSummaryCard } from '@/components/PingSummaryCard';
import { RadiusSlider } from '@/components/RadiusSlider';
import { useTicker } from '@/hooks/useTicker';
import { distanceKm, formatClock, formatCountdown } from '@/lib/geo';
import { HOME, SPOTS } from '@/lib/mockData';
import {
  isHostedByMe,
  isOver,
  isSettled,
  needsMyAnswer,
  pingList,
  pingRoute,
  pingSpot,
} from '@/lib/pings';
import { peopleInRadius, useAppStore } from '@/lib/store';

const HOW_IT_WORKS = [
  'Press the button — we look for places and events inside your radius.',
  'Pick one. Everyone nearby with the app gets buzzed, not just your friends.',
  'Whoever wants in says so and picks how long they need to get ready.',
  'The app sets the meeting point and a time the slowest person can make.',
];

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
  const [accent, accentForeground] = useThemeColor(['accent', 'accent-foreground']);

  const profile = useAppStore((state) => state.profile);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const pings = useAppStore((state) => state.pings);
  const pingIds = useAppStore((state) => state.pingIds);

  const nearbyPeople = useMemo(() => peopleInRadius(profile.radiusKm).length, [profile.radiusKm]);
  const nearbySpots = useMemo(
    () => SPOTS.filter((spot) => distanceKm(HOME, spot.location) <= profile.radiusKm).length,
    [profile.radiusKm],
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

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-6 px-5 pb-12 pt-safe-offset-4"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-1">
        <Typography type="h2">Out of your bubble</Typography>
        <View className="flex-row items-center gap-1.5">
          <MapPin color={accent} size={14} />
          <Typography type="body-sm" color="muted">
            {HOME.label}
          </Typography>
        </View>
      </View>

      <View className="items-center justify-center py-2">
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
              borderColor: accent,
            },
          ]}
        />
        <PressableFeedback
          onPress={() => router.push('/discover')}
          accessibilityRole="button"
          accessibilityLabel="Find something happening around me"
        >
          <View className="bg-accent h-52 w-52 items-center justify-center gap-2 rounded-full">
            <Radar color={accentForeground} size={40} />
            <Typography type="h4" className="text-accent-foreground">
              Get me out
            </Typography>
            <Typography type="body-xs" align="center" className="text-accent-foreground px-8">
              {nearbySpots} spots within {profile.radiusKm} km
            </Typography>
          </View>
        </PressableFeedback>
      </View>

      {liveHosted ? (
        <Surface variant="default" className="gap-3 rounded-3xl p-4">
          <View className="flex-row items-center gap-2">
            <Users color={accent} size={16} />
            <Typography type="body-sm" weight="semibold">
              Your ping is live
            </Typography>
          </View>
          <Typography type="body-sm" color="muted">
            {pingSpot(liveHosted)?.name} · {liveHosted.joins.length} in,{' '}
            {liveHosted.notifiedIds.length} phones buzzed
          </Typography>
          <Button onPress={() => router.push(pingRoute(liveHosted))}>
            <Button.Label>Open it</Button.Label>
          </Button>
        </Surface>
      ) : null}

      {nextPlan?.meetAt ? (
        <Surface variant="secondary" className="gap-2 rounded-3xl p-4">
          <Typography type="body-xs" color="muted">
            NEXT PLAN
          </Typography>
          <Typography type="h5">
            {pingSpot(nextPlan)?.name} at {formatClock(nextPlan.meetAt)}
          </Typography>
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
            <BellRing color={accent} size={16} />
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
              myName={profile.name}
              onPress={() => router.push(pingRoute(ping))}
            />
          ))}
        </Surface>
      ) : null}

      <Surface variant="default" className="gap-3 rounded-3xl p-4">
        <RadiusSlider
          radiusKm={profile.radiusKm}
          onChange={(km) => updateProfile({ radiusKm: km })}
          hint={`${nearbyPeople} people with the app are inside this radius right now.`}
        />
      </Surface>

      <View className="gap-3 px-1">
        <Typography type="body-sm" weight="semibold">
          How this works
        </Typography>
        {HOW_IT_WORKS.map((step, index) => (
          <View key={step} className="flex-row gap-3">
            <View className="bg-accent-soft h-6 w-6 items-center justify-center rounded-full">
              <Typography type="body-xs" className="text-accent-soft-foreground">
                {index + 1}
              </Typography>
            </View>
            <Typography type="body-sm" color="muted" className="flex-1">
              {step}
            </Typography>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
