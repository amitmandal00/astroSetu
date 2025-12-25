import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../theme/ThemeProvider';
import { shareService } from '../utils/share';

interface ShareButtonProps {
  type: 'kundli' | 'horoscope' | 'report';
  data: any;
  style?: any;
}

export function ShareButton({ type, data, style }: ShareButtonProps) {
  const { colors } = useTheme();

  const handleShare = async () => {
    try {
      let result;
      switch (type) {
        case 'kundli':
          result = await shareService.shareKundli(data);
          break;
        case 'horoscope':
          result = await shareService.shareHoroscope(data);
          break;
        case 'report':
          result = await shareService.shareReport(data);
          break;
      }

      if (result?.success) {
        // Share successful
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to share');
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.shareButton,
        { backgroundColor: `${colors.primary}15` },
        style,
      ]}
      onPress={handleShare}
    >
      <Icon name="share" size={20} color={colors.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

