export interface Coordinate {
  latitude: number;
  longitude: number;
}

export type Interest =
  | 'music'
  | 'sports'
  | 'food'
  | 'art'
  | 'outdoors'
  | 'games'
  | 'talks'
  | 'dance';

export type SpotKind = 'place' | 'event';

export type SpotCategory =
  | 'cafe'
  | 'bar'
  | 'food'
  | 'music'
  | 'sport'
  | 'outdoors'
  | 'culture'
  | 'games'
  | 'market'
  | 'craft';

export type TravelMode = 'walk' | 'bike' | 'transit' | 'car';

export type ReadyMinutes = 15 | 30 | 45 | 60;

export interface Spot {
  id: string;
  name: string;
  kind: SpotKind;
  category: SpotCategory;
  tagline: string;
  description: string;
  address: string;
  /** Where exactly to stand when you arrive. */
  meetingHint: string;
  location: Coordinate;
  /** Events only: minutes from session start until it kicks off. */
  startsInMinutes?: number;
  price: 'free' | 'cheap' | 'mid';
  /** Why this nudges you out of your usual circle. */
  bubbleTag: string;
  interests: Interest[];
  crowd: string;
}

export interface Person {
  id: string;
  name: string;
  /** Their own generated one-liner. */
  bio: string;
  colorClass: string;
  interests: Interest[];
  location: Coordinate;
  travelMode: TravelMode;
  /** How likely they are to answer a ping. */
  vibe: 'eager' | 'maybe' | 'quiet';
}

/** A person id, or the literal `me` for the phone owner. */
export type ParticipantId = string;

export const ME: ParticipantId = 'me';

export interface Participant {
  personId: ParticipantId;
  readyMinutes: ReadyMinutes;
  travelMode: TravelMode;
  /** Distance from this person to the spot, in km. */
  distanceKm: number;
  travelMinutes: number;
  joinedAt: number;
}

export type PingStatus = 'open' | 'locked' | 'cancelled' | 'declined';

export interface Ping {
  id: string;
  hostId: ParticipantId;
  spotId: string;
  radiusKm: number;
  createdAt: number;
  /** People whose phones buzzed. */
  notifiedIds: string[];
  passedIds: string[];
  /** Wanted in, but the spots were already taken. */
  missedIds: string[];
  /** How many people the host lets in besides themselves, 1-5. */
  spotsForOthers: number;
  joins: Participant[];
  status: PingStatus;
  /** Set once the plan is sent out. */
  meetAt?: number;
  /** Inbound pings: whether I already answered. */
  myResponse: 'none' | 'joined' | 'passed';
  seen: boolean;
}

/** The five sides of a person the app asks about during registration. */
export type IntroCategoryId = 'doing' | 'personality' | 'funfact' | 'hobby' | 'signature';

/** Which question from a group is on screen, and the option chosen for it. */
export interface IntroPick {
  questionId: string;
  optionId?: string;
}

/** Category id -> the question drawn for it plus the answer. */
export type IntroAnswers = Partial<Record<IntroCategoryId, IntroPick>>;

export type VerificationStatus = 'unverified' | 'verified';

/** What comes back from the outside identity provider — never a photo. */
export interface VerificationInfo {
  status: VerificationStatus;
  provider?: string;
  /** Provider-side reference code for the passed check. */
  reference?: string;
  verifiedAt?: number;
}

export interface Profile {
  /** First name only. No photo, no age anywhere in the app. */
  firstName: string;
  /** The one funny line generated from the registration answers. */
  intro: string;
  introAnswers: IntroAnswers;
  /** Which sentence wording is in use; shuffling moves this on. */
  introVariant: number;
  interests: Interest[];
  travelMode: TravelMode;
  defaultReadyMinutes: ReadyMinutes;
  /** How many people I let into a ping I start, 1-5. */
  defaultSpots: number;
  radiusKm: number;
  openToPings: boolean;
  notificationsEnabled: boolean;
  verification: VerificationInfo;
  /** Set once name, sentence and verification are all done. */
  registeredAt?: number;
}
