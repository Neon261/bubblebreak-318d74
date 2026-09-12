import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Typography } from 'heroui-native';
import { Inbox } from 'lucide-react-native';
import { FlatList, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { PingSummaryCard } from '@/components/PingSummaryCard';
import { isHostedByMe, needsMyAnswer, pingList, pingRoute } from '@/lib/pings';
import { useAppStore } from '@/lib/store';
import type { Ping } from '@/lib/types';

interface Row {
  kind: 'header' | 'ping';
  key: string;
  label?: string;
  ping?: Ping;
}

export default function InvitesScreen() {
  const router = useRouter();
  const myName = useAppStore((state) => state.profile.name);
  const openToPings = useAppStore((state) => state.profile.openToPings);
  const pings = useAppStore((state) => state.pings);
  const pingIds = useAppStore((state) => state.pingIds);

  const rows = useMemo<Row[]>(() => {
    const inbound = pingList(pings, pingIds).filter((ping) => !isHostedByMe(ping));
    const waiting = inbound.filter(needsMyAnswer);
    const answered = inbound.filter((ping) => !needsMyAnswer(ping));

    const build = (label: string, list: Ping[]): Row[] =>
      list.length === 0
        ? []
        : [
            { kind: 'header', key: `h-${label}`, label },
            ...list.map((ping) => ({ kind: 'ping' as const, key: ping.id, ping })),
          ];

    return [...build('Waiting for your answer', waiting), ...build('Already answered', answered)];
  }, [pingIds, pings]);

  return (
    <FlatList
      className="bg-background flex-1"
      data={rows}
      keyExtractor={(row) => row.key}
      contentContainerClassName="gap-3 px-5 pb-12 pt-safe-offset-4"
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View className="gap-1 pb-2">
          <Typography type="h2">Invites</Typography>
          <Typography type="body-sm" color="muted">
            {openToPings
              ? 'People nearby you have never met, heading somewhere.'
              : 'You are invisible right now — turn pings back on in the You tab.'}
          </Typography>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          icon={Inbox}
          title="Nothing yet"
          body="When someone nearby heads out, their ping lands here. You can also start one yourself."
          actionLabel="Start a ping"
          onAction={() => router.push('/discover')}
        />
      }
      renderItem={({ item }) =>
        item.kind === 'header' ? (
          <Typography type="body-xs" color="muted" className="pt-2">
            {item.label?.toUpperCase()}
          </Typography>
        ) : item.ping ? (
          <PingSummaryCard
            ping={item.ping}
            myName={myName}
            onPress={() => {
              if (item.ping) router.push(pingRoute(item.ping));
            }}
          />
        ) : null
      }
    />
  );
}
