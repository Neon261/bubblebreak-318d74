import type { Coordinate, Participant, ReadyMinutes, TravelMode } from '@/lib/types';

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function distanceKm(a: Coordinate, b: Coordinate): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

const TRAVEL: Record<TravelMode, { speedKmh: number; overhead: number; label: string }> = {
  walk: { speedKmh: 4.6, overhead: 0, label: 'on foot' },
  bike: { speedKmh: 15, overhead: 2, label: 'by bike' },
  transit: { speedKmh: 17, overhead: 6, label: 'by transit' },
  car: { speedKmh: 24, overhead: 4, label: 'by car' },
};

export const TRAVEL_MODES: TravelMode[] = ['walk', 'bike', 'transit', 'car'];

export function travelModeLabel(mode: TravelMode): string {
  return TRAVEL[mode].label;
}

export function travelMinutes(km: number, mode: TravelMode): number {
  const { speedKmh, overhead } = TRAVEL[mode];
  return Math.max(2, Math.round((km / speedKmh) * 60) + overhead);
}

export const READY_OPTIONS: ReadyMinutes[] = [15, 30, 45, 60];

export function etaMinutes(participant: Participant): number {
  return participant.readyMinutes + participant.travelMinutes;
}

/** The plan waits for the slowest person, plus a small buffer, rounded to 5 minutes. */
export function computeMeetAt(participants: Participant[], from = Date.now()): number {
  const slowest = participants.reduce((max, p) => Math.max(max, etaMinutes(p)), 0);
  const withBuffer = slowest + 5;
  const rounded = Math.ceil(withBuffer / 5) * 5;
  return from + rounded * 60_000;
}

export function minutesUntil(timestamp: number, from = Date.now()): number {
  return Math.round((timestamp - from) / 60_000);
}

export function formatClock(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'now';
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const seconds = Math.floor((ms % 60_000) / 1000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (totalMinutes > 0) return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
  return `${seconds}s`;
}

export function formatRelative(timestamp: number, from = Date.now()): string {
  const diff = Math.round((from - timestamp) / 60_000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff} min ago`;
  const hours = Math.round(diff / 60);
  return `${hours} h ago`;
}
