import { useLogStore } from './useLogStore';
import { usePremiumStore } from './usePremiumStore';
import { useUserStore } from './useUserStore';

export { useLogStore, usePremiumStore, useUserStore };

/** Wipes every persisted store — used by Settings "Delete all data". */
export function resetAllData(): void {
  useUserStore.getState().reset();
  useLogStore.getState().reset();
  usePremiumStore.getState().reset();
}
