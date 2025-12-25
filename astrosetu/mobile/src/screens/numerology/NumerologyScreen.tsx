import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function NumerologyScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [numerologyData, setNumerologyData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setNumerologyData({
        lifePathNumber: 7,
        destinyNumber: 5,
        soulNumber: 3,
        personalityNumber: 4,
        compatibility: 'Good',
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={[styles.headerIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Icon name="calculate" size={32} color={colors.surface} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.surface }]}>
            Numerology
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.surface }]}>
            Discover your numbers and their meanings
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Form */}
        <Card style={styles.formCard} elevated>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            leftIcon="person"
            containerStyle={styles.inputSpacing}
          />
          <Input
            label="Date of Birth"
            placeholder="YYYY-MM-DD"
            value={dob}
            onChangeText={setDob}
            leftIcon="calendar-today"
            keyboardType="numeric"
            containerStyle={styles.inputSpacing}
          />
          <Button
            title="Calculate Numbers"
            onPress={handleCalculate}
            loading={loading}
            disabled={loading}
            icon="calculate"
            iconPosition="left"
            fullWidth
            size="large"
            style={styles.calculateButton}
          />
        </Card>

        {/* Numerology Results */}
        {numerologyData && (
          <Card style={styles.resultCard} elevated>
            <Text style={[styles.resultTitle, { color: colors.text }, typography.h3]}>
              Your Numbers
            </Text>
            <View style={styles.numbersGrid}>
              <View style={[styles.numberCard, { backgroundColor: `${colors.primary}15`, borderRadius: borderRadius.md }]}>
                <Text style={[styles.numberValue, { color: colors.primary }, typography.h2]}>
                  {numerologyData.lifePathNumber}
                </Text>
                <Text style={[styles.numberLabel, { color: colors.textSecondary }]}>
                  Life Path
                </Text>
              </View>
              <View style={[styles.numberCard, { backgroundColor: `${colors.secondary}15`, borderRadius: borderRadius.md }]}>
                <Text style={[styles.numberValue, { color: colors.secondary }, typography.h2]}>
                  {numerologyData.destinyNumber}
                </Text>
                <Text style={[styles.numberLabel, { color: colors.textSecondary }]}>
                  Destiny
                </Text>
              </View>
              <View style={[styles.numberCard, { backgroundColor: `${colors.purple}15`, borderRadius: borderRadius.md }]}>
                <Text style={[styles.numberValue, { color: colors.purple }, typography.h2]}>
                  {numerologyData.soulNumber}
                </Text>
                <Text style={[styles.numberLabel, { color: colors.textSecondary }]}>
                  Soul
                </Text>
              </View>
              <View style={[styles.numberCard, { backgroundColor: `${colors.info}15`, borderRadius: borderRadius.md }]}>
                <Text style={[styles.numberValue, { color: colors.info }, typography.h2]}>
                  {numerologyData.personalityNumber}
                </Text>
                <Text style={[styles.numberLabel, { color: colors.textSecondary }]}>
                  Personality
                </Text>
              </View>
            </View>
            <View style={[styles.compatibilityCard, { backgroundColor: colors.background, borderRadius: borderRadius.md }]}>
              <Icon name="favorite" size={24} color={colors.success} />
              <View style={styles.compatibilityInfo}>
                <Text style={[styles.compatibilityLabel, { color: colors.textSecondary }]}>
                  Compatibility
                </Text>
                <Text style={[styles.compatibilityValue, { color: colors.text }, typography.bodyBold]}>
                  {numerologyData.compatibility}
                </Text>
              </View>
            </View>
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
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
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
  formCard: {
    padding: 24,
    marginBottom: 20,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  calculateButton: {
    marginTop: 8,
  },
  resultCard: {
    padding: 24,
  },
  resultTitle: {
    marginBottom: 20,
    fontWeight: '700',
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  numberCard: {
    width: '47%',
    padding: 20,
    alignItems: 'center',
  },
  numberValue: {
    marginBottom: 8,
    fontWeight: '700',
  },
  numberLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  compatibilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  compatibilityInfo: {
    flex: 1,
  },
  compatibilityLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  compatibilityValue: {
    fontSize: 16,
  },
});
