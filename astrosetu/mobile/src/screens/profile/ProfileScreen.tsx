import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function ProfileScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const menuItems = [
    { id: 'kundlis', title: 'My Kundlis', icon: 'auto-awesome', color: colors.primary },
    { id: 'reports', title: 'My Reports', icon: 'description', color: colors.secondary },
    { id: 'wallet', title: 'Wallet', icon: 'account-balance-wallet', color: colors.success },
    { id: 'settings', title: 'Settings', icon: 'settings', color: colors.textSecondary, route: 'Settings' },
    { id: 'help', title: 'Help & Support', icon: 'help-outline', color: colors.info },
    { id: 'about', title: 'About', icon: 'info-outline', color: colors.purple },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.profileContainer}>
          <View style={[styles.avatarContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            {user?.name ? (
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Icon name="person" size={40} color={colors.surface} />
            )}
          </View>
          <Text style={[styles.userName, { color: colors.surface }]}>
            {user?.name || 'User'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.surface }]}>
            {user?.email || ''}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Menu Items */}
        {menuItems.map((item) => (
          <Card
            key={item.id}
            onPress={() => {
              if (item.id === 'wallet') {
                navigation.navigate('Wallet' as never);
              } else if (item.id === 'reports') {
                navigation.navigate('Reports' as never);
              } else if (item.id === 'kundlis') {
                navigation.navigate('Kundli' as never);
              } else if (item.id === 'settings' && item.route) {
                navigation.navigate(item.route as never);
              }
            }}
            style={styles.menuItem}
            elevated
          >
            <View style={styles.menuItemContent}>
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: `${item.color}15` },
                ]}
              >
                <Icon name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={[styles.menuTitle, { color: colors.text }, typography.bodyBold]}>
                {item.title}
              </Text>
              <Icon name="chevron-right" size={24} color={colors.textSecondary} />
            </View>
          </Card>
        ))}

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={logout}
          variant="outline"
          icon="logout"
          iconPosition="left"
          style={styles.logoutButton}
        />
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
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileContainer: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  menuItem: {
    marginBottom: 12,
    padding: 20,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 20,
  },
});
