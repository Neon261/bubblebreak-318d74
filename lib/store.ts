import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { computeMeetAt, distanceKm, travelMinutes } from '@/lib/geo';
import { buildIntroSentence, INTRO_TEMPLATE_COUNT } from '@/lib/introSentence';
import { HOME, PEOPLE, SPOTS_BY_ID } from '@/lib/mockData';
import {
  type IntroQuestionId,
  ME,
  type Participant,
  type Ping,
  type Profile,
  type ReadyMinutes,
  type TravelMode,
} from '@/lib/types';
import { VERIFY_PROVIDER } from '@/lib/verification';

const DEFAULT_PROFILE: Profile = {
  firstName: '',
  intro: '',
  introAnswers: {},
  introVariant: 0,
  interests: ['food', 'music', 'outdoors'],
  travelMode: 'bike',
  defaultReadyMinutes: 30,
  radiusKm: 3,
  openToPings: true,
  notificationsEnabled: false,
  verification: { status: 'unverified' },
};

/** Keeps the shown sentence in step with the name and the answers behind it. */
function withIntro(profile: Profile): Profile {
  return {
    ...profile,
    intro: buildIntroSentence(profile.firstName, profile.introAnswers, profile.introVariant),
  };
}

function hasPersistedProfile(value: unknown): value is { profile: Partial<Profile> } {
  return typeof value === 'object' && value !== null && 'profile' in value;
}

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export interface AppState {
  profile: Profile;
  pings: Record<string, Ping>;
  /** Newest first. */
  pingIds: string[];
  updateProfile: (patch: Partial<Profile>) => void;
  /** Registration step 1. */
  setFirstName: (firstName: string) => void;
  /** Registration step 2: one of the five questions gets answered. */
  setIntroAnswer: (questionId: IntroQuestionId, optionId: string) => void;
  /** Re-word the same answers. */
  shuffleIntro: () => void;
  /** Registration step 3: the outside provider came back with a pass. */
  markVerified: (reference: string) => void;
  /** Verification passed and the person is in. */
  completeRegistration: () => void;
  createPing: (spotId: string, radiusKm: number) => string;
  addInboundPing: (ping: Ping) => void;
  addJoin: (pingId: string, participant: Participant) => void;
  markPassed: (pingId: string, personId: string) => void;
  /** Host sends the meeting point and time to everyone who joined. */
  lockPing: (pingId: string) => void;
  cancelPing: (pingId: string) => void;
  joinInbound: (pingId: string, readyMinutes: ReadyMinutes, travelMode: TravelMode) => void;
  passInbound: (pingId: string) => void;
  markSeen: (pingId: string) => void;
  /** Change how long I need to get ready on a ping I already joined. */
  setMyReady: (pingId: string, readyMinutes: ReadyMinutes) => void;
  leavePing: (pingId: string) => void;
}

type PingPatch = (ping: Ping) => Ping;

function patchPings(
  pings: Record<string, Ping>,
  pingId: string,
  patch: PingPatch,
): Record<string, Ping> {
  const existing = pings[pingId];
  if (!existing) return pings;
  const next = patch(existing);
  if (next === existing) return pings;
  return { ...pings, [pingId]: next };
}

/** Who is close enough to get buzzed about a ping. */
export function peopleInRadius(radiusKm: number): string[] {
  return PEOPLE.filter((person) => distanceKm(HOME, person.location) <= radiusKm).map(
    (person) => person.id,
  );
}

export function myParticipant(
  spotId: string,
  readyMinutes: ReadyMinutes,
  travelMode: TravelMode,
): Participant {
  const spot = SPOTS_BY_ID[spotId];
  const km = spot ? distanceKm(HOME, spot.location) : 0;
  return {
    personId: ME,
    readyMinutes,
    travelMode,
    distanceKm: km,
    travelMinutes: travelMinutes(km, travelMode),
    joinedAt: Date.now(),
  };
}

export const useAppStore = create<AppState>()(
  persist<AppState, [], [], Pick<AppState, 'profile'>>(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      pings: {},
      pingIds: [],

      updateProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),

      setFirstName: (firstName) =>
        set((state) => ({ profile: withIntro({ ...state.profile, firstName: firstName.trim() }) })),

      setIntroAnswer: (questionId, optionId) =>
        set((state) => ({
          profile: withIntro({
            ...state.profile,
            introAnswers: { ...state.profile.introAnswers, [questionId]: optionId },
          }),
        })),

      shuffleIntro: () =>
        set((state) => ({
          profile: withIntro({
            ...state.profile,
            introVariant: (state.profile.introVariant + 1) % INTRO_TEMPLATE_COUNT,
          }),
        })),

      markVerified: (reference) =>
        set((state) => ({
          profile: {
            ...state.profile,
            verification: {
              status: 'verified',
              provider: VERIFY_PROVIDER,
              reference,
              verifiedAt: Date.now(),
            },
          },
        })),

      completeRegistration: () =>
        set((state) => ({ profile: { ...state.profile, registeredAt: Date.now() } })),

      createPing: (spotId, radiusKm) => {
        const id = nextId('ping');
        const { profile } = get();
        const ping: Ping = {
          id,
          hostId: ME,
          spotId,
          radiusKm,
          createdAt: Date.now(),
          notifiedIds: peopleInRadius(radiusKm),
          passedIds: [],
          joins: [myParticipant(spotId, profile.defaultReadyMinutes, profile.travelMode)],
          status: 'open',
          myResponse: 'joined',
          seen: true,
        };
        set((state) => ({
          pings: { ...state.pings, [id]: ping },
          pingIds: [id, ...state.pingIds],
        }));
        return id;
      },

      addInboundPing: (ping) =>
        set((state) => ({
          pings: { ...state.pings, [ping.id]: ping },
          pingIds: [ping.id, ...state.pingIds],
        })),

      addJoin: (pingId, participant) =>
        set((state) => ({
          pings: patchPings(state.pings, pingId, (ping) =>
            ping.joins.some((join) => join.personId === participant.personId)
              ? ping
              : { ...ping, joins: [...ping.joins, participant] },
          ),
        })),

      markPassed: (pingId, personId) =>
        set((state) => ({
          pings: patchPings(state.pings, pingId, (ping) =>
            ping.passedIds.includes(personId)
              ? ping
              : { ...ping, passedIds: [...ping.passedIds, personId] },
          ),
        })),

      lockPing: (pingId) =>
        set((state) => ({
          pings: patchPings(state.pings, pingId, (ping) =>
            ping.status === 'open'
              ? { ...ping, status: 'locked', meetAt: computeMeetAt(ping.joins) }
              : ping,
          ),
        })),

      cancelPing: (pingId) =>
        set((state) => ({
          pings: patchPings(state.pings, pingId, (ping) => ({ ...ping, status: 'cancelled' })),
        })),

      joinInbound: (pingId, readyMinutes, travelMode) =>
        set((state) => ({
          pings: patchPings(state.pings, pingId, (ping) => ({
            ...ping,
            myResponse: 'joined',
            seen: true,
            joins: ping.joins.some((join) => join.personId === ME)
              ? ping.joins
              : [...ping.joins, myParticipant(ping.spotId, readyMinutes, travelMode)],
          })),
        })),

      passInbound: (pingId) =>
        set((state) => ({
          pings: patchPings(state.pings, pingId, (ping) => ({
            ...ping,
            myResponse: 'passed',
            status: 'declined',
            seen: true,
          })),
        })),

      markSeen: (pingId) =>
        set((state) => ({
          pings: patchPings(state.pings, pingId, (ping) =>
            ping.seen ? ping : { ...ping, seen: true },
          ),
        })),

      setMyReady: (pingId, readyMinutes) =>
        set((state) => ({
          pings: patchPings(state.pings, pingId, (ping) => ({
            ...ping,
            joins: ping.joins.map((join) =>
              join.personId === ME ? { ...join, readyMinutes } : join,
            ),
          })),
        })),

      leavePing: (pingId) =>
        set((state) => ({
          pings: patchPings(state.pings, pingId, (ping) => ({
            ...ping,
            myResponse: 'passed',
            joins: ping.joins.filter((join) => join.personId !== ME),
            status: ping.hostId === ME ? 'cancelled' : ping.status,
          })),
        })),
    }),
    {
      name: 'bubble-store',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      // Live pings are session state; only the profile is worth keeping.
      partialize: (state) => ({ profile: state.profile }),
      // Profiles saved before registration existed have no name, sentence or
      // verification, so they start the flow from the top.
      migrate: () => ({ profile: DEFAULT_PROFILE }),
      merge: (persisted, current) => {
        const saved = hasPersistedProfile(persisted) ? persisted.profile : undefined;
        return { ...current, profile: { ...DEFAULT_PROFILE, ...saved } };
      },
    },
  ),
);
