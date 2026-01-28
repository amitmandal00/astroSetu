import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function PanchangScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [place, setPlace] = useState('');
  const [panchangData, setPanchangData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGetPanchang = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPanchangData({
        tithi: 'Shukla Paksha, Dwitiya',
        nakshatra: 'Rohini',
        yoga: 'Vajra',
        karana: 'Bava',
        sunrise: '06:15 AM',
        sunset: '06:45 PM',
        moonrise: '08:30 AM',
        moonset: '09:15 PM',
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
            <Icon name="event" size={32} color={colors.surface} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.surface }]}>
            Panchang
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.surface }]}>
            Daily Hindu calendar and auspicious timings
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
            label="Date"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
            leftIcon="calendar-today"
            containerStyle={styles.inputSpacing}
          />
          <Input
            label="Place"
            placeholder="Enter place name"
            value={place}
            onChangeText={setPlace}
            leftIcon="location-on"
            containerStyle={styles.inputSpacing}
          />
          <Button
            title="Get Panchang"
            onPress={handleGetPanchang}
            loading={loading}
            disabled={loading}
            fullWidth
            size="large"
            style={styles.getButton}
          />
        </Card>

        {/* Panchang Data */}
        {panchangData && (
          <Card style={styles.dataCard} elevated>
            <Text style={[styles.dataTitle, { color: colors.text }, typography.h3]}>
              Panchang Details
            </Text>
            <View style={styles.dataGrid}>
              <View style={[styles.dataItem, { backgroundColor: colors.background, borderRadius: borderRadius.md }]}>
                <Icon name="brightness-2" size={24} color={colors.primary} />
                <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>Tithi</Text>
                <Text style={[styles.dataValue, { color: colors.text }, typography.bodyBold]}>
                  {panchangData.tithi}
                </Text>
              </View>
              <View style={[styles.dataItem, { backgroundColor: colors.background, borderRadius: borderRadius.md }]}>
                <Icon name="star" size={24} color={colors.secondary} />
                <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>Nakshatra</Text>
                <Text style={[styles.dataValue, { color: colors.text }, typography.bodyBold]}>
                  {panchangData.nakshatra}
                </Text>
              </View>
              <View style={[styles.dataItem, { backgroundColor: colors.background, borderRadius: borderRadius.md }]}>
                <Icon name="auto-awesome" size={24} color={colors.purple} />
                <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>Yoga</Text>
                <Text style={[styles.dataValue, { color: colors.text }, typography.bodyBold]}>
                  {panchangData.yoga}
                </Text>
              </View>
              <View style={[styles.dataItem, { backgroundColor: colors.background, borderRadius: borderRadius.md }]}>
                <Icon name="schedule" size={24} color={colors.info} />
                <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>Karana</Text>
                <Text style={[styles.dataValue, { color: colors.text }, typography.bodyBold]}>
                  {panchangData.karana}
                </Text>
              </View>
            </View>
            <View style={styles.timingsSection}>
              <Text style={[styles.timingsTitle, { color: colors.text }, typography.bodyBold]}>
                Timings
              </Text>
              <View style={styles.timingRow}>
                <Text style={[styles.timingLabel, { color: colors.textSecondary }]}>Sunrise:</Text>
                <Text style={[styles.timingValue, { color: colors.text }]}>{panchangData.sunrise}</Text>
              </View>
              <View style={styles.timingRow}>
                <Text style={[styles.timingLabel, { color: colors.textSecondary }]}>Sunset:</Text>
                <Text style={[styles.timingValue, { color: colors.text }]}>{panchangData.sunset}</Text>
              </View>
              <View style={styles.timingRow}>
                <Text style={[styles.timingLabel, { color: colors.textSecondary }]}>Moonrise:</Text>
                <Text style={[styles.timingValue, { color: colors.text }]}>{panchangData.moonrise}</Text>
              </View>
              <View style={styles.timingRow}>
                <Text style={[styles.timingLabel, { color: colors.textSecondary }]}>Moonset:</Text>
                <Text style={[styles.timingValue, { color: colors.text }]}>{panchangData.moonset}</Text>
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
  getButton: {
    marginTop: 8,
  },
  dataCard: {
    padding: 24,
  },
  dataTitle: {
    marginBottom: 20,
    fontWeight: '700',
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  dataItem: {
    width: '47%',
    padding: 16,
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 14,
    textAlign: 'center',
  },
  timingsSection: {
    marginTop: 8,
  },
  timingsTitle: {
    marginBottom: 12,
    fontSize: 16,
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timingLabel: {
    fontSize: 14,
  },
  timingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
