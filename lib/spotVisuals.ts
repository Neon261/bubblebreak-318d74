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

import type { SpotCategory } from '@/lib/types';

export interface CategoryVisual {
  icon: LucideIcon;
  label: string;
  /** Soft background for the icon tile. */
  bgClass: string;
}

export const CATEGORY_VISUALS: Record<SpotCategory, CategoryVisual> = {
  cafe: { icon: Coffee, label: 'Café', bgClass: 'bg-clay-soft' },
  bar: { icon: Beer, label: 'Bar', bgClass: 'bg-sun-soft' },
  food: { icon: UtensilsCrossed, label: 'Food', bgClass: 'bg-berry-soft' },
  music: { icon: Music, label: 'Music', bgClass: 'bg-grape-soft' },
  sport: { icon: Dumbbell, label: 'Sport', bgClass: 'bg-sky-soft' },
  outdoors: { icon: Trees, label: 'Outdoors', bgClass: 'bg-moss-soft' },
  culture: { icon: Palette, label: 'Culture', bgClass: 'bg-grape-soft' },
  games: { icon: Dices, label: 'Games', bgClass: 'bg-sky-soft' },
  market: { icon: ShoppingBasket, label: 'Market', bgClass: 'bg-sun-soft' },
  craft: { icon: Hammer, label: 'Craft', bgClass: 'bg-clay-soft' },
};

export const PRICE_LABELS: Record<'free' | 'cheap' | 'mid', string> = {
  free: 'Free',
  cheap: 'Cheap',
  mid: 'Mid-priced',
};
