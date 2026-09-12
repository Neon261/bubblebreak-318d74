import { useEffect, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Spinner, Surface, Typography } from 'heroui-native';
import { Radio, Users } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { BubbleField } from '@/components/BubbleField';
import { EmptyState } from '@/components/EmptyState';
import { GroupSizePicker } from '@/components/GroupSizePicker';
import { Heading } from '@/components/Heading';
import { JoinerRow } from '@/components/JoinerRow';
import { PingMap } from '@/components/PingMap';
import { SpotCard } from '@/components/SpotCard';
import { ReadyPicker } from '@/components/ReadyPicker';
import { useTicker } from '@/hooks/useTicker';
import { computeMeetAt, distanceKm, formatClock, travelMinutes } from '@/lib/geo';
import { goBackOrReplace } from '@/lib/navigation';
import {
  currentLocation,
  myJoin, participantName, pingSpot, slowestJoin, spotsLeft, spotsTaken } from '@/lib/pings';
import { pushLocalNotification } from '@/lib/notifications';
import { useAppStore } from '@/lib/store';
import { BRAND } from '@/lib/theme';

export default function LivePingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const now = useTicker(1000);

  const pingId = id ?? '';
  const ping = useAppStore((state) => state.pings[pingId]);
  const profile = useAppStore((state) => state.profile);
  const lockPing = useAppStore((state) => state.lockPing);
  const cancelPing = useAppStore((state) => state.cancelPing);
  const deleteDraft = useAppStore((state) => state.deleteDraft);
  const setMyReady = useAppStore((state) => state.setMyReady);
  const setSpotCount = useAppStore((state) => state.setSpotCount);

  const spot = ping ? pingSpot(ping) : undefined;
  const mine = ping ? myJoin(ping) : undefined;
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

  const origin = currentLocation(profile);
  const myTravel = travelMinutes(distanceKm(origin, spot.location), profile.travelMode);
  const taken = spotsTaken(ping);
  const left = spotsLeft(ping);
  const full = left === 0;

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-4 px-5 pb-12 pt-4"
      showsVerticalScrollIndicator={false}
    >
      <Surface variant="secondary" className="relative gap-2 overflow-hidden rounded-3xl p-4">
        <BubbleField preset="rise" animate={!full} />
        <View className="flex-row items-center gap-2">
          {full ? <Users color={BRAND.accent} size={16} /> : <Spinner />}
          <Typography type="body-sm" weight="semibold">
            {full
              ? `Full — ${taken} ${taken === 1 ? 'person is' : 'people are'} in`
              : `Buzzing ${ping.notifiedIds.length} phones within ${ping.radiusKm} km`}
          </Typography>
        </View>
        <Typography type="body-sm" color="muted">
          {full
            ? 'The spots went to whoever answered first. Send the plan whenever you like.'
            : `${left} of ${ping.spotsForOthers} ${ping.spotsForOthers === 1 ? 'spot' : 'spots'} still open · ${
                taken === 0 ? 'nobody has answered yet' : `${taken} in`
              }${ping.passedIds.length > 0 ? ` · ${ping.passedIds.length} passed` : ''}`}
        </Typography>
        {ping.missedIds.length > 0 ? (
          <Typography type="body-xs" color="muted">
            {ping.missedIds.length} {ping.missedIds.length === 1 ? 'person' : 'people'} wanted in
            after the last spot went.
          </Typography>
        ) : null}
      </Surface>

      <SpotCard
        spot={spot}
        distanceKm={distanceKm(origin, spot.location)}
        travelMinutes={myTravel}
        travelMode={profile.travelMode}
      />

      <PingMap home={origin} spot={spot} radiusKm={ping.radiusKm} height={200} />

      <Surface variant="default" className="gap-4 rounded-3xl p-4">
        <GroupSizePicker
          value={ping.spotsForOthers}
          onChange={(count) => setSpotCount(ping.id, count)}
          min={Math.max(1, taken)}
          hint={
            taken > 0
              ? `${taken} already in, so the limit can only go up from here. Group of ${ping.spotsForOthers + 1} at most.`
              : `A group of ${ping.spotsForOthers + 1} at most, you included. First to say yes is in.`
          }
        />
        <ReadyPicker
          value={mine?.readyMinutes ?? profile.defaultReadyMinutes}
          onChange={(minutes) => setMyReady(ping.id, minutes)}
          label="How long do you need to get ready?"
          hint={`Plus about ${myTravel} min to get there.`}
        />
      </Surface>

      <Surface variant="default" className="gap-1 rounded-3xl p-4">
        <View className="flex-row items-center gap-2 pb-1">
          <Users color={BRAND.accent} size={16} />
          <Typography type="body-sm" weight="semibold">
            Who is in · {ping.joins.length} of {ping.spotsForOthers + 1}
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

      <Surface variant="secondary" className="relative gap-2 overflow-hidden rounded-3xl p-4">
        <BubbleField preset="soft" animate={false} />
        <Typography type="body-xs" color="muted" className="tracking-widest uppercase">
          If you send it now
        </Typography>
        <Heading type="h4">Meet at {formatClock(previewTime)}</Heading>
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
        <Button onPress={sendPlan} isDisabled={taken === 0}>
          <Button.Label>
            {taken === 0
              ? 'Waiting for the first yes'
              : full
                ? 'Send the plan — the group is full'
                : 'Send the plan to everyone'}
          </Button.Label>
        </Button>
        <Button
          variant="danger-soft"
          onPress={() => {
            if (taken === 0) {
              if (deleteDraft(ping.id)) goBackOrReplace('/(tabs)');
            } else if (cancelPing(ping.id)) {
              goBackOrReplace('/(tabs)/plans');
            }
          }}
        >
          <Button.Label>{taken === 0 ? 'Delete draft plan' : 'Cancel invitation'}</Button.Label>
        </Button>
      </View>
    </ScrollView>
  );
}
