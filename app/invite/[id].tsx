import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Surface, Typography, useThemeColor } from 'heroui-native';
import { Inbox, Users } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { JoinerRow } from '@/components/JoinerRow';
import { PersonAvatar } from '@/components/PersonAvatar';
import { PingMap } from '@/components/PingMap';
import { ReadyPicker } from '@/components/ReadyPicker';
import { SpotCard } from '@/components/SpotCard';
import { useTicker } from '@/hooks/useTicker';
import {
  distanceKm,
  formatClock,
  formatDistance,
  formatRelative,
  travelMinutes,
  travelModeLabel,
} from '@/lib/geo';
import { HOME, PEOPLE_BY_ID } from '@/lib/mockData';
import { goBackOrReplace } from '@/lib/navigation';
import { hostName, pingSpot } from '@/lib/pings';
import { scheduleHostPlan } from '@/lib/simulation';
import { useAppStore } from '@/lib/store';
import type { ReadyMinutes } from '@/lib/types';

export default function InviteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const now = useTicker(1000);
  const [accent] = useThemeColor(['accent']);

  const pingId = id ?? '';
  const ping = useAppStore((state) => state.pings[pingId]);
  const profile = useAppStore((state) => state.profile);
  const joinInbound = useAppStore((state) => state.joinInbound);
  const passInbound = useAppStore((state) => state.passInbound);
  const markSeen = useAppStore((state) => state.markSeen);

  const [ready, setReady] = useState<ReadyMinutes>(profile.defaultReadyMinutes);

  const spot = ping ? pingSpot(ping) : undefined;
  const host = ping ? PEOPLE_BY_ID[ping.hostId] : undefined;

  const myKm = spot ? distanceKm(HOME, spot.location) : 0;
  const myTravel = useMemo(
    () => travelMinutes(myKm, profile.travelMode),
    [myKm, profile.travelMode],
  );

  useEffect(() => {
    if (ping && !ping.seen) markSeen(ping.id);
  }, [markSeen, ping]);

  useEffect(() => {
    if (ping && ping.myResponse !== 'none') {
      router.replace({ pathname: '/plan/[id]', params: { id: ping.id } });
    }
  }, [ping, router]);

  if (!ping || !spot) {
    return (
      <View className="bg-background flex-1">
        <EmptyState
          icon={Inbox}
          title="Invite expired"
          body="This one is no longer open. Have a look at what else is happening around you."
          actionLabel="See invites"
          onAction={() => goBackOrReplace('/(tabs)/invites')}
        />
      </View>
    );
  }

  const join = () => {
    joinInbound(ping.id, ready, profile.travelMode);
    scheduleHostPlan(ping.id);
    router.replace({ pathname: '/plan/[id]', params: { id: ping.id } });
  };

  const pass = () => {
    passInbound(ping.id);
    goBackOrReplace('/(tabs)/invites');
  };

  const arrival = now + (ready + myTravel) * 60_000;

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-4 px-5 pb-12 pt-4"
      showsVerticalScrollIndicator={false}
    >
      <Surface variant="secondary" className="flex-row items-center gap-3 rounded-3xl p-4">
        <PersonAvatar
          name={hostName(ping, profile.name)}
          colorClass={host?.colorClass ?? 'bg-sky'}
          size="lg"
        />
        <View className="flex-1 gap-0.5">
          <Typography type="body" weight="semibold">
            {host?.name ?? 'Someone nearby'}
            {host ? `, ${host.age}` : ''}
          </Typography>
          <Typography type="body-sm" color="muted">
            {host?.bio ?? 'Someone with the app close to you'}
          </Typography>
          <Typography type="body-xs" color="muted">
            {host ? formatDistance(distanceKm(HOME, host.location)) : ''} away ·{' '}
            {formatRelative(ping.createdAt)}
          </Typography>
        </View>
      </Surface>

      <SpotCard
        spot={spot}
        distanceKm={myKm}
        travelMinutes={myTravel}
        travelMode={profile.travelMode}
      />

      <PingMap home={HOME} spot={spot} joins={ping.joins} height={180} />

      <Surface variant="default" className="gap-1 rounded-3xl p-4">
        <View className="flex-row items-center gap-2 pb-1">
          <Users color={accent} size={16} />
          <Typography type="body-sm" weight="semibold">
            Already in
          </Typography>
        </View>
        {ping.joins.map((participant) => (
          <JoinerRow
            key={participant.personId}
            participant={participant}
            myName={profile.name}
            isHost={participant.personId === ping.hostId}
          />
        ))}
      </Surface>

      <Surface variant="default" className="gap-4 rounded-3xl p-4">
        <ReadyPicker
          value={ready}
          onChange={setReady}
          hint={`You are ${formatDistance(myKm)} from there — about ${myTravel} min ${travelModeLabel(profile.travelMode)}.`}
        />
        <View className="bg-accent-soft rounded-2xl px-3 py-2">
          <Typography type="body-sm" className="text-accent-soft-foreground">
            You would be there around {formatClock(arrival)}. The final time waits for whoever needs
            longest.
          </Typography>
        </View>
      </Surface>

      <View className="gap-3">
        <Button onPress={join}>
          <Button.Label>I want to join!</Button.Label>
        </Button>
        <Button variant="ghost" onPress={pass}>
          <Button.Label>Not this time</Button.Label>
        </Button>
      </View>
    </ScrollView>
  );
}
