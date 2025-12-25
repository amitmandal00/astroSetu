import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Button } from '../../components/ui/Button';
import { trackEvent, trackError } from '../../services/telemetry';
import { apiService } from '../../services/api';
import { checkSubscriptionStatus, type SubscriptionStatus } from '../../services/subscriptionService';
import { useAuth } from '../../context/AuthContext';

export function SubscriptionScreen() {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  async function loadSubscriptionStatus() {
    try {
      const status = await checkSubscriptionStatus(user?.id);
      setSubscription(status);
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  }

  const handleSubscribe = async (plan: 'weekly' | 'yearly') => {
    setLoading(true);
    try {
      trackEvent('subscription_cta_click', { plan, surface: 'mobile_subscription_screen' });
      
      // Create subscription order
      const res = await apiService.post<{ ok: boolean; data?: any; mock?: boolean; error?: string }>(
        '/subscriptions/create',
        {
          plan,
          countryCode: 'IN',
          userId: user?.id,
          userEmail: user?.email,
        },
      );
      
      if (!res.ok) {
        throw new Error(res.error || 'Failed to create subscription order');
      }
      
      // In dev, backend returns a mock order when Razorpay is not configured.
      Alert.alert(
        'Order created',
        'Payment flow stubbed. In production this will open Razorpay/App Store checkout.',
      );
      trackEvent('subscription_order_created_mobile', { plan, mock: (res as any).mock });
      
      // Reload subscription status
      await loadSubscriptionStatus();
    } catch (e) {
      trackError('subscription_order_mobile', e);
      Alert.alert('Payment Error', (e as any)?.message || 'Unable to start payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
    >
      <View style={[styles.hero, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>AstroSetu Plus</Text>
        <Text style={[styles.title, { color: colors.text }, typography.h2]}>
          Your personal AI astrologer
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Unlimited AI Q&amp;A on your Kundli, saved profiles, PDF exports and advanced predictions.
        </Text>

        <View style={styles.priceRow}>
          <Text style={[styles.pricePrimary, { color: colors.primary }]}>₹149 / week</Text>
          <Text style={[styles.priceSecondary, { color: colors.textSecondary }]}>or ₹999 / year</Text>
        </View>

        <View style={styles.bullets}>
          <Text style={[styles.bullet, { color: colors.text }]}>• Ask unlimited questions about career, marriage, health and more</Text>
          <Text style={[styles.bullet, { color: colors.text }]}>• Save unlimited Kundli profiles for family &amp; friends</Text>
          <Text style={[styles.bullet, { color: colors.text }]}>• Download detailed PDF reports</Text>
          <Text style={[styles.bullet, { color: colors.text }]}>• Early access to new features and remedies</Text>
        </View>

        {subscription?.isActive ? (
          <View style={[styles.activeBadge, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
            <Text style={[styles.activeText, { color: colors.success }]}>
              ✅ Active Subscription
            </Text>
            <Text style={[styles.activeDetails, { color: colors.textSecondary }]}>
              {subscription.plan} plan • {subscription.daysRemaining} days remaining
            </Text>
          </View>
        ) : (
          <>
            <Button
              title={loading ? "Processing..." : "Subscribe Weekly - ₹149/week"}
              onPress={() => handleSubscribe('weekly')}
              disabled={loading}
              fullWidth
              size="large"
              style={styles.ctaButton}
            />
            <Button
              title={loading ? "Processing..." : "Subscribe Yearly - ₹999/year"}
              onPress={() => handleSubscribe('yearly')}
              disabled={loading}
              fullWidth
              size="large"
              style={[styles.ctaButton, { marginTop: spacing.md }]}
            />
          </>
        )}
        <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
          {subscription?.isActive 
            ? "You have access to all premium features."
            : "Payments are stubbed in development. Connect Razorpay / App Store billing before production release."}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  activeBadge: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
    alignItems: 'center',
  },
  activeText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  activeDetails: {
    fontSize: 14,
  },
  hero: {
    padding: 24,
    marginTop: 16,
  },
  eyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  pricePrimary: {
    fontSize: 20,
    fontWeight: '700',
  },
  priceSecondary: {
    fontSize: 14,
  },
  bullets: {
    marginTop: 8,
    marginBottom: 16,
    gap: 4,
  },
  bullet: {
    fontSize: 14,
  },
  ctaButton: {
    marginTop: 4,
    marginBottom: 8,
  },
  disclaimer: {
    fontSize: 11,
  },
});

