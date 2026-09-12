import { Chip, PressableFeedback, Surface, Typography, useThemeColor } from 'heroui-native';
import { Clock, MapPin } from 'lucide-react-native';
import { View } from 'react-native';

import { formatClock, formatDistance, travelModeLabel } from '@/lib/geo';
import { spotStartsAt } from '@/lib/mockData';
import { CATEGORY_VISUALS, PRICE_LABELS } from '@/lib/spotVisuals';
import type { Spot, TravelMode } from '@/lib/types';

interface SpotCardProps {
  spot: Spot;
  distanceKm: number;
  travelMinutes?: number;
  travelMode?: TravelMode;
  onPress?: () => void;
}

export function SpotCard({ spot, distanceKm, travelMinutes, travelMode, onPress }: SpotCardProps) {
  const [foreground, muted] = useThemeColor(['foreground', 'muted']);
  const visual = CATEGORY_VISUALS[spot.category];
  const Icon = visual.icon;
  const startsAt = spotStartsAt(spot);

  const content = (
    <Surface variant="default" className="gap-3 rounded-3xl p-4">
      <View className="flex-row items-start gap-3">
        <View className={`h-12 w-12 items-center justify-center rounded-2xl ${visual.bgClass}`}>
          <Icon color={foreground} size={22} />
        </View>

        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Typography type="body" weight="semibold" className="flex-1" truncate>
              {spot.name}
            </Typography>
            <Chip variant="tertiary" color={spot.kind === 'event' ? 'accent' : 'default'} size="sm">
              <Chip.Label>{spot.kind === 'event' ? 'Event' : visual.label}</Chip.Label>
            </Chip>
          </View>
          <Typography type="body-sm" color="muted">
            {spot.tagline}
          </Typography>
        </View>
      </View>

      <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1">
        <View className="flex-row items-center gap-1.5">
          <MapPin color={muted} size={14} />
          <Typography type="body-xs" color="muted">
            {formatDistance(distanceKm)}
            {travelMinutes !== undefined
              ? ` · ${travelMinutes} min ${travelMode ? travelModeLabel(travelMode) : ''}`.trimEnd()
              : ''}
          </Typography>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Clock color={muted} size={14} />
          <Typography type="body-xs" color="muted">
            {startsAt ? `Starts ${formatClock(startsAt)}` : 'Open now'} · {PRICE_LABELS[spot.price]}
          </Typography>
        </View>
      </View>

      <View className="bg-accent-soft rounded-2xl px-3 py-2">
        <Typography type="body-xs" className="text-accent-soft-foreground">
          {spot.bubbleTag}
        </Typography>
      </View>
    </Surface>
  );

  if (!onPress) return content;

  return (
    <PressableFeedback onPress={onPress} accessibilityRole="button">
      {content}
    </PressableFeedback>
  );
}
