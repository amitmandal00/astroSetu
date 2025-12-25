import { apiService } from './api';

/**
 * Accuracy Service
 * Ensures calculations match industry standards (AstroSage/AstroTalk)
 */

export interface AccuracyConfig {
  ayanamsa: number; // 1 = Lahiri (standard)
  houseSystem: string; // 'placidus' | 'equal' | 'whole'
  nodeMethod: string; // 'true' | 'mean'
  timezone: string; // Default: 'Asia/Kolkata'
}

export const DEFAULT_ACCURACY_CONFIG: AccuracyConfig = {
  ayanamsa: 1, // Lahiri (matches AstroSage)
  houseSystem: 'placidus', // Standard house system
  nodeMethod: 'true', // True Rahu-Ketu (more accurate)
  timezone: 'Asia/Kolkata', // IST
};

export const accuracyService = {
  /**
   * Validate Kundli calculation accuracy
   * Compares results with expected values
   */
  async validateKundliAccuracy(
    kundliData: any,
    expectedValues: {
      ascendant?: string;
      moonSign?: string;
      nakshatra?: string;
      tolerance?: number; // Degree tolerance (default: 0.2°)
    }
  ) {
    const tolerance = expectedValues.tolerance || 0.2;
    const issues: string[] = [];

    // Validate Ascendant
    if (expectedValues.ascendant && kundliData.ascendant !== expectedValues.ascendant) {
      issues.push(`Ascendant mismatch: Expected ${expectedValues.ascendant}, Got ${kundliData.ascendant}`);
    }

    // Validate Moon Sign
    if (expectedValues.moonSign && kundliData.rashi !== expectedValues.moonSign) {
      issues.push(`Moon Sign mismatch: Expected ${expectedValues.moonSign}, Got ${kundliData.rashi}`);
    }

    // Validate Nakshatra
    if (expectedValues.nakshatra && kundliData.nakshatra !== expectedValues.nakshatra) {
      issues.push(`Nakshatra mismatch: Expected ${expectedValues.nakshatra}, Got ${kundliData.nakshatra}`);
    }

    // Validate Planetary Positions (if provided)
    if (kundliData.planets && expectedValues) {
      // Add planetary position validation logic here
    }

    return {
      accurate: issues.length === 0,
      issues,
      score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 10),
    };
  },

  /**
   * Ensure calculation settings match industry standards
   */
  getAccuracyConfig(): AccuracyConfig {
    return DEFAULT_ACCURACY_CONFIG;
  },

  /**
   * Verify API configuration for accurate calculations
   */
  async verifyAPIConfiguration() {
    try {
      const response = await apiService.get('/astrology/config');
      return {
        configured: response?.configured || false,
        ayanamsa: response?.ayanamsa || DEFAULT_ACCURACY_CONFIG.ayanamsa,
        houseSystem: response?.houseSystem || DEFAULT_ACCURACY_CONFIG.houseSystem,
        nodeMethod: response?.nodeMethod || DEFAULT_ACCURACY_CONFIG.nodeMethod,
      };
    } catch (error) {
      return {
        configured: false,
        error: 'Failed to verify API configuration',
      };
    }
  },

  /**
   * Compare two Kundli results for accuracy
   */
  compareKundliResults(result1: any, result2: any, tolerance: number = 0.2) {
    const differences: string[] = [];

    if (result1.ascendant !== result2.ascendant) {
      differences.push(`Ascendant: ${result1.ascendant} vs ${result2.ascendant}`);
    }

    if (result1.rashi !== result2.rashi) {
      differences.push(`Moon Sign: ${result1.rashi} vs ${result2.rashi}`);
    }

    if (result1.nakshatra !== result2.nakshatra) {
      differences.push(`Nakshatra: ${result1.nakshatra} vs ${result2.nakshatra}`);
    }

    return {
      match: differences.length === 0,
      differences,
      matchPercentage: differences.length === 0 ? 100 : Math.max(0, 100 - differences.length * 20),
    };
  },
};

