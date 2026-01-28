import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Button } from '../../components/ui/Button';
import { useNavigation } from '@react-navigation/native';

const GOALS = [
  { id: 'marriage', label: 'Marriage & relationships', icon: 'favorite' },
  { id: 'career', label: 'Career & promotions', icon: 'work' },
  { id: 'finance', label: 'Money & investments', icon: 'trending-up' },
  { id: 'health', label: 'Health & wellbeing', icon: 'favorite-border' },
  { id: 'spiritual', label: 'Spiritual growth', icon: 'self-improvement' },
];

export function OnboardingGoalsScreen() {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const navigation = useNavigation();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
    >
      <Text style={[styles.title, { color: colors.text }, typography.h2]}>
        What do you want guidance on?
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        We&apos;ll tune insights towards your current priorities. You can change this anytime in
        Settings.
      </Text>

      <View style={styles.grid}>
        {GOALS.map((goal) => {
          const active = selectedGoals.includes(goal.id);
          return (
            <TouchableOpacity
              key={goal.id}
              activeOpacity={0.85}
              onPress={() => toggleGoal(goal.id)}
              style={[
                styles.goalCard,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? `${colors.primary}10` : colors.surface,
                  shadowOpacity: active ? 0.12 : 0.04,
                },
              ]}
            >
              <Text style={[styles.goalIcon, { color: colors.primary }]}>★</Text>
              <Text style={[styles.goalLabel, { color: colors.text }]}>{goal.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button
        title="Continue to app"
        onPress={() => navigation.navigate('Login' as never)}
        fullWidth
        size="large"
        style={styles.primaryButton}
        disabled={selectedGoals.length === 0}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  goalCard: {
    width: '48%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  goalIcon: {
    fontSize: 18,
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 8,
  },
});

