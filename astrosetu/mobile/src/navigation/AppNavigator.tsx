import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OTPVerificationScreen } from '../screens/auth/OTPVerificationScreen';

// Main Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { KundliScreen } from '../screens/kundli/KundliScreen';
import { HoroscopeScreen } from '../screens/horoscope/HoroscopeScreen';
import { AstrologersScreen } from '../screens/astrologers/AstrologersScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { ServicesScreen } from '../screens/services/ServicesScreen';
import { MatchScreen } from '../screens/match/MatchScreen';
import { PanchangScreen } from '../screens/panchang/PanchangScreen';
import { NumerologyScreen } from '../screens/numerology/NumerologyScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { WalletScreen } from '../screens/wallet/WalletScreen';
import { ReportsScreen } from '../screens/reports/ReportsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { OnboardingIntroScreen } from '../screens/onboarding/OnboardingIntroScreen';
import { OnboardingTrustScreen } from '../screens/onboarding/OnboardingTrustScreen';
import { OnboardingGoalsScreen } from '../screens/onboarding/OnboardingGoalsScreen';
import { SubscriptionScreen } from '../screens/payments/SubscriptionScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { colors, spacing } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: spacing.sm + 4,
          paddingTop: spacing.sm,
          height: 65,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Kundli"
        component={KundliScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="auto-awesome" size={size} color={color} />
          ),
          tabBarLabel: 'Kundli',
        }}
      />
      <Tab.Screen
        name="Horoscope"
        component={HoroscopeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-today" size={size} color={color} />
          ),
          tabBarLabel: 'Horoscope',
        }}
      />
      <Tab.Screen
        name="Astrologers"
        component={AstrologersScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="people" size={size} color={color} />
          ),
          tabBarLabel: 'Astrologers',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={isAuthenticated ? 'MainTabs' : 'OnboardingIntro'}
    >
      {!isAuthenticated && (
        <>
          <Stack.Screen name="OnboardingIntro" component={OnboardingIntroScreen} />
          <Stack.Screen name="OnboardingTrust" component={OnboardingTrustScreen} />
          <Stack.Screen name="OnboardingGoals" component={OnboardingGoalsScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        </>
      )}
      {isAuthenticated && (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="Services"
            component={ServicesScreen}
            options={{ headerShown: true, title: 'Services' }}
          />
          <Stack.Screen
            name="Match"
            component={MatchScreen}
            options={{ headerShown: true, title: 'Match Kundli' }}
          />
          <Stack.Screen
            name="Panchang"
            component={PanchangScreen}
            options={{ headerShown: true, title: 'Panchang' }}
          />
          <Stack.Screen
            name="Numerology"
            component={NumerologyScreen}
            options={{ headerShown: true, title: 'Numerology' }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ headerShown: true, title: 'Chat' }}
          />
          <Stack.Screen
            name="Wallet"
            component={WalletScreen}
            options={{ headerShown: true, title: 'Wallet' }}
          />
          <Stack.Screen
            name="Reports"
            component={ReportsScreen}
            options={{ headerShown: true, title: 'Reports' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerShown: true, title: 'Settings' }}
          />
          <Stack.Screen
            name="Subscription"
            component={SubscriptionScreen}
            options={{ headerShown: true, title: 'AstroSetu Plus' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

