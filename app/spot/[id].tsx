import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Surface, Typography } from 'heroui-native';
import { Clock, ExternalLink, MapPin, SearchX, Users } from 'lucide-react-native';
import { Image, Linking, ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { GroupSizePicker } from '@/components/GroupSizePicker';
import { Heading } from '@/components/Heading';
import { distanceKm, formatDistance, travelMinutes } from '@/lib/geo';
import { SPOT_SOURCES } from '@/lib/hamburgSpots';
import { SPOTS } from '@/lib/mockData';
import { goBackOrReplace } from '@/lib/navigation';
import { currentLocation } from '@/lib/pings';
import { startPingSimulation } from '@/lib/simulation';
import {
  CATEGORY_VISUALS,
  categoryLabel,
  foodLine,
  PRICE_LABELS,
  timeLine,
} from '@/lib/spotVisuals';
import { useAppStore } from '@/lib/store';
import { BRAND } from '@/lib/theme';

const HERO_HEIGHT = 220;

const openUrl = (url: string) => () => void Linking.openURL(url);

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedSpots, setSelectedSpots] = useState<number>();
  const profile = useAppStore((state) => state.profile);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const createPing = useAppStore((state) => state.createPing);
  const spot = SPOTS.find((item) => item.id === id);

  if (!spot) {
    return (
      <View className="bg-background flex-1 justify-center px-5">
        <EmptyState
          icon={SearchX}
          title="This idea is no longer available"
          body="Go back to see what else is happening nearby."
          actionLabel="Back to ideas"
          onAction={() => goBackOrReplace('/discover')}
        />
      </View>
    );
  }

  const visual = CATEGORY_VISUALS[spot.category];
  const CategoryIcon = visual.icon;
  const source = SPOT_SOURCES[spot.source];
  const km = distanceKm(currentLocation(profile), spot.location);
  const minutes = travelMinutes(km, profile.travelMode);
  const food = foodLine(spot);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${spot.location.latitude},${spot.location.longitude}`;

  const confirm = () => {
    if (selectedSpots === undefined) return;
    const pingId = createPing(spot.id, profile.radiusKm, selectedSpots);
    startPingSimulation(pingId);
    router.replace({ pathname: '/ping/[id]', params: { id: pingId } });
  };

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-4 pb-12"
      showsVerticalScrollIndicator={false}
    >
      <Image
        source={visual.photo}
        resizeMode="cover"
        style={{ width: '100%', height: HERO_HEIGHT }}
        accessibilityIgnoresInvertColors
      />

      <View className="gap-4 px-5">
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <CategoryIcon color={visual.pinColor} size={16} />
            <Typography type="body-xs" weight="semibold" style={{ color: visual.pinColor }}>
              {categoryLabel(spot)}
              {spot.kind === 'event' ? ' · Happening today' : ''}
            </Typography>
          </View>
          <Heading type="h3">{spot.name}</Heading>
          <Typography type="body" color="muted">
            {spot.tagline}
          </Typography>
        </View>

        <Surface variant="default" className="gap-3 rounded-3xl p-4">
          <Typography type="body">{spot.description}</Typography>
          <View className="bg-accent-soft rounded-2xl px-3 py-2.5">
            <Typography type="body-sm" className="text-accent-soft-foreground">
              {spot.bubbleTag}
            </Typography>
          </View>
        </Surface>

        <Surface variant="default" className="gap-3 rounded-3xl p-4">
          <View className="flex-row items-start gap-3">
            <MapPin color={BRAND.accent} size={18} />
            <View className="flex-1 gap-0.5">
              <Typography type="body-sm" weight="semibold">
                {spot.address}
              </Typography>
              <Typography type="body-xs" color="muted">
                {spot.district} · {formatDistance(km)} · {minutes} min away
              </Typography>
            </View>
          </View>
          <View className="flex-row items-start gap-3">
            <Clock color={BRAND.accent} size={18} />
            <Typography type="body-sm" className="flex-1">
              {timeLine(spot)}
            </Typography>
          </View>
          <View className="flex-row items-start gap-3">
            <Users color={BRAND.accent} size={18} />
            <Typography type="body-sm" className="flex-1">
              {spot.crowd}
              {food ? ` · ${food}` : ` · ${PRICE_LABELS[spot.price]}`}
            </Typography>
          </View>
          <Button variant="tertiary" onPress={() => void Linking.openURL(mapUrl)}>
            <MapPin color={BRAND.accent} size={16} />
            <Button.Label>Open location</Button.Label>
          </Button>
        </Surface>

        <Surface variant="default" className="gap-2 rounded-3xl p-4">
          <Typography type="body-xs" color="muted">
            Found via
          </Typography>
          <Typography type="body-sm" weight="semibold">
            {source.label}
          </Typography>
          <Typography type="body-sm" color="muted">
            {source.blurb}
          </Typography>
          {source.url ? (
            <Button variant="tertiary" onPress={openUrl(source.url)}>
              <ExternalLink color={BRAND.accent} size={16} />
              <Button.Label>Visit source</Button.Label>
            </Button>
          ) : null}
        </Surface>

        <Surface variant="default" className="rounded-3xl p-4">
          <GroupSizePicker
            value={selectedSpots ?? 0}
            onChange={(count) => {
              setSelectedSpots(count);
              updateProfile({ defaultSpots: count });
            }}
            hint={
              selectedSpots === undefined
                ? 'Choose how many people can join.'
                : `A group of ${selectedSpots + 1} in total, including you.`
            }
          />
        </Surface>

        <Button size="lg" isDisabled={selectedSpots === undefined} onPress={confirm}>
          <Button.Label>Let&apos;s do this</Button.Label>
        </Button>
      </View>
    </ScrollView>
  );
}
