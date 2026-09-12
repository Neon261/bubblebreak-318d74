import { Surface, Typography } from 'heroui-native';
import { MapPin } from 'lucide-react-native';
import { Image, View } from 'react-native';

import { Heading } from '@/components/Heading';
import { formatDistance } from '@/lib/geo';
import {
  CATEGORY_VISUALS,
  categoryLabel,
  foodLine,
  neighbourhoodLine,
  timeLine,
} from '@/lib/spotVisuals';
import { BRAND } from '@/lib/theme';
import type { Spot } from '@/lib/types';

interface SpotPreviewCardProps {
  spot: Spot;
  distanceKm: number;
  travelMinutes: number;
}

const THUMB = 92;

/** The card under the map, describing whichever pin is selected. */
export function SpotPreviewCard({ spot, distanceKm, travelMinutes }: SpotPreviewCardProps) {
  const visual = CATEGORY_VISUALS[spot.category];
  const Icon = visual.icon;
  const food = foodLine(spot);

  return (
    <Surface variant="default" className="gap-3 rounded-3xl p-3">
      <View className="flex-row gap-3">
        <Image
          source={visual.photo}
          resizeMode="cover"
          style={{ width: THUMB, height: THUMB, borderRadius: 18 }}
          accessibilityIgnoresInvertColors
        />

        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-1.5">
            <Icon color={visual.pinColor} size={13} />
            <Typography type="body-xs" weight="semibold" style={{ color: visual.pinColor }}>
              {categoryLabel(spot)}
            </Typography>
            {spot.kind === 'event' ? (
              <Typography type="body-xs" color="muted">
                · Happening today
              </Typography>
            ) : null}
          </View>

          <Heading type="h5">{spot.name}</Heading>
          <Typography type="body-xs" color="muted" numberOfLines={2}>
            {spot.tagline}
          </Typography>

          <View className="flex-row items-center gap-1.5 pt-0.5">
            <MapPin color={BRAND.muted} size={12} />
            <Typography type="body-xs" color="muted" numberOfLines={1}>
              {formatDistance(distanceKm)} · {travelMinutes} min · {food ?? timeLine(spot)}
            </Typography>
          </View>

          <Typography type="body-xs" color="muted" numberOfLines={1}>
            {neighbourhoodLine(spot)}
          </Typography>
        </View>
      </View>
    </Surface>
  );
}
