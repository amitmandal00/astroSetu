import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { Button } from '../../components/ui/Button';
import { useNavigation } from '@react-navigation/native';

export function OnboardingIntroScreen() {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.container}
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={[styles.om, { color: colors.surface }]}>ॐ</Text>
          <Text style={[styles.title, { color: colors.surface }]}>AstroSetu</Text>
          <Text style={[styles.subtitle, { color: colors.surface }]}>
            Bridging humans with cosmic guidance
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
          <Text style={[styles.cardTitle]}>Start your cosmic journey</Text>
          <Text style={styles.cardText}>
            In less than a minute, we&apos;ll generate your Kundli and show ascendant, Moon sign,
            Nakshatra and current Mahadasha—similar to trusted apps like AstroSage.
          </Text>

          <Button
            title="Enter Birth Details"
            onPress={() => navigation.navigate('Kundli' as never)}
            fullWidth
            size="large"
            style={styles.primaryButton}
          />
          <Button
            title="I already have an account"
            onPress={() => navigation.navigate('Login' as never)}
            variant="outline"
            fullWidth
            size="medium"
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    marginTop: 40,
  },
  om: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  card: {
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 20,
  },
  primaryButton: {
    marginBottom: 12,
  },
});

