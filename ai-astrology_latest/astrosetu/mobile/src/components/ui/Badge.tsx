import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export function Badge({ children, variant = 'primary', size = 'medium', style }: BadgeProps) {
  const { colors, spacing, borderRadius } = useTheme();

  const variantColors = {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  };

  const sizeStyles = {
    small: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 10 },
    medium: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 12 },
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${variantColors[variant]}20`,
          borderRadius: borderRadius.full,
          ...sizeStyles[size],
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: variantColors[variant],
            fontSize: sizeStyles[size].fontSize,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '600',
  },
});

