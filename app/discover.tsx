import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, Chip, Surface, Typography, useThemeColor } from 'heroui-native';
import { RefreshCw, SearchX } from 'lucide-react-native';
import { FlatList, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { GroupSizePicker } from '@/components/GroupSizePicker';
import { RadiusSlider } from '@/components/RadiusSlider';
import { SpotCard } from '@/components/SpotCard';
import { distanceKm, travelMinutes } from '@/lib/geo';
import { HOME, SPOTS } from '@/lib/mockData';
import { clampSpots } from '@/lib/pings';
import { startPingSimulation } from '@/lib/simulation';
import { useAppStore } from '@/lib/store';
import type { SpotKind } from '@/lib/types';

type Filter = 'all' | SpotKind;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Everything' },
  { key: 'event', label: 'Happening today' },
  { key: 'place', label: 'Places' },
];

/** Never more than five suggestions at a time. */
const BATCH = 5;

export default function DiscoverScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [offset, setOffset] = useState(0);
  const [accent] = useThemeColor(['accent']);

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

  // A different set means starting the rotation from the nearest options again.
  const filterKey = `${filter}-${profile.radiusKm}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setOffset(0);
  }

  const shown = useMemo(() => {
    if (items.length <= BATCH) return items;
    return Array.from({ length: BATCH }, (_, index) => items[(offset + index) % items.length]);
  }, [items, offset]);

  const canRotate = items.length > BATCH;
  const spots = clampSpots(profile.defaultSpots);

  const choose = (spotId: string) => {
    const id = createPing(spotId, profile.radiusKm, spots);
    startPingSimulation(id);
    router.replace({ pathname: '/ping/[id]', params: { id } });
  };

  return (
    <FlatList
      className="bg-background flex-1"
      data={shown}
      keyExtractor={({ spot }) => spot.id}
      contentContainerClassName="gap-3 px-5 pb-12 pt-4"
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View className="gap-4 pb-2">
          <View className="gap-1">
            <Typography type="h3">Pick something</Typography>
            <Typography type="body-sm" color="muted">
              {canRotate
                ? `${shown.length} of ${items.length} options within ${profile.radiusKm} km.`
                : `${items.length} options within ${profile.radiusKm} km.`}{' '}
              Choose one and everyone nearby with the app hears about it.
            </Typography>
          </View>

          {canRotate ? (
            <Button
              variant="tertiary"
              size="sm"
              className="self-start"
              onPress={() => setOffset((current) => (current + BATCH) % items.length)}
            >
              <RefreshCw color={accent} size={15} />
              <Button.Label>Show me five others</Button.Label>
            </Button>
          ) : null}

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

          <Surface variant="default" className="gap-4 rounded-3xl p-4">
            <GroupSizePicker
              value={spots}
              onChange={(count) => updateProfile({ defaultSpots: count })}
              hint={`A group of ${spots + 1} in total. The first ${spots} ${spots === 1 ? 'person' : 'people'} to say yes are in, the rest get told the spots went.`}
            />
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
