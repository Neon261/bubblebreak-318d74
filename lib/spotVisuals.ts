import {
  Beer,
  Coffee,
  Dices,
  Dumbbell,
  Hammer,
  Music,
  Palette,
  ShoppingBasket,
  Trees,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react-native';
import type { ImageSourcePropType } from 'react-native';

import barPhoto from '@/assets/spots/bar.png';
import cafePhoto from '@/assets/spots/cafe.png';
import craftPhoto from '@/assets/spots/craft.png';
import culturePhoto from '@/assets/spots/culture.png';
import foodPhoto from '@/assets/spots/food.png';
import gamesPhoto from '@/assets/spots/games.png';
import marketPhoto from '@/assets/spots/market.png';
import musicPhoto from '@/assets/spots/music.png';
import outdoorsPhoto from '@/assets/spots/outdoors.png';
import sportPhoto from '@/assets/spots/sport.png';
import { formatClock } from '@/lib/geo';
import { spotEndsAt, spotStartsAt } from '@/lib/mockData';
import type { Spot, SpotCategory } from '@/lib/types';

export interface CategoryVisual {
  icon: LucideIcon;
  label: string;
  /** Soft background for the icon tile. */
  bgClass: string;
  /** Map pin colour — hex, because native map props cannot parse oklch. */
  pinColor: string;
  /** Category photo shown on the cards. */
  photo: ImageSourcePropType;
}

export const CATEGORY_VISUALS: Record<SpotCategory, CategoryVisual> = {
  cafe: {
    icon: Coffee,
    label: 'Café',
    bgClass: 'bg-clay-soft',
    pinColor: '#b0764a',
    photo: cafePhoto,
  },
  bar: {
    icon: Beer,
    label: 'Bar',
    bgClass: 'bg-sun-soft',
    pinColor: '#d99026',
    photo: barPhoto,
  },
  food: {
    icon: UtensilsCrossed,
    label: 'Food',
    bgClass: 'bg-berry-soft',
    pinColor: '#cf5133',
    photo: foodPhoto,
  },
  music: {
    icon: Music,
    label: 'Music',
    bgClass: 'bg-grape-soft',
    pinColor: '#8a63c9',
    photo: musicPhoto,
  },
  sport: {
    icon: Dumbbell,
    label: 'Sport',
    bgClass: 'bg-sky-soft',
    pinColor: '#2f7fb5',
    photo: sportPhoto,
  },
  outdoors: {
    icon: Trees,
    label: 'Outdoors',
    bgClass: 'bg-moss-soft',
    pinColor: '#3f9a72',
    photo: outdoorsPhoto,
  },
  culture: {
    icon: Palette,
    label: 'Culture',
    bgClass: 'bg-grape-soft',
    pinColor: '#6f4fb8',
    photo: culturePhoto,
  },
  games: {
    icon: Dices,
    label: 'Games',
    bgClass: 'bg-sky-soft',
    pinColor: '#1f9aa3',
    photo: gamesPhoto,
  },
  market: {
    icon: ShoppingBasket,
    label: 'Market',
    bgClass: 'bg-sun-soft',
    pinColor: '#c0447e',
    photo: marketPhoto,
  },
  craft: {
    icon: Hammer,
    label: 'Craft',
    bgClass: 'bg-clay-soft',
    pinColor: '#7e8b3f',
    photo: craftPhoto,
  },
};

export const PRICE_LABELS: Record<'free' | 'cheap' | 'mid', string> = {
  free: 'Free',
  cheap: 'Cheap',
  mid: 'Mid-priced',
};

/** Your own pin on the discover map. */
export const HOME_PIN_COLOR = '#146a70';

/** What to put on the category chip: events read as their category too. */
export function categoryLabel(spot: Spot): string {
  return CATEGORY_VISUALS[spot.category].label;
}

/** Cuisine plus price range, for anywhere that serves food or drinks. */
export function foodLine(spot: Spot): string | undefined {
  if (!spot.cuisine) return undefined;
  return `${spot.cuisine} · ${spot.priceTier ?? PRICE_LABELS[spot.price]}`;
}

/** Events show the window they run in, places just say they are open. */
export function timeLine(spot: Spot): string {
  const startsAt = spotStartsAt(spot);
  if (startsAt === undefined) return 'Open now';

  const endsAt = spotEndsAt(spot);
  return endsAt === undefined
    ? `Today ${formatClock(startsAt)}`
    : `Today ${formatClock(startsAt)}–${formatClock(endsAt)}`;
}
