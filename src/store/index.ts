import { useLogStore } from './useLogStore';
import { usePremiumStore } from './usePremiumStore';
import { useThemeStore } from './themeStore';
import { useUserStore } from './useUserStore';

export { useLogStore, usePremiumStore, useThemeStore, useUserStore };

/** Wipes every persisted store — used by Settings "Delete all data". */
export function resetAllData(): void {
  useUserStore.getState().reset();
  useLogStore.getState().reset();
  usePremiumStore.getState().reset();
  useThemeStore.getState().reset();
}
