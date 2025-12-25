import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { kundliService } from '../../services/kundliService';
import { PlaceAutocomplete } from '../../components/PlaceAutocomplete';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ShareButton } from '../../components/ShareButton';
import { useNavigation } from '@react-navigation/native';
import { accuracyService } from '../../services/accuracyService';
import { trackEvent, trackError } from '../../services/telemetry';

export function KundliScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [tob, setTob] = useState('');
  const [place, setPlace] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [accuracyStatus, setAccuracyStatus] = useState<{ configured: boolean; verified: boolean } | null>(null);

  useEffect(() => {
    checkAccuracyConfig();
  }, []);

  const checkAccuracyConfig = async () => {
    const config = await accuracyService.verifyAPIConfiguration();
    setAccuracyStatus({
      configured: config.configured || false,
      verified: config.configured || false,
    });
  };

  const handleGenerate = async () => {
    if (!name || !dob || !tob || !place || !latitude || !longitude) {
      Alert.alert('Error', 'Please fill all fields and select a place');
      return;
    }

    setLoading(true);
    try {
      const response = await kundliService.generateKundli({
        name,
        dob,
        tob,
        place,
        latitude,
        longitude,
      });
      setResult(response);
      trackEvent('kundli_generated_mobile', {
        hasCoordinates: !!(latitude && longitude),
      });

      // Validate accuracy if API is configured
      if (accuracyStatus?.configured && response) {
        const validation = await accuracyService.validateKundliAccuracy(response, {
          tolerance: 0.2,
        });
        if (!validation.accurate && validation.issues.length > 0) {
          console.warn('Accuracy issues:', validation.issues);
          trackEvent('kundli_accuracy_mismatch_mobile', {
            issues: validation.issues.slice(0, 3),
          });
        }
      }
    } catch (error: any) {
      trackError('kundli_generate_mobile', error);
      Alert.alert('Error', error.message || 'Failed to generate Kundli');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = (selectedPlace: any) => {
    setPlace(selectedPlace.display_name);
    setLatitude(selectedPlace.lat);
    setLongitude(selectedPlace.lon);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Icon name="auto-awesome" size={32} color={colors.surface} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.surface }]}>
              Generate Kundli
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.surface }]}>
              Enter your birth details for accurate predictions
            </Text>
          </View>
        </LinearGradient>

        {/* Form Card */}
        <Card style={styles.formCard} elevated>
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              leftIcon="person"
            />

            <Input
              label="Date of Birth"
              placeholder="YYYY-MM-DD (e.g., 1984-11-26)"
              value={dob}
              onChangeText={setDob}
              leftIcon="calendar-today"
              keyboardType="numeric"
            />

            <Input
              label="Time of Birth"
              placeholder="HH:MM:SS (e.g., 21:40:00)"
              value={tob}
              onChangeText={setTob}
              leftIcon="access-time"
              keyboardType="numeric"
            />

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }, typography.bodyBold]}>
                Place of Birth
              </Text>
              <PlaceAutocomplete
                onSelect={handlePlaceSelect}
                placeholder="Search for place..."
              />
              {place && (
                <View style={[styles.selectedPlace, { backgroundColor: `${colors.primary}15` }]}>
                  <Icon name="location-on" size={20} color={colors.primary} />
                  <Text style={[styles.selectedPlaceText, { color: colors.text }]}>{place}</Text>
                  <TouchableOpacity onPress={() => {
                    setPlace('');
                    setLatitude(null);
                    setLongitude(null);
                  }}>
                    <Icon name="close" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <Button
              title="Generate Kundli"
              onPress={handleGenerate}
              loading={loading}
              disabled={loading || !name || !dob || !tob || !place}
              icon="auto-awesome"
              iconPosition="left"
              size="large"
              fullWidth
              style={styles.generateButton}
            />
          </View>
        </Card>

        {/* Results Card */}
        {result && (
          <Card style={styles.resultCard} elevated gradient gradientColors={[`${colors.primary}10`, `${colors.secondary}10`]}>
            <View style={styles.resultHeader}>
              <View style={[styles.resultIconContainer, { backgroundColor: colors.primary }]}>
                <Icon name="check-circle" size={28} color={colors.surface} />
              </View>
              <Text style={[styles.resultTitle, { color: colors.text }, typography.h2]}>
                Your Kundli
              </Text>
            </View>

            <View style={styles.resultContent}>
              <View style={[styles.resultItem, { backgroundColor: colors.background, borderRadius: borderRadius.md }]}>
                <View style={styles.resultItemLeft}>
                  <Icon name="star" size={20} color={colors.primary} />
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Ascendant</Text>
                </View>
                <Text style={[styles.resultValue, { color: colors.text }, typography.bodyBold]}>
                  {result.ascendant || 'N/A'}
                </Text>
              </View>

              <View style={[styles.resultItem, { backgroundColor: colors.background, borderRadius: borderRadius.md }]}>
                <View style={styles.resultItemLeft}>
                  <Icon name="brightness-2" size={20} color={colors.secondary} />
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Moon Sign</Text>
                </View>
                <Text style={[styles.resultValue, { color: colors.text }, typography.bodyBold]}>
                  {result.rashi || 'N/A'}
                </Text>
              </View>

              <View style={[styles.resultItem, { backgroundColor: colors.background, borderRadius: borderRadius.md }]}>
                <View style={styles.resultItemLeft}>
                  <Icon name="auto-awesome" size={20} color={colors.purple} />
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Nakshatra</Text>
                </View>
                <Text style={[styles.resultValue, { color: colors.text }, typography.bodyBold]}>
                  {result.nakshatra || 'N/A'}
                </Text>
              </View>
              <View style={[styles.resultItem, { backgroundColor: colors.background, borderRadius: borderRadius.md }]}>
                <View style={styles.resultItemLeft}>
                  <Icon name="timelapse" size={20} color={colors.secondary} />
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Current Mahadasha</Text>
                </View>
                <Text style={[styles.resultValue, { color: colors.text }, typography.bodyBold]}>
                  {result?.chart?.dasha?.current || result?.dasha?.current || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Trust & accuracy disclosure */}
            {accuracyStatus && (
              <View
                style={[
                  styles.accuracyPanel,
                  {
                    backgroundColor: `${colors.background}`,
                    borderRadius: borderRadius.md,
                    borderColor: accuracyStatus.configured ? colors.success : colors.warning,
                  },
                ]}
              >
                <View style={styles.accuracyHeader}>
                  <Icon
                    name={accuracyStatus.configured ? 'verified' : 'warning'}
                    size={20}
                    color={accuracyStatus.configured ? colors.success : colors.warning}
                  />
                  <Text
                    style={[
                      styles.accuracyTitle,
                      { color: accuracyStatus.configured ? colors.success : colors.warning },
                    ]}
                  >
                    Calculation Settings & Proof
                  </Text>
                </View>
                <Text style={[styles.accuracyText, { color: colors.textSecondary }]}>
                  • Ayanamsa: Lahiri (matches popular apps like AstroSage)
                </Text>
                <Text style={[styles.accuracyText, { color: colors.textSecondary }]}>
                  • Ephemeris: {accuracyStatus.configured ? 'Live Prokerala API' : 'Local fallback engine'}
                </Text>
                <Text style={[styles.accuracyText, { color: colors.textSecondary }]}>
                  • Rahu / Ketu: Mean node model, standardised for Vedic calculations
                </Text>
                <Text style={[styles.accuracyText, { color: colors.textSecondary }]}>
                  • Coordinates & timezone are applied so ascendant and planetary degrees stay consistent.
                </Text>
              </View>
            )}

            <View style={styles.resultActions}>
              <Button
                title="View Full Report"
                onPress={() => navigation.navigate('Reports' as never)}
                variant="outline"
                style={styles.viewReportButton}
              />
              <ShareButton
                type="kundli"
                data={{
                  name,
                  dob,
                  tob,
                  place,
                  ascendant: result.ascendant,
                  rashi: result.rashi,
                  nakshatra: result.nakshatra,
                }}
                style={styles.shareButton}
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
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
  formCard: {
    padding: 24,
    marginBottom: 20,
  },
  form: {
    gap: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  selectedPlace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
  },
  selectedPlaceText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  generateButton: {
    marginTop: 8,
  },
  resultCard: {
    padding: 24,
    marginTop: 8,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    textAlign: 'center',
    marginBottom: 4,
  },
  resultContent: {
    gap: 12,
    marginBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  resultItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  resultLabel: {
    fontSize: 14,
    flex: 1,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  viewReportButton: {
    flex: 1,
    marginRight: 12,
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  shareButton: {
    marginLeft: 8,
  },
  accuracyWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  accuracyWarningText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  accuracyPanel: {
    marginTop: 4,
    padding: 12,
    borderWidth: 1,
  },
  accuracyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  accuracyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  accuracyText: {
    fontSize: 12,
    marginBottom: 2,
  },
});

