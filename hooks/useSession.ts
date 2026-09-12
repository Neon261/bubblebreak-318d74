import { useEffect } from 'react';

import { ensureNotificationPermission } from '@/lib/notifications';
import { startInboundInvites } from '@/lib/simulation';
import { useAppStore } from '@/lib/store';

/**
 * Wires up the session: once registration is done, nearby people start pinging
 * you, and notification permission is requested when you have asked for alerts.
 */
export function useSession(): void {
  const registered = useAppStore((state) => state.profile.registeredAt !== undefined);
  const openToPings = useAppStore((state) => state.profile.openToPings);
  const notificationsEnabled = useAppStore((state) => state.profile.notificationsEnabled);

  useEffect(() => {
    if (registered && openToPings) startInboundInvites();
  }, [registered, openToPings]);

  useEffect(() => {
    if (notificationsEnabled) void ensureNotificationPermission();
  }, [notificationsEnabled]);
}
