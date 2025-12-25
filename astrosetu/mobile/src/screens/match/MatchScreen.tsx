import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PlaceAutocomplete } from '../../components/PlaceAutocomplete';

export function MatchScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [maleName, setMaleName] = useState('');
  const [maleDob, setMaleDob] = useState('');
  const [maleTob, setMaleTob] = useState('');
  const [malePlace, setMalePlace] = useState('');
  const [femaleName, setFemaleName] = useState('');
  const [femaleDob, setFemaleDob] = useState('');
  const [femaleTob, setFemaleTob] = useState('');
  const [femalePlace, setFemalePlace] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    // Implement match logic
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Icon name="favorite" size={32} color={colors.surface} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.surface }]}>
              Match Kundli
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.surface }]}>
              Check compatibility for marriage
            </Text>
          </View>
        </LinearGradient>

        {/* Male Details */}
        <Card style={styles.formCard} elevated>
          <Text style={[styles.sectionTitle, { color: colors.text }, typography.h3]}>
            Male Details
          </Text>
          <Input
            label="Name"
            placeholder="Enter name"
            value={maleName}
            onChangeText={setMaleName}
            leftIcon="person"
            containerStyle={styles.inputSpacing}
          />
          <Input
            label="Date of Birth"
            placeholder="YYYY-MM-DD"
            value={maleDob}
            onChangeText={setMaleDob}
            leftIcon="calendar-today"
            keyboardType="numeric"
            containerStyle={styles.inputSpacing}
          />
          <Input
            label="Time of Birth"
            placeholder="HH:MM:SS"
            value={maleTob}
            onChangeText={setMaleTob}
            leftIcon="access-time"
            keyboardType="numeric"
            containerStyle={styles.inputSpacing}
          />
          <View style={styles.inputSpacing}>
            <Text style={[styles.label, { color: colors.text }, typography.bodyBold]}>
              Place of Birth
            </Text>
            <PlaceAutocomplete
              onSelect={(place) => setMalePlace(place.display_name)}
              placeholder="Search for place..."
            />
          </View>
        </Card>

        {/* Female Details */}
        <Card style={styles.formCard} elevated>
          <Text style={[styles.sectionTitle, { color: colors.text }, typography.h3]}>
            Female Details
          </Text>
          <Input
            label="Name"
            placeholder="Enter name"
            value={femaleName}
            onChangeText={setFemaleName}
            leftIcon="person"
            containerStyle={styles.inputSpacing}
          />
          <Input
            label="Date of Birth"
            placeholder="YYYY-MM-DD"
            value={femaleDob}
            onChangeText={setFemaleDob}
            leftIcon="calendar-today"
            keyboardType="numeric"
            containerStyle={styles.inputSpacing}
          />
          <Input
            label="Time of Birth"
            placeholder="HH:MM:SS"
            value={femaleTob}
            onChangeText={setFemaleTob}
            leftIcon="access-time"
            keyboardType="numeric"
            containerStyle={styles.inputSpacing}
          />
          <View style={styles.inputSpacing}>
            <Text style={[styles.label, { color: colors.text }, typography.bodyBold]}>
              Place of Birth
            </Text>
            <PlaceAutocomplete
              onSelect={(place) => setFemalePlace(place.display_name)}
              placeholder="Search for place..."
            />
          </View>
        </Card>

        <Button
          title="Match Kundli"
          onPress={handleMatch}
          loading={loading}
          disabled={loading}
          icon="favorite"
          iconPosition="left"
          size="large"
          fullWidth
          style={styles.matchButton}
        />
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
    paddingTop: 50,
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
  sectionTitle: {
    marginBottom: 20,
    fontWeight: '700',
  },
  inputSpacing: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  matchButton: {
    marginTop: 8,
    marginBottom: 20,
  },
});
