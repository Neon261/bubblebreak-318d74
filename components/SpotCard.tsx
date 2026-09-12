import { PressableFeedback, Surface, Typography } from 'heroui-native';
import { Clock, MapPin, UtensilsCrossed } from 'lucide-react-native';
import { Image, View } from 'react-native';

import { Heading } from '@/components/Heading';
import { formatDistance, travelModeLabel } from '@/lib/geo';
import {
  CATEGORY_VISUALS,
  categoryLabel,
  foodLine,
  neighbourhoodLine,
  timeLine,
} from '@/lib/spotVisuals';
import { BRAND } from '@/lib/theme';
import type { Spot, TravelMode } from '@/lib/types';

interface SpotCardProps {
  spot: Spot;
  distanceKm: number;
  travelMinutes?: number;
  travelMode?: TravelMode;
  onPress?: () => void;
}

const PHOTO_HEIGHT = 150;

export function SpotCard({ spot, distanceKm, travelMinutes, travelMode, onPress }: SpotCardProps) {
  const visual = CATEGORY_VISUALS[spot.category];
  const Icon = visual.icon;
  const food = foodLine(spot);

  const content = (
    <Surface variant="default" className="overflow-hidden rounded-3xl p-0">
      <View style={{ height: PHOTO_HEIGHT, width: '100%' }}>
        <Image
          source={visual.photo}
          resizeMode="cover"
          style={{ width: '100%', height: PHOTO_HEIGHT }}
          accessibilityIgnoresInvertColors
        />

        <View className="absolute top-3 left-3 flex-row gap-2">
          <View
            className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.93)' }}
          >
            <Icon color={visual.pinColor} size={13} />
            <Typography type="body-xs" weight="semibold" style={{ color: BRAND.ink }}>
              {categoryLabel(spot)}
            </Typography>
          </View>

          {spot.kind === 'event' ? (
            <View
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: 'rgba(34, 139, 145, 0.94)' }}
            >
              <Typography type="body-xs" weight="semibold" style={{ color: '#ffffff' }}>
                Happening today
              </Typography>
            </View>
          ) : null}
        </View>
      </View>

      <View className="gap-3 p-4">
        <View className="gap-1">
          <Heading type="h5">{spot.name}</Heading>
          <Typography type="body-sm" color="muted">
            {spot.tagline}
          </Typography>
        </View>

        <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1">
          <View className="flex-row items-center gap-1.5">
            <MapPin color={BRAND.muted} size={14} />
            <Typography type="body-xs" color="muted">
              {formatDistance(distanceKm)}
              {travelMinutes !== undefined
                ? ` · ${travelMinutes} min ${travelMode ? travelModeLabel(travelMode) : ''}`.trimEnd()
                : ''}
            </Typography>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Clock color={BRAND.muted} size={14} />
            <Typography type="body-xs" color="muted">
              {timeLine(spot)}
            </Typography>
          </View>
          {food ? (
            <View className="flex-row items-center gap-1.5">
              <UtensilsCrossed color={BRAND.muted} size={14} />
              <Typography type="body-xs" color="muted">
                {food}
              </Typography>
            </View>
          ) : null}
        </View>

        <View className="bg-accent-soft rounded-2xl px-3 py-2">
          <Typography type="body-xs" className="text-accent-soft-foreground">
            {spot.bubbleTag}
          </Typography>
        </View>

        <Typography type="body-xs" color="muted" numberOfLines={1}>
          {neighbourhoodLine(spot)}
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
