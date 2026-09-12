import { useEffect, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Spinner, Surface, Typography, useThemeColor } from 'heroui-native';
import { Radio, Users } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { JoinerRow } from '@/components/JoinerRow';
import { PingMap } from '@/components/PingMap';
import { SpotCard } from '@/components/SpotCard';
import { ReadyPicker } from '@/components/ReadyPicker';
import { useTicker } from '@/hooks/useTicker';
import { computeMeetAt, distanceKm, formatClock, travelMinutes } from '@/lib/geo';
import { HOME } from '@/lib/mockData';
import { goBackOrReplace } from '@/lib/navigation';
import { myJoin, participantName, pingSpot, slowestJoin } from '@/lib/pings';
import { pushLocalNotification } from '@/lib/notifications';
import { useAppStore } from '@/lib/store';
import { ME } from '@/lib/types';

export default function LivePingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const now = useTicker(1000);
  const [accent] = useThemeColor(['accent']);

  const pingId = id ?? '';
  const ping = useAppStore((state) => state.pings[pingId]);
  const profile = useAppStore((state) => state.profile);
  const lockPing = useAppStore((state) => state.lockPing);
  const cancelPing = useAppStore((state) => state.cancelPing);
  const setMyReady = useAppStore((state) => state.setMyReady);

  const spot = ping ? pingSpot(ping) : undefined;
  const mine = ping ? myJoin(ping) : undefined;
  const others = useMemo(
    () => ping?.joins.filter((join) => join.personId !== ME) ?? [],
    [ping?.joins],
  );
  const slowest = ping ? slowestJoin(ping) : undefined;
  const previewTime = useMemo(() => (ping ? computeMeetAt(ping.joins, now) : now), [now, ping]);

  useEffect(() => {
    if (ping && ping.status !== 'open') {
      router.replace({ pathname: '/plan/[id]', params: { id: ping.id } });
    }
  }, [ping, router]);

  if (!ping || !spot) {
    return (
      <View className="bg-background flex-1">
        <EmptyState
          icon={Radio}
          title="This ping is gone"
          body="Live pings only last for the session. Start a new one and see who is around."
          actionLabel="Back to start"
          onAction={() => goBackOrReplace('/(tabs)')}
        />
      </View>
    );
  }

  const sendPlan = () => {
    lockPing(ping.id);
    void pushLocalNotification(
      'Plan sent',
      `${spot.name} at ${formatClock(computeMeetAt(ping.joins))} — ${spot.meetingHint}`,
    );
    router.replace({ pathname: '/plan/[id]', params: { id: ping.id } });
  };

  const myTravel = travelMinutes(distanceKm(HOME, spot.location), profile.travelMode);

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-4 px-5 pb-12 pt-4"
      showsVerticalScrollIndicator={false}
    >
      <Surface variant="secondary" className="gap-2 rounded-3xl p-4">
        <View className="flex-row items-center gap-2">
          <Spinner />
          <Typography type="body-sm" weight="semibold">
            Buzzing {ping.notifiedIds.length} phones within {ping.radiusKm} km
          </Typography>
        </View>
        <Typography type="body-sm" color="muted">
          {others.length === 0
            ? 'Nobody has answered yet. Answers usually trickle in over a couple of minutes.'
            : `${others.length} ${others.length === 1 ? 'person wants' : 'people want'} in${
                ping.passedIds.length > 0 ? ` · ${ping.passedIds.length} passed` : ''
              }`}
        </Typography>
      </Surface>

      <SpotCard
        spot={spot}
        distanceKm={distanceKm(HOME, spot.location)}
        travelMinutes={myTravel}
        travelMode={profile.travelMode}
      />

      <PingMap home={HOME} spot={spot} radiusKm={ping.radiusKm} joins={ping.joins} height={200} />

      <Surface variant="default" className="gap-3 rounded-3xl p-4">
        <ReadyPicker
          value={mine?.readyMinutes ?? profile.defaultReadyMinutes}
          onChange={(minutes) => setMyReady(ping.id, minutes)}
          label="How long do you need to get ready?"
          hint={`Plus about ${myTravel} min to get there.`}
        />
      </Surface>

      <Surface variant="default" className="gap-1 rounded-3xl p-4">
        <View className="flex-row items-center gap-2 pb-1">
          <Users color={accent} size={16} />
          <Typography type="body-sm" weight="semibold">
            Who is in
          </Typography>
        </View>
        {ping.joins.map((join) => (
          <JoinerRow
            key={join.personId}
            participant={join}
            myName={profile.firstName}
            isHost={join.personId === ping.hostId}
          />
        ))}
      </Surface>

      <Surface variant="secondary" className="gap-2 rounded-3xl p-4">
        <Typography type="body-xs" color="muted">
          IF YOU SEND IT NOW
        </Typography>
        <Typography type="h4">Meet at {formatClock(previewTime)}</Typography>
        <Typography type="body-sm" color="muted">
          {slowest
            ? `Waits for ${participantName(slowest, profile.firstName)}: ${slowest.readyMinutes} min to get ready plus ${slowest.travelMinutes} min travel.`
            : 'Waits for whoever needs the longest.'}
        </Typography>
        <Typography type="body-sm" color="muted">
          Meeting point: {spot.meetingHint}
        </Typography>
      </Surface>

      <View className="gap-3">
        <Button onPress={sendPlan} isDisabled={others.length === 0}>
          <Button.Label>
            {others.length === 0 ? 'Waiting for the first yes' : 'Send the plan to everyone'}
          </Button.Label>
        </Button>
        <Button variant="danger-soft" onPress={() => cancelPing(ping.id)}>
          <Button.Label>Call it off</Button.Label>
        </Button>
      </View>
    </ScrollView>
  );
}
