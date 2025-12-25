import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export function OTPVerificationScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { sendOTP, verifyOTP } = useAuth();
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }

    setLoading(true);
    try {
      await sendOTP(phone);
      setOtpSent(true);
      Alert.alert('Success', 'OTP sent to your phone');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(phone, otp);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={[styles.logo, { color: colors.surface }]}>📱</Text>
          <Text style={[styles.appName, { color: colors.surface }]}>OTP Verification</Text>
        </View>

        <View style={[styles.form, { padding: spacing.lg }]}>
          {!otpSent ? (
            <>
              <Text style={[styles.title, { color: colors.text }, typography.h2]}>
                Enter Phone Number
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }, typography.body]}>
                We'll send you a verification code
              </Text>

              <View style={styles.inputContainer}>
                <Icon name="phone" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderColor: colors.border,
                      borderRadius: borderRadius.md,
                    },
                  ]}
                  placeholder="+91 9876543210"
                  placeholderTextColor={colors.textSecondary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: borderRadius.md,
                    opacity: loading ? 0.7 : 1,
                  },
                ]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: colors.surface }, typography.bodyBold]}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: colors.text }, typography.h2]}>
                Enter OTP
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }, typography.body]}>
                Code sent to {phone}
              </Text>

              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderColor: colors.border,
                      borderRadius: borderRadius.md,
                    },
                  ]}
                  placeholder="000000"
                  placeholderTextColor={colors.textSecondary}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: borderRadius.md,
                    opacity: loading ? 0.7 : 1,
                  },
                ]}
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: colors.surface }, typography.bodyBold]}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => {
                  setOtpSent(false);
                  setOtp('');
                }}
              >
                <Text style={[styles.resendText, { color: colors.primary }]}>
                  Change Phone Number
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={[styles.backText, { color: colors.textSecondary }]}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  logo: {
    fontSize: 50,
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
  },
  form: {
    flex: 1,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 56,
    paddingLeft: 48,
    paddingRight: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  button: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  backText: {
    fontSize: 14,
  },
});

