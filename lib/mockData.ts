import { HAMBURG_SPOTS, HOME, offsetFromHome } from '@/lib/hamburgSpots';
import type { Interest, Person, Spot } from '@/lib/types';

/** Everything time-based is relative to when the app session started. */
export const SESSION_START = Date.now();

export { HOME };

/** Curated Hamburg places and today-only events. */
export const SPOTS: Spot[] = HAMBURG_SPOTS;

/** Simulated neighbours, scattered around Ottensen (never out on the water). */
const offset = offsetFromHome;

export const INTEREST_LABELS: Record<Interest, string> = {
  music: 'Music',
  sports: 'Sports',
  food: 'Food',
  art: 'Art',
  outdoors: 'Outdoors',
  games: 'Games',
  talks: 'Talks',
  dance: 'Dance',
};

export const ALL_INTERESTS: Interest[] = [
  'music',
  'sports',
  'food',
  'art',
  'outdoors',
  'games',
  'talks',
  'dance',
];

export function spotStartsAt(spot: Spot): number | undefined {
  return spot.startsInMinutes === undefined
    ? undefined
    : SESSION_START + spot.startsInMinutes * 60_000;
}

/** Events only: when the window closes again. */
export function spotEndsAt(spot: Spot): number | undefined {
  const startsAt = spotStartsAt(spot);
  if (startsAt === undefined || spot.runsForMinutes === undefined) return undefined;
  return startsAt + spot.runsForMinutes * 60_000;
}

export const PEOPLE: Person[] = [
  {
    id: 'p-yara',
    name: 'Yara',
    bio: "I work nights at the hospital, and I'm learning bass badly.",
    colorClass: 'bg-berry',
    interests: ['music', 'food'],
    location: offset(0.7, 0.4),
    travelMode: 'bike',
    vibe: 'eager',
  },
  {
    id: 'p-tomas',
    name: 'Tomás',
    bio: 'I bake far too much bread and give most of it away.',
    colorClass: 'bg-sun',
    interests: ['food', 'talks'],
    location: offset(-0.9, 0.8),
    travelMode: 'walk',
    vibe: 'eager',
  },
  {
    id: 'p-aicha',
    name: 'Aïcha',
    bio: "I fix roofs all day, then I'm a menace at pub quizzes.",
    colorClass: 'bg-grape',
    interests: ['games', 'sports'],
    location: offset(1.6, -0.7),
    travelMode: 'transit',
    vibe: 'maybe',
  },
  {
    id: 'p-bo',
    name: 'Bo',
    bio: 'I run slowly on purpose so I can keep talking the whole way.',
    colorClass: 'bg-moss',
    interests: ['sports', 'outdoors'],
    location: offset(-1.3, 1.1),
    travelMode: 'bike',
    vibe: 'eager',
  },
  {
    id: 'p-ingrid',
    name: 'Ingrid',
    bio: 'I was an electrician for thirty years, so I can still fix anything.',
    colorClass: 'bg-clay',
    interests: ['talks', 'art'],
    location: offset(-0.4, -1.6),
    travelMode: 'walk',
    vibe: 'maybe',
  },
  {
    id: 'p-malik',
    name: 'Malik',
    bio: 'I drive a bus on the night lines, and I spend the wages on vinyl.',
    colorClass: 'bg-sky',
    interests: ['music', 'talks'],
    location: offset(2.4, 1.9),
    travelMode: 'transit',
    vibe: 'eager',
  },
  {
    id: 'p-sena',
    name: 'Sena',
    bio: 'I study bees for a living and dance salsa much worse than that.',
    colorClass: 'bg-berry',
    interests: ['dance', 'outdoors'],
    location: offset(1.1, 2.2),
    travelMode: 'bike',
    vibe: 'eager',
  },
  {
    id: 'p-paulo',
    name: 'Paulo',
    bio: "I cook in a kitchen all week, and I'll still cook on my day off.",
    colorClass: 'bg-sun',
    interests: ['food', 'games'],
    location: offset(2.6, -1.2),
    travelMode: 'car',
    vibe: 'maybe',
  },
  {
    id: 'p-nour',
    name: 'Nour',
    bio: 'I translate in four languages and get everywhere on one old bike.',
    colorClass: 'bg-grape',
    interests: ['talks', 'art'],
    location: offset(3.1, -0.9),
    travelMode: 'bike',
    vibe: 'maybe',
  },
  {
    id: 'p-kai',
    name: 'Kai',
    bio: "I'm training as a carpenter, and I lose at chess every single week.",
    colorClass: 'bg-moss',
    interests: ['games', 'sports'],
    location: offset(3.4, -2.1),
    travelMode: 'transit',
    vibe: 'quiet',
  },
  {
    id: 'p-reva',
    name: 'Reva',
    bio: 'I deliver babies for work and sing in a choir full of strangers.',
    colorClass: 'bg-sky',
    interests: ['music', 'talks'],
    location: offset(2.8, -3.4),
    travelMode: 'car',
    vibe: 'maybe',
  },
  {
    id: 'p-fabi',
    name: 'Fabi',
    bio: 'I ride courier all day, so I know every shortcut in this city.',
    colorClass: 'bg-clay',
    interests: ['sports', 'outdoors', 'food'],
    location: offset(4.2, 1.4),
    travelMode: 'bike',
    vibe: 'eager',
  },
  {
    id: 'p-hana',
    name: 'Hana',
    bio: 'I mix sound for bands, which means I hear absolutely everything.',
    colorClass: 'bg-berry',
    interests: ['music', 'art'],
    location: offset(4.6, 1.2),
    travelMode: 'transit',
    vibe: 'quiet',
  },
  {
    id: 'p-dmitri',
    name: 'Dmitri',
    bio: 'I drive a taxi, and I always tell the good version of the story.',
    colorClass: 'bg-sun',
    interests: ['talks', 'games'],
    location: offset(5.1, -2.6),
    travelMode: 'car',
    vibe: 'maybe',
  },
  {
    id: 'p-lea',
    name: 'Lea',
    bio: "I look after other people's animals, and I climb on Tuesdays.",
    colorClass: 'bg-grape',
    interests: ['sports', 'food'],
    location: offset(5.8, 2.9),
    travelMode: 'bike',
    vibe: 'maybe',
  },
  {
    id: 'p-jonas',
    name: 'Jonas',
    bio: 'I deliver the post, then I go home and draw the routes I walked.',
    colorClass: 'bg-moss',
    interests: ['art', 'outdoors'],
    location: offset(-6.4, 3.8),
    travelMode: 'walk',
    vibe: 'quiet',
  },
  {
    id: 'p-mira',
    name: 'Mira',
    bio: 'I garden for a living, and I bring snacks to absolutely everything.',
    colorClass: 'bg-sky',
    interests: ['outdoors', 'food', 'dance'],
    location: offset(7.2, -4.5),
    travelMode: 'car',
    vibe: 'eager',
  },
  {
    id: 'p-otto',
    name: 'Otto',
    bio: 'I play the accordion at bus stops, mostly for my own amusement.',
    colorClass: 'bg-clay',
    interests: ['music', 'talks'],
    location: offset(-6.8, 3.0),
    travelMode: 'transit',
    vibe: 'quiet',
  },
];

export const PEOPLE_BY_ID: Record<string, Person> = Object.fromEntries(
  PEOPLE.map((person) => [person.id, person]),
);

export const SPOTS_BY_ID: Record<string, Spot> = Object.fromEntries(
  SPOTS.map((spot) => [spot.id, spot]),
);
