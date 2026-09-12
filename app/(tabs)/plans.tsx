import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Typography } from 'heroui-native';
import { CalendarCheck } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { BubbleField } from '@/components/BubbleField';
import { Heading } from '@/components/Heading';
import { PingSummaryCard } from '@/components/PingSummaryCard';
import { useTicker } from '@/hooks/useTicker';
import { isOver, isSettled, isWaiting, myJoin, pingList, pingRoute } from '@/lib/pings';
import { useAppStore } from '@/lib/store';
import type { Ping } from '@/lib/types';

export default function PlansScreen() {
  const router = useRouter();
  const now = useTicker(30_000);
  const myName = useAppStore((state) => state.profile.firstName);
  const pings = useAppStore((state) => state.pings);
  const pingIds = useAppStore((state) => state.pingIds);

  const groups = useMemo(() => {
    const mine = pingList(pings, pingIds).filter((ping) => Boolean(myJoin(ping)));
    const settled = [...mine]
      .filter((ping) => isSettled(ping) && !isOver(ping, now))
      .sort((a, b) => (a.meetAt ?? 0) - (b.meetAt ?? 0));
    const waiting = mine.filter((ping) => isWaiting(ping));
    const past = mine.filter((ping) => isOver(ping, now));

    return [
      { label: 'Set', list: settled },
      { label: 'Still forming', list: waiting },
      { label: 'Past', list: past },
    ].filter((group) => group.list.length > 0);
  }, [now, pingIds, pings]);

  const renderGroup = (label: string, list: Ping[]) => (
    <View key={label} className="gap-3">
      <Typography type="body-xs" color="muted" weight="semibold" className="tracking-widest">
        {label.toUpperCase()}
      </Typography>
      {list.map((ping) => (
        <PingSummaryCard
          key={ping.id}
          ping={ping}
          myName={myName}
          onPress={() => router.push(pingRoute(ping))}
        />
      ))}
    </View>
  );

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-5 px-5 pb-12 pt-safe-offset-4"
      showsVerticalScrollIndicator={false}
    >
      <View className="relative gap-1 overflow-hidden pb-1">
        <BubbleField preset="header" animate={false} />
        <Heading type="h2">Plans</Heading>
        <Typography type="body-sm" color="muted" className="max-w-80">
          Everything you said yes to, and everything you started.
        </Typography>
      </View>

      {groups.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No plans yet"
          body="Start a ping or answer an invite and it shows up here with the meeting point and time."
          actionLabel="Find something"
          onAction={() => router.push('/discover')}
        />
      ) : (
        groups.map((group) => renderGroup(group.label, group.list))
      )}
    </ScrollView>
  );
}
