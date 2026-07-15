import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { usePremiumStore } from '@/store';

export type MembershipPlan = 'monthly' | 'yearly';

/** Presentation-independent purchase boundary ready for a RevenueCat adapter. */
export function useMembershipPurchase() {
  const purchase = usePremiumStore((s) => s.purchase);
  const restorePurchase = usePremiumStore((s) => s.restore);

  const subscribe = (plan: MembershipPlan) => {
    purchase(plan);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return { subscribe, restore: restorePurchase };
}
