import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');

const zodiacSigns = [
  { id: 'aries', name: 'Aries', symbol: '♈', color: '#EF4444' },
  { id: 'taurus', name: 'Taurus', symbol: '♉', color: '#F59E0B' },
  { id: 'gemini', name: 'Gemini', symbol: '♊', color: '#10B981' },
  { id: 'cancer', name: 'Cancer', symbol: '♋', color: '#3B82F6' },
  { id: 'leo', name: 'Leo', symbol: '♌', color: '#F97316' },
  { id: 'virgo', name: 'Virgo', symbol: '♍', color: '#8B5CF6' },
  { id: 'libra', name: 'Libra', symbol: '♎', color: '#EC4899' },
  { id: 'scorpio', name: 'Scorpio', symbol: '♏', color: '#DC2626' },
  { id: 'sagittarius', name: 'Sagittarius', symbol: '♐', color: '#F59E0B' },
  { id: 'capricorn', name: 'Capricorn', symbol: '♑', color: '#6366F1' },
  { id: 'aquarius', name: 'Aquarius', symbol: '♒', color: '#06B6D4' },
  { id: 'pisces', name: 'Pisces', symbol: '♓', color: '#3B82F6' },
];

const horoscopeTypes = [
  { id: 'daily', title: 'Daily', icon: 'today' },
  { id: 'weekly', title: 'Weekly', icon: 'date-range' },
  { id: 'monthly', title: 'Monthly', icon: 'calendar-month' },
  { id: 'yearly', title: 'Yearly', icon: 'event' },
];

export function HoroscopeScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('daily');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.surface }]}>
            Horoscope
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.surface }]}>
            Get personalized predictions for your zodiac sign
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Horoscope Type Selector */}
        <View style={styles.typeSelector}>
          {horoscopeTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                {
                  backgroundColor: selectedType === type.id ? colors.primary : colors.surface,
                  borderRadius: borderRadius.md,
                },
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Icon
                name={type.icon}
                size={20}
                color={selectedType === type.id ? colors.surface : colors.textSecondary}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  {
                    color: selectedType === type.id ? colors.surface : colors.text,
                  },
                ]}
              >
                {type.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Zodiac Signs Grid */}
        <View style={styles.signsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }, typography.h3]}>
            Select Your Zodiac Sign
          </Text>
          <View style={styles.signsGrid}>
            {zodiacSigns.map((sign) => (
              <TouchableOpacity
                key={sign.id}
                style={[
                  styles.signCard,
                  {
                    backgroundColor: selectedSign === sign.id ? `${sign.color}20` : colors.surface,
                    borderColor: selectedSign === sign.id ? sign.color : colors.border,
                    borderWidth: selectedSign === sign.id ? 2 : 1,
                    borderRadius: borderRadius.lg,
                  },
                ]}
                onPress={() => setSelectedSign(sign.id)}
              >
                <Text style={[styles.signSymbol, { color: sign.color }]}>{sign.symbol}</Text>
                <Text style={[styles.signName, { color: colors.text }]}>{sign.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Horoscope Content */}
        {selectedSign && (
          <Card style={styles.horoscopeCard} elevated>
            <View style={styles.horoscopeHeader}>
              <Text style={[styles.horoscopeTitle, { color: colors.text }, typography.h2]}>
                {horoscopeTypes.find(t => t.id === selectedType)?.title} Horoscope
              </Text>
              <Text style={[styles.horoscopeSign, { color: colors.primary }]}>
                {zodiacSigns.find(s => s.id === selectedSign)?.name}
              </Text>
            </View>
            <View style={styles.horoscopeContent}>
              <Text style={[styles.horoscopeText, { color: colors.text }]}>
                Your {horoscopeTypes.find(t => t.id === selectedType)?.title.toLowerCase()} horoscope will appear here.
                Connect to the backend API to fetch real predictions.
              </Text>
            </View>
            <Button
              title="Get Full Report"
              onPress={() => {}}
              style={styles.getReportButton}
            />
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  signsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '700',
  },
  signsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  signCard: {
    width: (width - 48) / 3 - 8,
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  signSymbol: {
    fontSize: 32,
    marginBottom: 8,
  },
  signName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  horoscopeCard: {
    padding: 24,
  },
  horoscopeHeader: {
    marginBottom: 20,
  },
  horoscopeTitle: {
    marginBottom: 4,
  },
  horoscopeSign: {
    fontSize: 18,
    fontWeight: '600',
  },
  horoscopeContent: {
    marginBottom: 20,
  },
  horoscopeText: {
    fontSize: 15,
    lineHeight: 24,
  },
  getReportButton: {
    marginTop: 8,
  },
});
