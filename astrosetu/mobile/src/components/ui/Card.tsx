import React, { ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import LinearGradient from 'react-native-linear-gradient';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  gradient?: boolean;
  gradientColors?: string[];
  elevated?: boolean;
}

export function Card({ children, onPress, style, gradient = false, gradientColors, elevated = true }: CardProps) {
  const { colors, borderRadius } = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
    },
    elevated && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    style,
  ];

  const content = gradient && gradientColors ? (
    <LinearGradient
      colors={gradientColors}
      style={[styles.card, { borderRadius: borderRadius.lg }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  ) : (
    <View style={cardStyle}>{children}</View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    overflow: 'hidden',
  },
});

