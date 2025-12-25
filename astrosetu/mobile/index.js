import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './package.json';

// Register the app for both the package name (React Native CLI)
// and the default "main" entry used by some tooling (e.g. Expo / Metro).
AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent('main', () => App);
