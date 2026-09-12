import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Button, Input, Surface, TextField, Typography } from 'heroui-native';
import { MessageCircle } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Heading } from '@/components/Heading';
import { formatClock } from '@/lib/geo';
import { goBackOrReplace } from '@/lib/navigation';
import { PEOPLE_BY_ID } from '@/lib/mockData';
import { canOpenChat, hostName, pingSpot } from '@/lib/pings';
import { useAppStore } from '@/lib/store';
import { ME } from '@/lib/types';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ping = useAppStore((state) => state.pings[id ?? '']);
  const profile = useAppStore((state) => state.profile);
  const sendMessage = useAppStore((state) => state.sendMessage);
  const [draft, setDraft] = useState('');

  if (!ping || !canOpenChat(ping)) {
    return (
      <View className="bg-background flex-1">
        <EmptyState
          icon={MessageCircle}
          title="Chat unavailable"
          body="Chats open after you join an invitation and close if the plan is cancelled."
          actionLabel="Back to invites"
          onAction={() => goBackOrReplace('/(tabs)/invites')}
        />
      </View>
    );
  }

  const groupChat = ping.spotsForOthers > 1;
  const submit = () => {
    if (!draft.trim()) return;
    sendMessage(ping.id, draft);
    setDraft('');
  };

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={96}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pb-6 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1">
          <Typography type="body-xs" color="muted" className="tracking-widest uppercase">
            {groupChat ? 'Group chat' : `Chat with ${hostName(ping, profile.firstName)}`}
          </Typography>
          <Heading type="h4">{pingSpot(ping)?.name ?? 'The plan'}</Heading>
          <Typography type="body-xs" color="muted">
            Only people who joined this plan can read or send messages.
          </Typography>
        </View>

        <View className="gap-2">
          {ping.messages.length === 0 ? (
            <Surface variant="secondary" className="rounded-3xl p-4">
              <Typography type="body-sm" color="muted">
                No messages yet. Say hello or confirm where to meet.
              </Typography>
            </Surface>
          ) : (
            ping.messages.map((message) => {
              const mine = message.senderId === ME;
              return (
                <View key={message.id} className={mine ? 'items-end' : 'items-start'}>
                  <Surface
                    variant={mine ? 'secondary' : 'default'}
                    className="max-w-[84%] gap-1 rounded-3xl px-4 py-3"
                  >
                    <Typography type="body-xs" color="muted">
                      {message.senderId === ME
                        ? profile.firstName
                        : (PEOPLE_BY_ID[message.senderId]?.name ?? 'Someone')}{' '}
                      · {formatClock(message.sentAt)}
                    </Typography>
                    <Typography type="body-sm">{message.body}</Typography>
                  </Surface>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <View className="border-border bg-background pb-safe-offset-3 flex-row items-end gap-2 border-t px-4 pt-3">
        <TextField className="flex-1">
          <Input
            value={draft}
            onChangeText={setDraft}
            placeholder="Message the plan"
            returnKeyType="send"
            onSubmitEditing={submit}
            maxLength={500}
          />
        </TextField>
        <Button size="sm" onPress={submit} isDisabled={!draft.trim()}>
          <Button.Label>Send</Button.Label>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
