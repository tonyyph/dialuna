import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { UserProfile } from '@/types';

interface UserStore {
  profile: UserProfile | null;
  hasOnboarded: boolean;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  signOut: () => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      profile: null,
      hasOnboarded: false,
      setProfile: (profile) => set({ profile }),
      updateProfile: (patch) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...patch } : state.profile,
        })),
      completeOnboarding: () => set({ hasOnboarded: true }),
      signOut: () => set({ hasOnboarded: false }),
      reset: () => set({ profile: null, hasOnboarded: false }),
    }),
    {
      name: 'dialuna.user',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
