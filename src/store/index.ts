import { useLogStore } from './useLogStore';
import { usePremiumStore } from './usePremiumStore';
import { useSettingsStore } from './useSettingsStore';
import { useUserStore } from './useUserStore';

export { useLogStore, usePremiumStore, useSettingsStore, useUserStore };
export type { AppTheme, Units } from './useSettingsStore';

/** Wipes every persisted store — used by Settings "Delete all data". */
export function resetAllData(): void {
  useUserStore.getState().reset();
  useLogStore.getState().reset();
  usePremiumStore.getState().reset();
  useSettingsStore.getState().reset();
}
