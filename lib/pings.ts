import type { Href } from 'expo-router';

import { computeMeetAt, etaMinutes } from '@/lib/geo';
import { PEOPLE_BY_ID, SPOTS_BY_ID } from '@/lib/mockData';
import { ME, type Participant, type Ping, type Spot } from '@/lib/types';

/** Pings in newest-first order, skipping ids that are no longer around. */
export function pingList(pings: Record<string, Ping>, ids: string[]): Ping[] {
  return ids.map((id) => pings[id]).filter((ping): ping is Ping => Boolean(ping));
}

export function isHostedByMe(ping: Ping): boolean {
  return ping.hostId === ME;
}

export function myJoin(ping: Ping): Participant | undefined {
  return ping.joins.find((join) => join.personId === ME);
}

export function pingSpot(ping: Ping): Spot | undefined {
  return SPOTS_BY_ID[ping.spotId];
}

export function hostName(ping: Ping, myName: string): string {
  return ping.hostId === ME ? myName : (PEOPLE_BY_ID[ping.hostId]?.name ?? 'Someone nearby');
}

export function participantName(participant: Participant, myName: string): string {
  return participant.personId === ME
    ? myName
    : (PEOPLE_BY_ID[participant.personId]?.name ?? 'Someone');
}

export function participantColorClass(participant: Participant): string {
  return participant.personId === ME
    ? 'bg-accent'
    : (PEOPLE_BY_ID[participant.personId]?.colorClass ?? 'bg-sky');
}

/** The person the meeting time has to wait for. */
export function slowestJoin(ping: Ping): Participant | undefined {
  return ping.joins.reduce<Participant | undefined>(
    (slowest, join) => (!slowest || etaMinutes(join) > etaMinutes(slowest) ? join : slowest),
    undefined,
  );
}

/** Locked pings carry a real time; open ones show what the time would be right now. */
export function previewMeetAt(ping: Ping): number {
  return ping.meetAt ?? computeMeetAt(ping.joins);
}

export function needsMyAnswer(ping: Ping): boolean {
  return ping.hostId !== ME && ping.myResponse === 'none' && ping.status === 'open';
}

export function isSettled(ping: Ping): boolean {
  return ping.status === 'locked' && ping.meetAt !== undefined;
}

export function isWaiting(ping: Ping): boolean {
  return ping.status === 'open' && ping.myResponse === 'joined';
}

export function isOver(ping: Ping, now = Date.now()): boolean {
  if (ping.status === 'cancelled' || ping.status === 'declined') return true;
  return ping.meetAt !== undefined && ping.meetAt + 90 * 60_000 < now;
}

/** Where tapping a ping should take you, based on your role and its state. */
export function pingRoute(ping: Ping): Href {
  if (needsMyAnswer(ping)) {
    return { pathname: '/invite/[id]', params: { id: ping.id } };
  }
  if (isHostedByMe(ping) && ping.status === 'open') {
    return { pathname: '/ping/[id]', params: { id: ping.id } };
  }
  return { pathname: '/plan/[id]', params: { id: ping.id } };
}
