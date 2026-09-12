import { useMemo } from 'react';
import { Typography } from 'heroui-native';
import { View } from 'react-native';

import MapView, { type MapCircle, type MapMarker } from '@/components/MapView';
import { CATEGORY_VISUALS, HOME_PIN_COLOR } from '@/lib/spotVisuals';
import type { Coordinate, Spot, SpotCategory } from '@/lib/types';

interface SpotMapProps {
  home: Coordinate;
  spots: Spot[];
  radiusKm: number;
  selectedId?: string;
  onSelect: (spotId: string) => void;
  height?: number;
}

/** The five current suggestions as coloured pins around you. */
export function SpotMap({
  home,
  spots,
  radiusKm,
  selectedId,
  onSelect,
  height = 300,
}: SpotMapProps) {
  const markers = useMemo<MapMarker[]>(() => {
    const list: MapMarker[] = [
      { id: 'home', coordinate: home, title: 'You are here', color: HOME_PIN_COLOR },
    ];

    spots.forEach((spot) => {
      const visual = CATEGORY_VISUALS[spot.category];
      list.push({
        id: spot.id,
        coordinate: spot.location,
        title: `${visual.label} · ${spot.name}`,
        description: spot.tagline,
        color: visual.pinColor,
        opacity: selectedId === undefined || selectedId === spot.id ? 1 : 0.65,
        onPress: () => onSelect(spot.id),
      });
    });

    return list;
  }, [home, onSelect, selectedId, spots]);

  const circles = useMemo<MapCircle[]>(
    () => [
      {
        id: 'radius',
        center: home,
        radius: radiusKm * 1000,
        strokeColor: 'rgba(47, 158, 140, 0.5)',
        strokeWidth: 2,
        fillColor: 'rgba(47, 158, 140, 0.08)',
      },
    ],
    [home, radiusKm],
  );

  const region = useMemo(() => {
    const delta = Math.max(0.02, (radiusKm / 111) * 2.6);
    return {
      latitude: home.latitude,
      longitude: home.longitude,
      latitudeDelta: delta,
      longitudeDelta: delta,
    };
  }, [home, radiusKm]);

  const legend = useMemo(() => {
    const seen: SpotCategory[] = [];
    spots.forEach((spot) => {
      if (!seen.includes(spot.category)) seen.push(spot.category);
    });
    return seen;
  }, [spots]);

  return (
    <View className="gap-2">
      <View className="border-border overflow-hidden rounded-3xl border" style={{ height }}>
        <MapView
          initialRegion={region}
          region={region}
          markers={markers}
          circles={circles}
          onMarkerPress={(marker) => {
            if (marker.id && marker.id !== 'home') onSelect(marker.id);
          }}
          style={{ height, width: '100%' }}
        />
      </View>

      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1.5">
        {legend.map((category) => {
          const visual = CATEGORY_VISUALS[category];
          return (
            <View key={category} className="flex-row items-center gap-1.5">
              <View
                style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: visual.pinColor }}
              />
              <Typography type="body-xs" color="muted">
                {visual.label}
              </Typography>
            </View>
          );
        })}
      </View>
    </View>
  );
}
