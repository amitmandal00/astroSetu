import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { notificationService } from '../../services/notificationService';
import { accuracyService } from '../../services/accuracyService';

export function SettingsScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [dailyHoroscopeEnabled, setDailyHoroscopeEnabled] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);

  useEffect(() => {
    checkAPIConfiguration();
    checkNotificationPermissions();
  }, []);

  const checkAPIConfiguration = async () => {
    const config = await accuracyService.verifyAPIConfiguration();
    setApiConfigured(config.configured || false);
  };

  const checkNotificationPermissions = async () => {
    const permissions = await notificationService.requestPermissions();
    setNotificationsEnabled(permissions.alert || false);
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const permissions = await notificationService.requestPermissions();
      if (permissions.alert) {
        setNotificationsEnabled(true);
        if (dailyHoroscopeEnabled) {
          notificationService.scheduleDailyHoroscope();
        }
      } else {
        Alert.alert('Permission Required', 'Please enable notifications in device settings');
      }
    } else {
      notificationService.cancelAll();
      setNotificationsEnabled(false);
      setDailyHoroscopeEnabled(false);
    }
  };

  const handleDailyHoroscopeToggle = (value: boolean) => {
    setDailyHoroscopeEnabled(value);
    if (value && notificationsEnabled) {
      notificationService.scheduleDailyHoroscope();
    } else {
      notificationService.cancelNotification('daily_horoscope');
    }
  };

  const settingsItems = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      description: 'Receive notifications about horoscopes and updates',
      icon: 'notifications',
      value: notificationsEnabled,
      onToggle: handleNotificationToggle,
    },
    {
      id: 'daily-horoscope',
      title: 'Daily Horoscope Reminder',
      description: 'Get daily horoscope notifications at 8:00 AM',
      icon: 'wb-sunny',
      value: dailyHoroscopeEnabled,
      onToggle: handleDailyHoroscopeToggle,
      disabled: !notificationsEnabled,
    },
    {
      id: 'accuracy',
      title: 'Calculation Accuracy',
      description: apiConfigured ? 'API configured for accurate calculations' : 'Configure API for accurate calculations',
      icon: 'verified',
      value: apiConfigured,
      onPress: () => {
        Alert.alert(
          'API Configuration',
          apiConfigured
            ? 'Prokerala API is configured. Calculations are accurate.'
            : 'Please configure Prokerala API credentials in backend for accurate calculations.'
        );
      },
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.surface }]}>
            Settings
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.surface }]}>
            Manage your app preferences
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Notification Settings */}
        <Card style={styles.sectionCard} elevated>
          <Text style={[styles.sectionTitle, { color: colors.text }, typography.h3]}>
            Notifications
          </Text>
          {settingsItems
            .filter(item => item.id === 'notifications' || item.id === 'daily-horoscope')
            .map((item) => (
              <View key={item.id} style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View
                    style={[
                      styles.settingIcon,
                      { backgroundColor: `${colors.primary}15` },
                    ]}
                  >
                    <Icon name={item.icon} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: colors.text }, typography.bodyBold]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                      {item.description}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  disabled={item.disabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.surface}
                />
              </View>
            ))}
        </Card>

        {/* Accuracy Settings */}
        <Card style={styles.sectionCard} elevated>
          <Text style={[styles.sectionTitle, { color: colors.text }, typography.h3]}>
            Calculation Accuracy
          </Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={settingsItems.find(item => item.id === 'accuracy')?.onPress}
          >
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor: apiConfigured
                      ? `${colors.success}15`
                      : `${colors.warning}15`,
                  },
                ]}
              >
                <Icon
                  name="verified"
                  size={24}
                  color={apiConfigured ? colors.success : colors.warning}
                />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }, typography.bodyBold]}>
                  API Configuration
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {apiConfigured
                    ? 'Prokerala API configured. Calculations are accurate.'
                    : 'Configure Prokerala API for accurate calculations.'}
                </Text>
              </View>
            </View>
            <Icon
              name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </Card>

        {/* App Info */}
        <Card style={styles.sectionCard} elevated>
          <Text style={[styles.sectionTitle, { color: colors.text }, typography.h3]}>
            About
          </Text>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>App Version</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>1.0.0</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Build</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>2025.01</Text>
          </View>
          <TouchableOpacity
            style={[styles.infoItem, { borderBottomWidth: 0 }]}
            onPress={() => Alert.alert(
              'Privacy & Data Use',
              'AstroSetu explains how your birth data and AI processing are used in a dedicated privacy screen in the web app. Mobile privacy copy can mirror that content for app store review.'
            )}
          >
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Privacy & Data Use</Text>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>
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
  sectionCard: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '700',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

