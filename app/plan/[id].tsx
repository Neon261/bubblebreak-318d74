import { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Spinner, Surface, Typography } from 'heroui-native';
import { CalendarX, Clock, MapPin, Users } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { BubbleField } from '@/components/BubbleField';
import { EmptyState } from '@/components/EmptyState';
import { Heading } from '@/components/Heading';
import { JoinerRow } from '@/components/JoinerRow';
import { PingMap } from '@/components/PingMap';
import { useTicker } from '@/hooks/useTicker';
import { formatClock, formatCountdown, formatDistance } from '@/lib/geo';
import { HOME } from '@/lib/mockData';
import { goBackOrReplace } from '@/lib/navigation';
import {
  hostName,
  isHostedByMe,
  myJoin,
  participantName,
  pingSpot,
  slowestJoin,
} from '@/lib/pings';
import { useAppStore } from '@/lib/store';
import { BRAND } from '@/lib/theme';

export default function PlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const now = useTicker(1000);

  const pingId = id ?? '';
  const ping = useAppStore((state) => state.pings[pingId]);
  const profile = useAppStore((state) => state.profile);
  const leavePing = useAppStore((state) => state.leavePing);

  const spot = ping ? pingSpot(ping) : undefined;
  const mine = ping ? myJoin(ping) : undefined;
  const slowest = ping ? slowestJoin(ping) : undefined;
  const sortedJoins = useMemo(
    () => (ping ? [...ping.joins].sort((a, b) => a.joinedAt - b.joinedAt) : []),
    [ping],
  );

  if (!ping || !spot) {
    return (
      <View className="bg-background flex-1">
        <EmptyState
          icon={CalendarX}
          title="Plan not found"
          body="Plans live for the session only. Start a new ping to get something going."
          actionLabel="Back to plans"
          onAction={() => goBackOrReplace('/(tabs)/plans')}
        />
      </View>
    );
  }

  const host = hostName(ping, profile.firstName);
  const leaveBy = ping.meetAt && mine ? ping.meetAt - mine.travelMinutes * 60_000 : undefined;

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-4 px-5 pb-12 pt-4"
      showsVerticalScrollIndicator={false}
    >
      {ping.status === 'cancelled' ? (
        <Surface variant="secondary" className="gap-1 rounded-3xl p-4">
          <Typography type="body" weight="semibold">
            Called off
          </Typography>
          <Typography type="body-sm" color="muted">
            This one is not happening. Nobody is waiting for you.
          </Typography>
        </Surface>
      ) : null}

      {ping.status === 'declined' ? (
        <Surface variant="secondary" className="gap-1 rounded-3xl p-4">
          <Typography type="body" weight="semibold">
            You passed on this
          </Typography>
          <Typography type="body-sm" color="muted">
            No hard feelings — {host} went without you.
          </Typography>
        </Surface>
      ) : null}

      {ping.status === 'open' ? (
        <Surface variant="secondary" className="gap-2 rounded-3xl p-4">
          <View className="flex-row items-center gap-2">
            <Spinner />
            <Typography type="body-sm" weight="semibold">
              {isHostedByMe(ping) ? 'Collecting answers' : `Waiting for ${host} to set the time`}
            </Typography>
          </View>
          <Typography type="body-sm" color="muted">
            You are in. As soon as the time is set, it lands here and on your lock screen.
          </Typography>
        </Surface>
      ) : null}

      {ping.meetAt ? (
        <Surface
          variant="default"
          className="bg-accent-soft relative gap-2 overflow-hidden rounded-3xl p-5"
        >
          <BubbleField
            bubbles={[
              { size: 120, top: -46, right: -30, tint: 'apricot', opacity: 0.55 },
              { size: 44, bottom: -14, right: 54, tint: 'lilac', hollow: true, opacity: 0.5 },
              { size: 16, top: 26, right: 96, tint: 'teal', opacity: 0.6 },
            ]}
          />
          <Typography
            type="body-xs"
            className="text-accent-soft-foreground tracking-widest uppercase"
          >
            Meet at
          </Typography>
          <Heading type="h1" className="text-accent-soft-foreground">
            {formatClock(ping.meetAt)}
          </Heading>
          <Typography type="body-sm" className="text-accent-soft-foreground">
            {ping.meetAt > now
              ? `In ${formatCountdown(ping.meetAt - now)}`
              : 'That was the plan — hope you made it'}
            {leaveBy ? ` · leave by ${formatClock(leaveBy)}` : ''}
          </Typography>
        </Surface>
      ) : null}

      <Surface variant="default" className="gap-3 rounded-3xl p-4">
        <View className="flex-row items-start gap-2">
          <MapPin color={BRAND.accent} size={18} />
          <View className="flex-1 gap-0.5">
            <Typography type="body" weight="semibold">
              {spot.name}
            </Typography>
            <Typography type="body-sm" color="muted">
              {spot.address} · {formatDistance(mine?.distanceKm ?? 0)} from you
            </Typography>
          </View>
        </View>

        <View className="bg-background-secondary rounded-2xl px-3 py-2">
          <Typography type="body-sm">Find each other: {spot.meetingHint}</Typography>
        </View>

        <PingMap home={HOME} spot={spot} joins={ping.joins} height={200} />

        <Typography type="body-sm" color="muted">
          {spot.description}
        </Typography>
      </Surface>

      <Surface variant="default" className="gap-1 rounded-3xl p-4">
        <View className="flex-row items-center gap-2 pb-1">
          <Users color={BRAND.accent} size={16} />
          <Typography type="body-sm" weight="semibold">
            {sortedJoins.length} coming
          </Typography>
        </View>
        {sortedJoins.map((participant) => (
          <JoinerRow
            key={participant.personId}
            participant={participant}
            myName={profile.firstName}
            meetAt={ping.meetAt}
            isHost={participant.personId === ping.hostId}
          />
        ))}
        {ping.missedIds.length > 0 ? (
          <Typography type="body-xs" color="muted" className="pt-1">
            Kept to {ping.spotsForOthers + 1} people · {ping.missedIds.length}{' '}
            {ping.missedIds.length === 1 ? 'person' : 'people'} wanted in after the spots went.
          </Typography>
        ) : null}
      </Surface>

      {ping.meetAt && slowest ? (
        <Surface variant="secondary" className="gap-2 rounded-3xl p-4">
          <View className="flex-row items-center gap-2">
            <Clock color={BRAND.muted} size={16} />
            <Typography type="body-sm" weight="semibold">
              Why this time
            </Typography>
          </View>
          <Typography type="body-sm" color="muted">
            {participantName(slowest, profile.firstName)} needs the longest: {slowest.readyMinutes}{' '}
            min to get ready plus {slowest.travelMinutes} min to get there. Everyone else has slack,
            and there is a five minute buffer on top.
          </Typography>
        </Surface>
      ) : null}

      {mine && ping.status !== 'cancelled' ? (
        <Button variant="danger-soft" onPress={() => leavePing(ping.id)}>
          <Button.Label>{isHostedByMe(ping) ? 'Call it off' : 'Leave the plan'}</Button.Label>
        </Button>
      ) : (
        <Button variant="secondary" onPress={() => router.push('/discover')}>
          <Button.Label>Find something else</Button.Label>
        </Button>
      )}
    </ScrollView>
  );
}
