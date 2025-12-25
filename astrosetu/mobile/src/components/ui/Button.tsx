import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/ThemeProvider';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  fullWidth = false,
}: ButtonProps) {
  const { colors, spacing, typography, borderRadius } = useTheme();

  const sizeStyles = {
    small: { height: 40, paddingHorizontal: 16, fontSize: 14 },
    medium: { height: 52, paddingHorizontal: 24, fontSize: 16 },
    large: { height: 60, paddingHorizontal: 32, fontSize: 18 },
  };

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: 'transparent',
    },
    secondary: {
      backgroundColor: colors.secondary,
      borderColor: 'transparent',
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: colors.primary,
      borderWidth: 2,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
  };

  const textColor = variant === 'outline' || variant === 'ghost' 
    ? colors.primary 
    : colors.surface;

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Icon name={icon} size={20} color={textColor} style={{ marginRight: 8 }} />
          )}
          <Text
            style={[
              {
                color: textColor,
                fontSize: sizeStyles[size].fontSize,
                fontWeight: '600',
              },
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Icon name={icon} size={20} color={textColor} style={{ marginLeft: 8 }} />
          )}
        </>
      )}
    </>
  );

  const buttonStyle: ViewStyle = [
    styles.button,
    {
      height: sizeStyles[size].height,
      paddingHorizontal: sizeStyles[size].paddingHorizontal,
      borderRadius: borderRadius.md,
      ...variantStyles[variant],
      opacity: disabled || loading ? 0.6 : 1,
      width: fullWidth ? '100%' : 'auto',
    },
    style,
  ];

  if (variant === 'primary' && !disabled && !loading) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled || loading}
        style={buttonStyle}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={[
            styles.gradient,
            {
              borderRadius: borderRadius.md,
              height: sizeStyles[size].height,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.buttonContent}>{buttonContent}</View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyle}
    >
      <View style={styles.buttonContent}>{buttonContent}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  gradient: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

