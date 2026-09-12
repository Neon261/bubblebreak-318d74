import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { computeMeetAt, distanceKm, travelMinutes } from '@/lib/geo';
import { HOME, PEOPLE, SPOTS_BY_ID } from '@/lib/mockData';
import {
  ME,
  type Participant,
  type Ping,
  type Profile,
  type ReadyMinutes,
  type TravelMode,
} from '@/lib/types';

const DEFAULT_PROFILE: Profile = {
  name: 'You',
  age: 32,
  bio: 'Curious, mildly overbooked, up for the unfamiliar',
  interests: ['food', 'music', 'outdoors'],
  travelMode: 'bike',
  defaultReadyMinutes: 30,
  radiusKm: 3,
  openToPings: true,
  notificationsEnabled: false,
};

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
      storage: createJSONStorage(() => AsyncStorage),
      // Live pings are session state; only the profile is worth keeping.
      partialize: (state) => ({ profile: state.profile }),
    },
  ),
);
