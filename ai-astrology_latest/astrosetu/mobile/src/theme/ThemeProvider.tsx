import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

// Indian Spiritual Theme Colors (Saffron, Orange, Gold)
export const colors = {
  light: {
    primary: '#F97316', // Saffron/Orange
    primaryDark: '#EA580C',
    primaryLight: '#FB923C',
    secondary: '#F59E0B', // Gold
    secondaryDark: '#D97706',
    accent: '#FF6B35',
    background: '#FFF7ED',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    saffron: '#F97316',
    orange: '#FB923C',
    gold: '#F59E0B',
    purple: '#9333EA',
    indigo: '#6366F1',
  },
  dark: {
    primary: '#F97316',
    primaryDark: '#EA580C',
    primaryLight: '#FB923C',
    secondary: '#F59E0B',
    secondaryDark: '#D97706',
    accent: '#FF6B35',
    background: '#1F2937',
    surface: '#374151',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#4B5563',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    saffron: '#F97316',
    orange: '#FB923C',
    gold: '#F59E0B',
    purple: '#9333EA',
    indigo: '#6366F1',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

interface ThemeContextType {
  colors: typeof colors.light;
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const value: ThemeContextType = {
    colors: themeColors,
    spacing,
    typography,
    borderRadius,
    isDark,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

