import { useEffect } from 'react';

import { ensureNotificationPermission } from '@/lib/notifications';
import { startInboundInvites } from '@/lib/simulation';
import { useAppStore } from '@/lib/store';

/**
 * Wires up the session: nearby people start pinging you, and notification
 * permission is requested once you have asked for alerts.
 */
export function useSession(): void {
  const openToPings = useAppStore((state) => state.profile.openToPings);
  const notificationsEnabled = useAppStore((state) => state.profile.notificationsEnabled);

  useEffect(() => {
    if (openToPings) startInboundInvites();
  }, [openToPings]);

  useEffect(() => {
    if (notificationsEnabled) void ensureNotificationPermission();
  }, [notificationsEnabled]);
}
