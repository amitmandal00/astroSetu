import { Platform, Share, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export interface ShareOptions {
  title?: string;
  message?: string;
  url?: string;
  subject?: string;
}

export const shareService = {
  /**
   * Share text content
   */
  async shareText(options: ShareOptions) {
    try {
      const result = await Share.share({
        title: options.title || 'AstroSetu',
        message: options.message || '',
        url: options.url,
        subject: options.subject,
      });

      if (result.action === Share.sharedAction) {
        return { success: true, activityType: result.activityType };
      }
      return { success: false, dismissed: true };
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to share');
      return { success: false, error: error.message };
    }
  },

  /**
   * Share Kundli as text
   */
  async shareKundli(kundliData: any) {
    const message = `My Kundli Details:\n\n` +
      `Name: ${kundliData.name}\n` +
      `Date of Birth: ${kundliData.dob}\n` +
      `Time of Birth: ${kundliData.tob}\n` +
      `Place: ${kundliData.place}\n\n` +
      `Ascendant: ${kundliData.ascendant}\n` +
      `Moon Sign: ${kundliData.rashi}\n` +
      `Nakshatra: ${kundliData.nakshatra}\n`;

    return this.shareText({
      title: 'My Kundli - AstroSetu',
      message,
    });
  },

  /**
   * Share Horoscope
   */
  async shareHoroscope(horoscopeData: any) {
    const message = `${horoscopeData.type} Horoscope for ${horoscopeData.sign}:\n\n${horoscopeData.content}`;
    
    return this.shareText({
      title: `${horoscopeData.type} Horoscope - AstroSetu`,
      message,
    });
  },

  /**
   * Share Report (as text summary)
   */
  async shareReport(reportData: any) {
    const message = `${reportData.title}\n\n${reportData.summary || 'View full report in AstroSetu app'}`;
    
    return this.shareText({
      title: `${reportData.title} - AstroSetu`,
      message,
    });
  },

  /**
   * Export Kundli as PDF (placeholder - requires PDF generation library)
   */
  async exportKundliPDF(kundliData: any) {
    // TODO: Implement PDF generation
    // This would require a library like react-native-pdf or expo-print
    Alert.alert('Coming Soon', 'PDF export will be available soon');
    return { success: false, message: 'PDF export not yet implemented' };
  },

  /**
   * Save image to gallery (for Kundli chart)
   */
  async saveImageToGallery(imageUri: string) {
    try {
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please grant storage permission to save image');
          return { success: false };
        }
      }

      const asset = await MediaLibrary.createAssetAsync(imageUri);
      await MediaLibrary.createAlbumAsync('AstroSetu', asset, false);
      
      Alert.alert('Success', 'Image saved to gallery');
      return { success: true, uri: asset.uri };
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save image');
      return { success: false, error: error.message };
    }
  },
};

