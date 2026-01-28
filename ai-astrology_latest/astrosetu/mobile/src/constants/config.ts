// API Configuration
// Prefer env override; fall back to sensible dev/prod defaults.
// For iOS simulator, 127.0.0.1 points to the host mac.
export const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.API_BASE_URL) ||
  (__DEV__ ? 'http://127.0.0.1:3001/api' : 'https://your-production-domain.com/api');

// App Configuration
export const APP_NAME = 'AstroSetu';
export const APP_VERSION = '1.0.0';

// Feature Flags
export const FEATURES = {
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_VIDEO_CALLS: true,
  ENABLE_AI_INSIGHTS: true,
  ENABLE_MULTILINGUAL: true,
};

// Payment Configuration
export const RAZORPAY_KEY_ID = 'your_razorpay_key_id';

// Supported Languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'ta', name: 'தமிழ்' },
];

