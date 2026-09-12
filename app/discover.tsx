import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, Chip, Surface, Typography, useThemeColor } from 'heroui-native';
import { List, Map as MapIcon, RefreshCw, SearchX } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { GroupSizePicker } from '@/components/GroupSizePicker';
import { RadiusSlider } from '@/components/RadiusSlider';
import { SpotCard } from '@/components/SpotCard';
import { SpotMap } from '@/components/SpotMap';
import { SpotPreviewCard } from '@/components/SpotPreviewCard';
import { distanceKm, travelMinutes } from '@/lib/geo';
import { HOME, SPOTS } from '@/lib/mockData';
import { clampSpots } from '@/lib/pings';
import { startPingSimulation } from '@/lib/simulation';
import { useAppStore } from '@/lib/store';
import type { SpotKind } from '@/lib/types';

type Filter = 'all' | SpotKind;
type ViewMode = 'map' | 'list';

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
  const [mode, setMode] = useState<ViewMode>('map');
  const [offset, setOffset] = useState(0);
  const [selectedId, setSelectedId] = useState<string>();
  const [accent, accentForeground] = useThemeColor(['accent', 'accent-foreground']);

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
    setSelectedId(undefined);
  }

  const shown = useMemo(() => {
    if (items.length <= BATCH) return items;
    return Array.from({ length: BATCH }, (_, index) => items[(offset + index) % items.length]);
  }, [items, offset]);

  const selected = shown.find((item) => item.spot.id === selectedId) ?? shown[0];
  const canRotate = items.length > BATCH;
  const spots = clampSpots(profile.defaultSpots);

  const rotate = () => {
    setOffset((current) => (current + BATCH) % items.length);
    setSelectedId(undefined);
  };

  const choose = (spotId: string) => {
    const id = createPing(spotId, profile.radiusKm, spots);
    startPingSimulation(id);
    router.replace({ pathname: '/ping/[id]', params: { id } });
  };

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-4 px-5 pb-12 pt-4"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-1">
        <Typography type="h3">Pick something</Typography>
        <Typography type="body-sm" color="muted">
          {canRotate
            ? `${shown.length} of ${items.length} ideas within ${profile.radiusKm} km.`
            : `${items.length} ideas within ${profile.radiusKm} km.`}{' '}
          Choose one and everyone nearby with the app hears about it.
        </Typography>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {FILTERS.map((item) => {
          const active = filter === item.key;
          return (
            <Chip
              key={item.key}
              variant={active ? 'primary' : 'tertiary'}
              color={active ? 'accent' : 'default'}
              onPress={() => setFilter(item.key)}
            >
              <Chip.Label>{item.label}</Chip.Label>
            </Chip>
          );
        })}
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row gap-2">
          <Chip
            variant={mode === 'map' ? 'primary' : 'tertiary'}
            color={mode === 'map' ? 'accent' : 'default'}
            onPress={() => setMode('map')}
          >
            <MapIcon color={mode === 'map' ? accentForeground : accent} size={13} />
            <Chip.Label>Map</Chip.Label>
          </Chip>
          <Chip
            variant={mode === 'list' ? 'primary' : 'tertiary'}
            color={mode === 'list' ? 'accent' : 'default'}
            onPress={() => setMode('list')}
          >
            <List color={mode === 'list' ? accentForeground : accent} size={13} />
            <Chip.Label>List</Chip.Label>
          </Chip>
        </View>

        {canRotate ? (
          <Button variant="tertiary" size="sm" onPress={rotate}>
            <RefreshCw color={accent} size={15} />
            <Button.Label>Five others</Button.Label>
          </Button>
        ) : null}
      </View>

      {items.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nothing in range"
          body="Widen your radius a little and a few unfamiliar corners show up."
          actionLabel="Add 2 km"
          onAction={() => updateProfile({ radiusKm: Math.min(10, profile.radiusKm + 2) })}
        />
      ) : mode === 'map' ? (
        <View className="gap-3">
          <SpotMap
            home={HOME}
            spots={shown.map((item) => item.spot)}
            radiusKm={profile.radiusKm}
            selectedId={selected?.spot.id}
            onSelect={setSelectedId}
          />

          {selected ? (
            <SpotPreviewCard
              spot={selected.spot}
              distanceKm={selected.km}
              travelMinutes={travelMinutes(selected.km, profile.travelMode)}
              onChoose={() => choose(selected.spot.id)}
            />
          ) : null}

          <Typography type="body-xs" color="muted">
            Tap a pin to see what it is, or switch to the list for the full details.
          </Typography>
        </View>
      ) : (
        <View className="gap-3">
          {shown.map((item) => (
            <SpotCard
              key={item.spot.id}
              spot={item.spot}
              distanceKm={item.km}
              travelMinutes={travelMinutes(item.km, profile.travelMode)}
              travelMode={profile.travelMode}
              onPress={() => choose(item.spot.id)}
            />
          ))}
        </View>
      )}

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
    </ScrollView>
  );
}
