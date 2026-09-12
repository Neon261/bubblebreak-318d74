import { useMemo } from 'react';
import { View } from 'react-native';

import MapView, { type MapCircle, type MapMarker } from '@/components/MapView';
import type { Coordinate, Spot } from '@/lib/types';

interface PingMapProps {
  /** Your position — the map centers between you and the spot. */
  home: Coordinate;
  spot?: Spot;
  radiusKm?: number;
  height?: number;
  onPress?: () => void;
}

const MARKER_COLORS = {
  home: '#146a70',
  spot: '#c34b2e',
} as const;

export function PingMap({ home, spot, radiusKm, height = 200, onPress }: PingMapProps) {
  const markers = useMemo<MapMarker[]>(() => {
    const list: MapMarker[] = [
      { id: 'home', coordinate: home, title: 'You', color: MARKER_COLORS.home },
    ];

    if (spot) {
      list.push({
        id: 'spot',
        coordinate: spot.location,
        title: spot.name,
        description: spot.meetingHint,
        color: MARKER_COLORS.spot,
      });
    }

    return list;
  }, [home, spot]);

  const circles = useMemo<MapCircle[]>(
    () =>
      radiusKm
        ? [
            {
              id: 'radius',
              center: home,
              radius: radiusKm * 1000,
              strokeColor: 'rgba(195, 75, 46, 0.5)',
              strokeWidth: 2,
              fillColor: 'rgba(195, 75, 46, 0.1)',
            },
          ]
        : [],
    [home, radiusKm],
  );

  const region = useMemo(() => {
    const target = spot?.location ?? home;
    const spanFromRadius = radiusKm ? (radiusKm / 111) * 2.4 : 0.03;
    const spanFromSpot = Math.abs(target.latitude - home.latitude) * 3.2 + 0.02;
    const delta = Math.max(0.02, spanFromRadius, spanFromSpot);
    return {
      latitude: (target.latitude + home.latitude) / 2,
      longitude: (target.longitude + home.longitude) / 2,
      latitudeDelta: delta,
      longitudeDelta: delta,
    };
  }, [home, radiusKm, spot]);

  return (
    <View className="border-border overflow-hidden rounded-3xl border" style={{ height }}>
      <MapView
        initialRegion={region}
        region={region}
        markers={markers}
        circles={circles}
        onPress={onPress ? () => onPress() : undefined}
        scrollEnabled={false}
        zoomEnabled={false}
        style={{ height, width: '100%' }}
      />
    </View>
  );
}
