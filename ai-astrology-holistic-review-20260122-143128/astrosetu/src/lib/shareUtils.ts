/**
 * Share Utilities for Web App
 * Enhanced sharing functionality inspired by AstroSage/AstroTalk
 */

/**
 * Share Kundli result
 */
export async function shareKundli(kundliData: any, userName?: string): Promise<boolean> {
  const shareText = `🔮 Kundli (Birth Chart) for ${userName || "User"}\n\n` +
    `📍 Ascendant: ${kundliData.ascendant || "N/A"}\n` +
    `🌟 Rashi: ${kundliData.rashi || "N/A"}\n` +
    `⭐ Nakshatra: ${kundliData.nakshatra || "N/A"}\n\n` +
    `Generated on AstroSetu - Bridging humans with cosmic guidance`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: 'My Kundli - AstroSetu',
        text: shareText,
        url: window.location.href,
      });
      return true;
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(shareText);
      alert('Kundli details copied to clipboard!');
      return true;
    }
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.error('Share error:', error);
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Kundli details copied to clipboard!');
        return true;
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        return false;
      }
    }
    return false;
  }
}

/**
 * Share Match result
 */
export async function shareMatch(matchData: any): Promise<boolean> {
  const gunaScore = matchData.gunaScore || matchData.totalGuna || 0;
  const shareText = `💑 Kundli Match (Guna Milan)\n\n` +
    `✨ Total Guna Score: ${gunaScore}/36\n` +
    `📊 Match Percentage: ${matchData.matchPercentage || "N/A"}%\n` +
    `💡 Status: ${matchData.status || "N/A"}\n\n` +
    `Generated on AstroSetu - Bridging humans with cosmic guidance`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Kundli Match - AstroSetu',
        text: shareText,
        url: window.location.href,
      });
      return true;
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Match details copied to clipboard!');
      return true;
    }
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.error('Share error:', error);
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Match details copied to clipboard!');
        return true;
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        return false;
      }
    }
    return false;
  }
}

/**
 * Share Horoscope
 */
export async function shareHoroscope(horoscopeData: any, sign: string, type: string): Promise<boolean> {
  const shareText = `⭐ ${sign} ${type} Horoscope\n\n` +
    `${horoscopeData.prediction || horoscopeData.content || "N/A"}\n\n` +
    `From AstroSetu - Bridging humans with cosmic guidance`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: `${sign} ${type} Horoscope - AstroSetu`,
        text: shareText,
        url: window.location.href,
      });
      return true;
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Horoscope copied to clipboard!');
      return true;
    }
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.error('Share error:', error);
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Horoscope copied to clipboard!');
        return true;
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        return false;
      }
    }
    return false;
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Clipboard error:', error);
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Fallback clipboard error:', fallbackError);
      return false;
    }
  }
}

/**
 * Generate shareable link
 */
export function generateShareableLink(path: string, params: Record<string, any>): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://astrosetu-app.vercel.app';
  
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  return `${baseUrl}${path}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Download as JSON
 */
export function downloadAsJSON(data: any, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Check if Web Share API is supported
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

