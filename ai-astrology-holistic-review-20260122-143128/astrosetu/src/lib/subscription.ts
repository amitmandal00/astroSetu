/**
 * Subscription status utilities
 */

import { apiGet } from "./http";
import { session } from "./session";

export interface SubscriptionStatus {
  isActive: boolean;
  plan: "weekly" | "yearly" | null;
  period: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  daysRemaining: number;
}

/**
 * Check if user has active subscription
 */
export async function checkSubscriptionStatus(): Promise<SubscriptionStatus> {
  try {
    const user = session.getUser();
    if (!user) {
      return {
        isActive: false,
        plan: null,
        period: null,
        activatedAt: null,
        expiresAt: null,
        daysRemaining: 0,
      };
    }
    
    const res = await apiGet<{ ok: boolean; data?: SubscriptionStatus }>(
      `/api/subscriptions/status?userId=${user.id}`
    );
    
    if (res.ok && res.data) {
      return res.data;
    }
    
    return {
      isActive: false,
      plan: null,
      period: null,
      activatedAt: null,
      expiresAt: null,
      daysRemaining: 0,
    };
  } catch (error) {
    console.error("Failed to check subscription status:", error);
    return {
      isActive: false,
      plan: null,
      period: null,
      activatedAt: null,
      expiresAt: null,
      daysRemaining: 0,
    };
  }
}

/**
 * Check if feature requires subscription
 */
export function requiresSubscription(feature: string): boolean {
  const premiumFeatures = [
    "unlimited_kundli",
    "pdf_reports",
    "yearly_horoscope",
    "advanced_match",
    "priority_astrologer",
    "ai_insights",
  ];
  
  return premiumFeatures.includes(feature);
}
