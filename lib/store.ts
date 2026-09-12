import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { computeMeetAt, distanceKm, travelMinutes } from '@/lib/geo';
import {
  buildIntroSentence,
  currentIntroQuestion,
  INTRO_TEMPLATE_COUNT,
  randomIntroPicks,
  switchedIntroPick,
  withIntroPicks,
} from '@/lib/introSentence';
import { PEOPLE, SPOTS_BY_ID } from '@/lib/mockData';
import {
  canCancelHostedPing,
  clampSpots,
  currentLocation,
  spotsLeft,
  spotsTaken,
} from '@/lib/pings';
import {
  type Coordinate,
  type IntroCategoryId,
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
  defaultSpots: 3,
  radiusKm: 3,
  locationPermission: 'notAsked',
  openToPings: true,
  notificationsEnabled: false,
  verification: { status: 'unverified' },
};

/**
 * Keeps the shown intro in step with the answers behind it. It is written in
 * the first person, so the name is not part of it. A half-finished set of
 * answers leaves the last good version in place, so switching a question in
 * the editor does not blank the profile.
 */
function withIntro(profile: Profile): Profile {
  const intro = buildIntroSentence(profile.introAnswers, profile.introVariant);
  return { ...profile, intro: intro || profile.intro };
}

/** A brand new person: no answers yet, one random question drawn per group. */
function freshProfile(): Profile {
  return { ...DEFAULT_PROFILE, introAnswers: randomIntroPicks() };
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
  setLocation: (permission: Profile['locationPermission'], location?: Coordinate) => void;
  /** Registration step 1. */
  setFirstName: (firstName: string) => void;
  /** Registration step 2: answers the question currently shown for a group. */
  setIntroAnswer: (categoryId: IntroCategoryId, optionId: string) => void;
  /** Their own wording when none of the options fits; empty text clears it. */
  setIntroCustomAnswer: (categoryId: IntroCategoryId, text: string) => void;
  /** Draws another question from the same group and clears that answer. */
  switchIntroQuestion: (categoryId: IntroCategoryId) => void;
  /** Re-word the same answers. */
  shuffleIntro: () => void;
  /** Registration step 3: the outside provider came back with a pass. */
  markVerified: (reference: string) => void;
  /** Verification passed and the person is in. */
  completeRegistration: () => void;
  createPing: (spotId: string, radiusKm: number, spotsForOthers: number) => string;
  addInboundPing: (ping: Ping) => void;
  /** First come, first in: returns false when the spots are already gone. */
  addJoin: (pingId: string, participant: Participant) => boolean;
  markPassed: (pingId: string, personId: string) => void;
  /** Wanted in but arrived after the last spot went. */
  markMissed: (pingId: string, personId: string) => void;
  /** Host changes how many people can come, never below who is already in. */
  setSpotCount: (pingId: string, spotsForOthers: number) => void;
  /** Host sends the meeting point and time to everyone who joined. */
  lockPing: (pingId: string) => void;
  cancelPing: (pingId: string) => boolean;
  deleteDraft: (pingId: string) => boolean;
  sendMessage: (pingId: string, body: string) => void;
  /** Returns false when the last spot went before I tapped join. */
  joinInbound: (pingId: string, readyMinutes: ReadyMinutes, travelMode: TravelMode) => boolean;
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
export function peopleInRadius(radiusKm: number, origin: Coordinate): string[] {
  return PEOPLE.filter((person) => distanceKm(origin, person.location) <= radiusKm).map(
    (person) => person.id,
  );
}

export function myParticipant(
  spotId: string,
  readyMinutes: ReadyMinutes,
  travelMode: TravelMode,
  origin: Coordinate,
): Participant {
  const spot = SPOTS_BY_ID[spotId];
  const km = spot ? distanceKm(origin, spot.location) : 0;
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
      profile: freshProfile(),
      pings: {},
      pingIds: [],

      updateProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),

      setLocation: (permission, location) =>
        set((state) => ({
          profile: {
            ...state.profile,
            locationPermission: permission,
            location: permission === 'granted' ? location : undefined,
          },
        })),

      setFirstName: (firstName) =>
        set((state) => ({ profile: withIntro({ ...state.profile, firstName: firstName.trim() }) })),

      setIntroAnswer: (categoryId, optionId) =>
        set((state) => {
          const question = currentIntroQuestion(categoryId, state.profile.introAnswers);
          if (!question) return {};
          return {
            profile: withIntro({
              ...state.profile,
              introAnswers: {
                ...state.profile.introAnswers,
                [categoryId]: { questionId: question.id, optionId },
              },
            }),
          };
        }),

      setIntroCustomAnswer: (categoryId, text) =>
        set((state) => {
          const question = currentIntroQuestion(categoryId, state.profile.introAnswers);
          if (!question) return {};
          return {
            profile: withIntro({
              ...state.profile,
              introAnswers: {
                ...state.profile.introAnswers,
                // Kept exactly as typed; the sentence tidies it up on the way in.
                [categoryId]: { questionId: question.id, customText: text || undefined },
              },
            }),
          };
        }),

      switchIntroQuestion: (categoryId) =>
        set((state) => {
          const pick = switchedIntroPick(categoryId, state.profile.introAnswers);
          if (!pick) return {};
          return {
            profile: withIntro({
              ...state.profile,
              introAnswers: { ...state.profile.introAnswers, [categoryId]: pick },
            }),
          };
        }),

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

      createPing: (spotId, radiusKm, spotsForOthers) => {
        const id = nextId('ping');
        const { profile } = get();
        const origin = currentLocation(profile);
        const ping: Ping = {
          id,
          hostId: ME,
          spotId,
          radiusKm,
          createdAt: Date.now(),
          notifiedIds: peopleInRadius(radiusKm, origin),
          passedIds: [],
          missedIds: [],
          spotsForOthers: clampSpots(spotsForOthers),
          joins: [
            myParticipant(spotId, profile.defaultReadyMinutes, profile.travelMode, origin),
          ],
          status: 'open',
          myResponse: 'joined',
          seen: true,
          messages: [],
        };
        set((state) => ({
          pings: { ...state.pings, [id]: ping },
          pingIds: [id, ...state.pingIds],
        }));
        return id;
      },

      addInboundPing: (ping) =>
        set((state) => ({
          pings: { ...state.pings, [ping.id]: { ...ping, messages: ping.messages ?? [] } },
          pingIds: [ping.id, ...state.pingIds],
        })),

      addJoin: (pingId, participant) => {
        const ping = get().pings[pingId];
        if (!ping || ping.status !== 'open') return false;
        if (ping.joins.some((join) => join.personId === participant.personId)) return false;
        // First come, first in — a late yes finds the spots gone.
        if (spotsLeft(ping) === 0) return false;
        set((state) => ({
          pings: patchPings(state.pings, pingId, (current) => ({
            ...current,
            joins: [...current.joins, participant],
          })),
        }));
        return true;
      },

      markPassed: (pingId, personId) =>
        set((state) => ({
          pings: patchPings(state.pings, pingId, (ping) =>
            ping.passedIds.includes(personId)
              ? ping
              : { ...ping, passedIds: [...ping.passedIds, personId] },
          ),
        })),

      markMissed: (pingId, personId) =>
        set((state) => ({
          pings: patchPings(state.pings, pingId, (ping) =>
            ping.missedIds.includes(personId)
              ? ping
              : { ...ping, missedIds: [...ping.missedIds, personId] },
          ),
        })),

      setSpotCount: (pingId, spotsForOthers) =>
        set((state) => ({
          pings: patchPings(state.pings, pingId, (ping) => {
            if (ping.status !== 'open') return ping;
            const next = Math.max(clampSpots(spotsForOthers), spotsTaken(ping));
            return next === ping.spotsForOthers ? ping : { ...ping, spotsForOthers: next };
          }),
        })),

      lockPing: (pingId) =>
        set((state) => ({
          pings: patchPings(state.pings, pingId, (ping) =>
            ping.status === 'open'
              ? { ...ping, status: 'locked', meetAt: computeMeetAt(ping.joins) }
              : ping,
          ),
        })),

      cancelPing: (pingId) => {
        const ping = get().pings[pingId];
        if (!ping || !canCancelHostedPing(ping)) return false;
        set((state) => ({
          pings: patchPings(state.pings, pingId, (current) => ({
            ...current,
            status: 'cancelled',
            cancelledAt: Date.now(),
          })),
        }));
        return true;
      },

      deleteDraft: (pingId) => {
        const ping = get().pings[pingId];
        const canDelete =
          ping?.hostId === ME &&
          ping.status === 'open' &&
          !ping.joins.some((join) => join.personId !== ME);
        if (!canDelete) return false;
        set((state) => {
          const { [pingId]: _deleted, ...remaining } = state.pings;
          return { pings: remaining, pingIds: state.pingIds.filter((id) => id !== pingId) };
        });
        return true;
      },

      sendMessage: (pingId, body) => {
        const clean = body.trim();
        if (!clean) return;
        set((state) => ({
          pings: patchPings(state.pings, pingId, (ping) => {
            if (ping.myResponse !== 'joined' || !ping.joins.some((join) => join.personId === ME)) {
              return ping;
            }
            return {
              ...ping,
              messages: [
                ...ping.messages,
                { id: nextId('message'), senderId: ME, body: clean, sentAt: Date.now() },
              ],
            };
          }),
        }));
      },

      joinInbound: (pingId, readyMinutes, travelMode) => {
        const ping = get().pings[pingId];
        if (!ping || ping.status !== 'open') return false;
        const origin = currentLocation(get().profile);
        const alreadyIn = ping.joins.some((join) => join.personId === ME);
        if (!alreadyIn && spotsLeft(ping) === 0) return false;
        set((state) => ({
          pings: patchPings(state.pings, pingId, (current) => ({
            ...current,
            myResponse: 'joined',
            seen: true,
            joins: alreadyIn
              ? current.joins
              : [
                  ...current.joins,
                  myParticipant(current.spotId, readyMinutes, travelMode, origin),
                ],
          })),
        }));
        return true;
      },

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
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      // Live pings are session state; only the profile is worth keeping.
      partialize: (state) => ({ profile: state.profile }),
      // Older profiles answered a fixed question list that no longer exists,
      // so they start registration from the top with a fresh draw.
      migrate: () => ({ profile: freshProfile() }),
      merge: (persisted, current) => {
        const saved = hasPersistedProfile(persisted) ? persisted.profile : undefined;
        const profile: Profile = { ...DEFAULT_PROFILE, ...saved };
        // Fills any group whose question went missing, keeping real answers.
        return {
          ...current,
          profile: { ...profile, introAnswers: withIntroPicks(profile.introAnswers) },
        };
      },
    },
  ),
);
