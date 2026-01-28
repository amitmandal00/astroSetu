const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * This uses the standard React Native Metro setup and avoids
 * Expo-specific runtime injections that were causing errors.
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  projectRoot: __dirname,
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
