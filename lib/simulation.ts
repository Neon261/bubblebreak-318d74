import { distanceKm, travelMinutes } from '@/lib/geo';
import { HOME, PEOPLE, PEOPLE_BY_ID, SPOTS, SPOTS_BY_ID } from '@/lib/mockData';
import { pushLocalNotification } from '@/lib/notifications';
import { clampSpots, isFull } from '@/lib/pings';
import { useAppStore } from '@/lib/store';
import {
  ME,
  type Participant,
  type Person,
  type Ping,
  type ReadyMinutes,
  type Spot,
} from '@/lib/types';

type Timer = ReturnType<typeof setTimeout>;

const timers = new Map<string, Timer[]>();

function schedule(key: string, delayMs: number, fn: () => void) {
  const timer = setTimeout(fn, delayMs);
  const existing = timers.get(key);
  if (existing) existing.push(timer);
  else timers.set(key, [timer]);
}

export function clearTimers(key: string) {
  timers.get(key)?.forEach((timer) => clearTimeout(timer));
  timers.delete(key);
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

const JOIN_CHANCE = { eager: 0.8, maybe: 0.5, quiet: 0.22 } as const;

function overlaps(person: Person, spot: Spot): boolean {
  return person.interests.some((interest) => spot.interests.includes(interest));
}

function readyChoice(person: Person): ReadyMinutes {
  if (person.vibe === 'eager') return pick<ReadyMinutes>([15, 15, 30]);
  if (person.vibe === 'maybe') return pick<ReadyMinutes>([30, 30, 45]);
  return pick<ReadyMinutes>([45, 60]);
}

export function personParticipant(
  person: Person,
  spot: Spot,
  readyMinutes: ReadyMinutes = readyChoice(person),
): Participant {
  const km = distanceKm(person.location, spot.location);
  return {
    personId: person.id,
    readyMinutes,
    travelMode: person.travelMode,
    distanceKm: km,
    travelMinutes: travelMinutes(km, person.travelMode),
    joinedAt: Date.now(),
  };
}

/**
 * Nearby phones buzz, then answers trickle in over the next minute.
 * Stops as soon as the ping is no longer open.
 */
export function startPingSimulation(pingId: string) {
  clearTimers(pingId);
  const ping = useAppStore.getState().pings[pingId];
  const spot = ping ? SPOTS_BY_ID[ping.spotId] : undefined;
  if (!ping || !spot) return;

  const candidates = ping.notifiedIds
    .map((id) => PEOPLE_BY_ID[id])
    .filter((person): person is Person => Boolean(person))
    .sort((a, b) => distanceKm(HOME, a.location) - distanceKm(HOME, b.location));

  let delay = randomBetween(1800, 3200);

  candidates.forEach((person) => {
    delay += randomBetween(2200, 6500);
    const chance = Math.min(0.92, JOIN_CHANCE[person.vibe] + (overlaps(person, spot) ? 0.2 : 0));
    const willJoin = Math.random() < chance;

    schedule(pingId, delay, () => {
      const current = useAppStore.getState().pings[pingId];
      if (!current || current.status !== 'open') return;

      if (!willJoin) {
        useAppStore.getState().markPassed(pingId, person.id);
        return;
      }

      // Wanted in, but somebody else took the last spot first.
      if (isFull(current)) {
        useAppStore.getState().markMissed(pingId, person.id);
        return;
      }

      const joined = useAppStore.getState().addJoin(pingId, personParticipant(person, spot));
      if (!joined) {
        useAppStore.getState().markMissed(pingId, person.id);
        return;
      }

      void pushLocalNotification(`${person.name} wants to join!`, `${spot.name} — ${person.bio}`);

      const after = useAppStore.getState().pings[pingId];
      if (after && isFull(after)) {
        void pushLocalNotification(
          'That is everyone',
          `All ${after.spotsForOthers} spots at ${spot.name} are taken. Send the plan when you are ready.`,
        );
      }
    });
  });
}

/** After I say yes to someone else's ping, their app sends the plan out. */
export function scheduleHostPlan(pingId: string) {
  const key = `${pingId}-plan`;
  clearTimers(key);
  schedule(key, randomBetween(2600, 4200), () => {
    const ping = useAppStore.getState().pings[pingId];
    if (!ping || ping.status !== 'open') return;
    useAppStore.getState().lockPing(ping.id);
    const spot = SPOTS_BY_ID[ping.spotId];
    const host = PEOPLE_BY_ID[ping.hostId];
    if (spot && host) {
      void pushLocalNotification(
        'Where and when',
        `${host.name} set it: ${spot.name}, ${spot.meetingHint}`,
      );
    }
  });
}

function buildInboundPing(host: Person, spot: Spot, extras: Person[]): Ping {
  const joins = [
    personParticipant(host, spot),
    ...extras.map((person) => personParticipant(person, spot)),
  ];
  return {
    id: `inbound-${host.id}-${spot.id}`,
    hostId: host.id,
    spotId: spot.id,
    radiusKm: pick([2, 3, 4, 5]),
    createdAt: Date.now() - Math.round(randomBetween(1, 4)) * 60_000,
    notifiedIds: [ME, ...extras.map((person) => person.id)],
    passedIds: [],
    missedIds: [],
    // Their limit leaves at least one spot open when the invite lands.
    spotsForOthers: clampSpots(extras.length + pick([1, 1, 2, 3])),
    joins,
    status: 'open',
    myResponse: 'none',
    seen: false,
  };
}

function inboundCandidates(): { host: Person; spot: Spot; extras: Person[] }[] {
  const nearby = PEOPLE.filter((person) => distanceKm(HOME, person.location) <= 6);
  const hosts = [nearby[0], nearby[3], nearby[6]].filter((person): person is Person =>
    Boolean(person),
  );
  return hosts.map((host, index) => {
    const matching = SPOTS.filter((spot) => overlaps(host, spot));
    const spot = matching[index % Math.max(1, matching.length)] ?? SPOTS[index];
    const extras = nearby.filter((person) => person.id !== host.id).slice(index, index + 1);
    return { host, spot, extras };
  });
}

let inboundStarted = false;

/** Other people's pings arriving on my phone over the session. */
export function startInboundInvites() {
  if (inboundStarted) return;
  inboundStarted = true;

  const candidates = inboundCandidates();
  const delays = [2000, 75_000, 240_000];

  candidates.forEach((candidate, index) => {
    schedule('inbound', delays[index] ?? 300_000, () => {
      const ping = buildInboundPing(candidate.host, candidate.spot, candidate.extras);
      if (useAppStore.getState().pings[ping.id]) return;
      useAppStore.getState().addInboundPing(ping);
      void pushLocalNotification(
        `${candidate.host.name} is heading out`,
        `${candidate.spot.name} — tap if you want to join`,
      );
    });
  });
}
