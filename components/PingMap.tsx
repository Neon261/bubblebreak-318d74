import { useMemo } from 'react';
import { View } from 'react-native';

import MapView, { type MapCircle, type MapMarker } from '@/components/MapView';
import { PEOPLE_BY_ID } from '@/lib/mockData';
import type { Coordinate, Participant, Spot } from '@/lib/types';
import { ME } from '@/lib/types';

interface PingMapProps {
  /** Your position — the map centers between you and the spot. */
  home: Coordinate;
  spot?: Spot;
  radiusKm?: number;
  joins?: Participant[];
  height?: number;
}

const MARKER_COLORS = {
  home: '#2f9e8c',
  spot: '#e07a3f',
  joiner: '#8a63d2',
} as const;

export function PingMap({ home, spot, radiusKm, joins = [], height = 200 }: PingMapProps) {
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

    joins.forEach((join) => {
      if (join.personId === ME) return;
      const person = PEOPLE_BY_ID[join.personId];
      if (!person) return;
      list.push({
        id: person.id,
        coordinate: person.location,
        title: person.name,
        color: MARKER_COLORS.joiner,
      });
    });

    return list;
  }, [home, joins, spot]);

  const circles = useMemo<MapCircle[]>(
    () =>
      radiusKm
        ? [
            {
              id: 'radius',
              center: home,
              radius: radiusKm * 1000,
              strokeColor: 'rgba(47, 158, 140, 0.55)',
              strokeWidth: 2,
              fillColor: 'rgba(47, 158, 140, 0.12)',
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
        scrollEnabled={false}
        zoomEnabled={false}
        style={{ height, width: '100%' }}
      />
    </View>
  );
}
