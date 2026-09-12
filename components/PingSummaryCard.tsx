import { PressableFeedback, Surface, Typography } from 'heroui-native';
import { ChevronRight } from 'lucide-react-native';
import { View } from 'react-native';

import { PersonAvatar } from '@/components/PersonAvatar';
import { formatClock, formatRelative } from '@/lib/geo';
import { PEOPLE_BY_ID } from '@/lib/mockData';
import { hostName, isHostedByMe, pingSpot, spotsLeft } from '@/lib/pings';
import { CATEGORY_VISUALS } from '@/lib/spotVisuals';
import { BRAND } from '@/lib/theme';
import type { Ping } from '@/lib/types';

interface PingSummaryCardProps {
  ping: Ping;
  myName: string;
  onPress: () => void;
}

function statusLine(ping: Ping): string {
  if (ping.status === 'cancelled') return 'Called off';
  if (ping.status === 'declined') return 'You passed';
  if (ping.status === 'locked' && ping.meetAt) {
    return `Meeting at ${formatClock(ping.meetAt)} · ${ping.joins.length} going`;
  }
  if (ping.myResponse === 'joined') {
    return `Waiting for the time · ${ping.joins.length} in`;
  }
  const left = spotsLeft(ping);
  if (left === 0) return `Spots gone · ${formatRelative(ping.createdAt)}`;
  return `${left} ${left === 1 ? 'spot' : 'spots'} left · ${formatRelative(ping.createdAt)}`;
}

export function PingSummaryCard({ ping, myName, onPress }: PingSummaryCardProps) {
  const spot = pingSpot(ping);
  const host = hostName(ping, myName);
  const colorClass = isHostedByMe(ping)
    ? 'bg-accent'
    : (PEOPLE_BY_ID[ping.hostId]?.colorClass ?? 'bg-sky');
  const category = spot ? CATEGORY_VISUALS[spot.category] : undefined;
  const Icon = category?.icon;

  return (
    <PressableFeedback onPress={onPress} accessibilityRole="button">
      <Surface variant="default" className="flex-row items-center gap-3 rounded-3xl p-4">
        <PersonAvatar name={host} colorClass={colorClass} />

        <View className="flex-1 gap-0.5">
          <Typography type="body-sm" weight="semibold" truncate>
            {isHostedByMe(ping) ? 'You' : host} → {spot?.name ?? 'Somewhere nearby'}
          </Typography>
          <View className="flex-row items-center gap-1.5">
            {Icon ? <Icon color={BRAND.muted} size={13} /> : null}
            <Typography type="body-xs" color="muted" truncate>
              {statusLine(ping)}
            </Typography>
          </View>
        </View>

        <ChevronRight color={BRAND.muted} size={18} />
      </Surface>
    </PressableFeedback>
  );
}
