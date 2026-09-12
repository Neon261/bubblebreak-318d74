import { Platform } from 'react-native';

let requested = false;
let granted = false;

type NotificationsModule = typeof import('expo-notifications');

let modulePromise: Promise<NotificationsModule | null> | null = null;

function loadModule(): Promise<NotificationsModule | null> {
  if (Platform.OS === 'web') return Promise.resolve(null);
  modulePromise ??= import('expo-notifications')
    .then((mod) => {
      mod.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      return mod;
    })
    .catch(() => null);
  return modulePromise;
}

/** Ask once for permission to buzz the phone. Returns whether we may. */
export async function ensureNotificationPermission(): Promise<boolean> {
  const mod = await loadModule();
  if (!mod) return false;
  if (requested) return granted;
  requested = true;
  try {
    const current = await mod.getPermissionsAsync();
    granted = current.granted;
    if (!granted && current.canAskAgain) {
      const next = await mod.requestPermissionsAsync();
      granted = next.granted;
    }
  } catch {
    granted = false;
  }
  return granted;
}

/** Fire a local notification. Silently does nothing on web or without permission. */
export async function pushLocalNotification(title: string, body: string): Promise<void> {
  const mod = await loadModule();
  if (!mod) return;
  if (!(await ensureNotificationPermission())) return;
  try {
    await mod.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  } catch {
    // Notifications are a nice-to-have; never break the flow over them.
  }
}
