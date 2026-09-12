import { Typography } from 'heroui-native';
import { View } from 'react-native';

import { PersonAvatar } from '@/components/PersonAvatar';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { etaMinutes, formatClock, formatDistance, travelModeLabel } from '@/lib/geo';
import { PEOPLE_BY_ID } from '@/lib/mockData';
import { participantColorClass, participantName } from '@/lib/pings';
import { ME, type Participant } from '@/lib/types';

interface JoinerRowProps {
  participant: Participant;
  myName: string;
  /** When the plan is set, show the arrival clock instead of an estimate. */
  meetAt?: number;
  isHost?: boolean;
}

export function JoinerRow({ participant, myName, meetAt, isHost }: JoinerRowProps) {
  const isMe = participant.personId === ME;
  const name = participantName(participant, myName);
  const bio = isMe ? 'You' : PEOPLE_BY_ID[participant.personId]?.bio;

  return (
    <View className="flex-row items-center gap-3 py-2">
      <PersonAvatar name={name} colorClass={participantColorClass(participant)} />

      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Typography type="body-sm" weight="semibold">
            {name}
          </Typography>
          {isHost ? (
            <View className="bg-accent-soft rounded-full px-2 py-0.5">
              <Typography type="body-xs" className="text-accent-soft-foreground">
                started it
              </Typography>
            </View>
          ) : null}
          {isMe ? null : <VerifiedBadge />}
        </View>
        <Typography type="body-xs" color="muted" truncate>
          {bio}
        </Typography>
      </View>

      <View className="items-end gap-0.5">
        <Typography type="body-sm" weight="medium">
          {meetAt ? formatClock(meetAt) : `${etaMinutes(participant)} min`}
        </Typography>
        <Typography type="body-xs" color="muted">
          {participant.readyMinutes} min ready · {formatDistance(participant.distanceKm)}{' '}
          {travelModeLabel(participant.travelMode)}
        </Typography>
      </View>
    </View>
  );
}
