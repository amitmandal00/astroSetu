/**
 * Subscription service for mobile app
 * Checks subscription status from API
 */

import { apiService } from './api';
import { API_BASE_URL } from '../constants/config';

export interface SubscriptionStatus {
  isActive: boolean;
  plan: 'weekly' | 'yearly' | null;
  period: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  daysRemaining: number;
}

/**
 * Check subscription status
 */
export async function checkSubscriptionStatus(userId?: string): Promise<SubscriptionStatus> {
  try {
    const url = userId 
      ? `${API_BASE_URL.replace(/\/$/, '')}/subscriptions/status?userId=${userId}`
      : `${API_BASE_URL.replace(/\/$/, '')}/subscriptions/status`;
    
    const res = await apiService.get<{ ok: boolean; data?: SubscriptionStatus; error?: string }>(url);
    
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
    console.error('Failed to check subscription status:', error);
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
    'unlimited_kundli',
    'pdf_reports',
    'yearly_horoscope',
    'advanced_match',
    'priority_astrologer',
    'ai_insights',
  ];
  
  return premiumFeatures.includes(feature);
}
