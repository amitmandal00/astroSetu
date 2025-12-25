import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');

export function HomeScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;

  const features = [
    {
      id: 'kundli',
      title: 'Generate Kundli',
      icon: 'auto-awesome',
      color: colors.primary,
      route: 'Kundli',
    },
    {
      id: 'match',
      title: 'Match Kundli',
      icon: 'favorite',
      color: colors.error,
      route: 'Match',
    },
    {
      id: 'horoscope',
      title: 'Horoscope',
      icon: 'calendar-today',
      color: colors.secondary,
      route: 'Horoscope',
    },
    {
      id: 'panchang',
      title: 'Panchang',
      icon: 'event',
      color: colors.info,
      route: 'Panchang',
    },
    {
      id: 'numerology',
      title: 'Numerology',
      icon: 'calculate',
      color: colors.purple,
      route: 'Numerology',
    },
    {
      id: 'astrologers',
      title: 'Astrologers',
      icon: 'people',
      color: colors.accent,
      route: 'Astrologers',
    },
  ];

  const quickActions = [
    { id: 'daily', title: 'Daily Horoscope', icon: 'wb-sunny' },
    { id: 'remedies', title: 'Remedies', icon: 'spa' },
    { id: 'reports', title: 'Reports', icon: 'description' },
    { id: 'puja', title: 'Online Puja', icon: 'temple-hindu' },
  ];

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Enhanced Hero Section */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark, colors.accent]}
          style={styles.hero}
        >
          <Animated.View style={[styles.heroContent, { opacity: headerOpacity }]}>
            <View style={styles.logoContainer}>
              <View style={[styles.logoCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.logoText}>ॐ</Text>
              </View>
            </View>
            <Text style={[styles.heroTitle, { color: colors.surface }]}>
              AstroSetu
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.surface }]}>
              Bridging humans with cosmic guidance
            </Text>
            <View style={styles.heroBadges}>
              <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                <Text style={[styles.badgeText, { color: colors.surface }]}>🔮 Premium</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                <Text style={[styles.badgeText, { color: colors.surface }]}>✨ AI Powered</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                <Text style={[styles.badgeText, { color: colors.surface }]}>🇮🇳 Made for India</Text>
              </View>
            </View>
          </Animated.View>
          <View style={styles.heroPattern}>
            <Text style={styles.patternSymbol}>🕉️</Text>
          </View>
        </LinearGradient>

        {/* Enhanced Features Grid */}
        <View style={[styles.section, { padding: spacing.md }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }, typography.h2]}>
              Astrology Tools
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }, typography.caption]}>
              Complete suite of Vedic astrology services
            </Text>
          </View>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Card
                key={feature.id}
                onPress={() => navigation.navigate(feature.route as never)}
                style={styles.featureCard}
                elevated
              >
                <View
                  style={[
                    styles.featureIconContainer,
                    {
                      backgroundColor: `${feature.color}15`,
                      borderRadius: borderRadius.full,
                      width: 64,
                      height: 64,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: spacing.sm,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[feature.color, `${feature.color}CC`]}
                    style={[styles.featureIconGradient, { borderRadius: borderRadius.full }]}
                  >
                    <Icon name={feature.icon} size={32} color={colors.surface} />
                  </LinearGradient>
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }, typography.bodyBold]}>
                  {feature.title}
                </Text>
                <View style={styles.featureArrow}>
                  <Icon name="arrow-forward" size={16} color={feature.color} />
                </View>
              </Card>
            ))}
          </View>
        </View>

        {/* Enhanced Quick Actions */}
        <View style={[styles.section, { padding: spacing.md }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }, typography.h2]}>
              Quick Actions
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContainer}
          >
            {quickActions.map((action) => (
              <Card
                key={action.id}
                style={styles.quickActionCard}
                elevated
              >
                <View
                  style={[
                    styles.quickActionIconContainer,
                    {
                      backgroundColor: `${colors.primary}15`,
                      borderRadius: borderRadius.full,
                      width: 56,
                      height: 56,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: spacing.sm,
                    },
                  ]}
                >
                  <Icon name={action.icon} size={28} color={colors.primary} />
                </View>
                <Text style={[styles.quickActionTitle, { color: colors.text }, typography.caption]}>
                  {action.title}
                </Text>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Enhanced Trust Indicators */}
        <View style={[styles.section, { padding: spacing.md, paddingBottom: spacing.xl }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }, typography.h2, { marginBottom: spacing.md }]}>
            Trusted by Millions
          </Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard} elevated>
              <View style={styles.statIconContainer}>
                <Icon name="people" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.primary }, typography.h2]}>10K+</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }, typography.caption]}>
                Happy Users
              </Text>
            </Card>
            <Card style={styles.statCard} elevated>
              <View style={styles.statIconContainer}>
                <Icon name="verified" size={24} color={colors.secondary} />
              </View>
              <Text style={[styles.statValue, { color: colors.secondary }, typography.h2]}>500+</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }, typography.caption]}>
                Astrologers
              </Text>
            </Card>
            <Card style={styles.statCard} elevated>
              <View style={styles.statIconContainer}>
                <Icon name="star" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.primary }, typography.h2]}>4.8★</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }, typography.caption]}>
                Rating
              </Text>
            </Card>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 280,
  },
  heroContent: {
    zIndex: 1,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoText: {
    fontSize: 40,
    color: '#FFFFFF',
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    opacity: 0.95,
    marginBottom: 20,
    textAlign: 'center',
  },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroPattern: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.15,
  },
  patternSymbol: {
    fontSize: 100,
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 4,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 48) / 2 - 8,
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
    position: 'relative',
  },
  featureIconContainer: {
    marginBottom: 12,
  },
  featureIconGradient: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    textAlign: 'center',
    fontSize: 15,
    marginTop: 4,
  },
  featureArrow: {
    position: 'absolute',
    top: 12,
    right: 12,
    opacity: 0.6,
  },
  quickActionsContainer: {
    paddingRight: 16,
  },
  quickActionCard: {
    width: 110,
    alignItems: 'center',
    padding: 16,
    marginRight: 12,
  },
  quickActionIconContainer: {
    marginBottom: 8,
  },
  quickActionTitle: {
    textAlign: 'center',
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    marginBottom: 6,
    fontWeight: '700',
  },
  statLabel: {
    textAlign: 'center',
    fontSize: 12,
  },
});

