import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Chip, Surface, Typography } from 'heroui-native';
import { SearchX } from 'lucide-react-native';
import { FlatList, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { RadiusSlider } from '@/components/RadiusSlider';
import { SpotCard } from '@/components/SpotCard';
import { distanceKm, travelMinutes } from '@/lib/geo';
import { HOME, SPOTS } from '@/lib/mockData';
import { startPingSimulation } from '@/lib/simulation';
import { useAppStore } from '@/lib/store';
import type { SpotKind } from '@/lib/types';

type Filter = 'all' | SpotKind;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Everything' },
  { key: 'event', label: 'Happening today' },
  { key: 'place', label: 'Places' },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');

  const profile = useAppStore((state) => state.profile);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const createPing = useAppStore((state) => state.createPing);

  const items = useMemo(
    () =>
      SPOTS.map((spot) => ({ spot, km: distanceKm(HOME, spot.location) }))
        .filter(
          ({ spot, km }) => km <= profile.radiusKm && (filter === 'all' || spot.kind === filter),
        )
        .sort((a, b) => a.km - b.km),
    [filter, profile.radiusKm],
  );

  const choose = (spotId: string) => {
    const id = createPing(spotId, profile.radiusKm);
    startPingSimulation(id);
    router.replace({ pathname: '/ping/[id]', params: { id } });
  };

  return (
    <FlatList
      className="bg-background flex-1"
      data={items}
      keyExtractor={({ spot }) => spot.id}
      contentContainerClassName="gap-3 px-5 pb-12 pt-4"
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View className="gap-4 pb-2">
          <View className="gap-1">
            <Typography type="h3">Pick something</Typography>
            <Typography type="body-sm" color="muted">
              {items.length} options within {profile.radiusKm} km. Choose one and everyone nearby
              with the app hears about it.
            </Typography>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {FILTERS.map((item) => {
              const selected = filter === item.key;
              return (
                <Chip
                  key={item.key}
                  variant={selected ? 'primary' : 'tertiary'}
                  color={selected ? 'accent' : 'default'}
                  onPress={() => setFilter(item.key)}
                >
                  <Chip.Label>{item.label}</Chip.Label>
                </Chip>
              );
            })}
          </View>

          <Surface variant="default" className="rounded-3xl p-4">
            <RadiusSlider
              radiusKm={profile.radiusKm}
              onChange={(km) => updateProfile({ radiusKm: km })}
            />
          </Surface>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          icon={SearchX}
          title="Nothing in range"
          body="Widen your radius a little and a few unfamiliar corners show up."
          actionLabel="Add 2 km"
          onAction={() => updateProfile({ radiusKm: Math.min(10, profile.radiusKm + 2) })}
        />
      }
      renderItem={({ item }) => (
        <SpotCard
          spot={item.spot}
          distanceKm={item.km}
          travelMinutes={travelMinutes(item.km, profile.travelMode)}
          travelMode={profile.travelMode}
          onPress={() => choose(item.spot.id)}
        />
      )}
    />
  );
}
