import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Button } from '../../components/ui/Button';
import { useNavigation } from '@react-navigation/native';

export function OnboardingTrustScreen() {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>Accuracy & Trust</Text>
        <Text style={[styles.title, { color: colors.text }]}>How AstroSetu calculates your Kundli</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Aligned with AstroSage</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            • Ayanamsa: Lahiri (same default as AstroSage){'\n'}
            • Ephemeris: Prokerala API when configured, with safe local fallback for offline mode{'\n'}
            • Rahu/Ketu: Mean node model, standard in Vedic astrology
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your birth place</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            We resolve your town into precise coordinates and timezone, so ascendant and planetary
            degrees stay consistent across devices.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Explainable astrology</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            Every prediction is backed by chart factors (planets, houses, dashas). Our goal is to
            make it clear <Text style={{ fontWeight: '700' }}>why</Text> a prediction is shown—not just what it is.
          </Text>
        </View>

        <Button
          title="Continue"
          onPress={() => navigation.navigate('OnboardingGoals' as never)}
          fullWidth
          size="large"
          style={styles.primaryButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    padding: 24,
    marginTop: 32,
  },
  eyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 24,
  },
});

