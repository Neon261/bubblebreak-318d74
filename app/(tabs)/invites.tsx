import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, Chip, Surface, Switch, Typography } from 'heroui-native';
import { Inbox } from 'lucide-react-native';
import { FlatList, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { BubbleField } from '@/components/BubbleField';
import { Heading } from '@/components/Heading';
import { PingSummaryCard } from '@/components/PingSummaryCard';
import { canOpenChat, isHostedByMe, needsMyAnswer, pingList, pingRoute } from '@/lib/pings';
import { useAppStore } from '@/lib/store';
import type { Ping } from '@/lib/types';

type InviteView = 'waiting' | 'answered';

interface Row {
  kind: 'ping';
  key: string;
  ping: Ping;
}

export default function InvitesScreen() {
  const router = useRouter();
  const profile = useAppStore((state) => state.profile);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const pings = useAppStore((state) => state.pings);
  const pingIds = useAppStore((state) => state.pingIds);
  const [view, setView] = useState<InviteView>('waiting');

  const rows = useMemo<Row[]>(() => {
    const inbound = pingList(pings, pingIds).filter((ping) => !isHostedByMe(ping));
    const visible =
      view === 'waiting'
        ? inbound.filter(needsMyAnswer)
        : inbound.filter((ping) => !needsMyAnswer(ping));
    return visible.map((ping) => ({ kind: 'ping', key: ping.id, ping }));
  }, [pingIds, pings, view]);

  return (
    <FlatList
      className="bg-background flex-1"
      data={rows}
      keyExtractor={(row) => row.key}
      contentContainerClassName="gap-3 px-5 pb-12 pt-safe-offset-4"
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View className="gap-4 pb-3">
          <View className="relative gap-1 overflow-hidden">
            <BubbleField preset="header" animate={false} />
            <Heading type="h2">Invites</Heading>
            <Typography type="body-sm" color="muted" className="max-w-80">
              Answer nearby pings and keep joined plans and conversations easy to find.
            </Typography>
          </View>

          <View className="flex-row gap-2">
            <Chip
              variant={view === 'waiting' ? 'primary' : 'tertiary'}
              color={view === 'waiting' ? 'accent' : 'default'}
              onPress={() => setView('waiting')}
            >
              <Chip.Label>Waiting for you</Chip.Label>
            </Chip>
            <Chip
              variant={view === 'answered' ? 'primary' : 'tertiary'}
              color={view === 'answered' ? 'accent' : 'default'}
              onPress={() => setView('answered')}
            >
              <Chip.Label>Answered & chats</Chip.Label>
            </Chip>
          </View>

          <Surface
            variant="default"
            className="border-border flex-row items-center gap-4 rounded-3xl border p-4"
          >
            <View className="flex-1 gap-0.5">
              <Typography type="body-sm" weight="medium">
                Let strangers ping me
              </Typography>
              <Typography type="body-xs" color="muted">
                Turn this off to stop new invitations. Your existing plans and chats stay available.
              </Typography>
            </View>
            <Switch
              isSelected={profile.openToPings}
              onSelectedChange={(value) => updateProfile({ openToPings: value })}
            >
              <Switch.Thumb />
            </Switch>
          </Surface>
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
      renderItem={({ item }) => (
        <View className="gap-2">
          <PingSummaryCard
            ping={item.ping}
            myName={profile.firstName}
            showDetails
            onPress={() => router.push(pingRoute(item.ping))}
          />
          {view === 'answered' && canOpenChat(item.ping) ? (
            <Button
              variant="secondary"
              size="sm"
              onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.ping.id } })}
            >
              <Button.Label>
                {item.ping.spotsForOthers === 1 ? 'Chat with organizer' : 'Open group chat'}
              </Button.Label>
            </Button>
          ) : null}
        </View>
      )}
    />
  );
}
