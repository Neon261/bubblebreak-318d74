import { useSyncExternalStore } from 'react';

import { useAppStore } from '@/lib/store';

/**
 * True once the saved profile has been read back from storage. The registration
 * gate waits for this so a registered person never flashes the sign-up flow.
 */
export function useStoreHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => useAppStore.persist.onFinishHydration(onStoreChange),
    () => useAppStore.persist.hasHydrated(),
  );
}
