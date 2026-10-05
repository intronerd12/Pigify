import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

// Suppress known framework-internal deprecation noise from flooding the Metro bundler terminal
const IGNORED_WARNINGS = [
  'InteractionManager has been deprecated',
  "Passing an object as the argument to 'navigate' is deprecated",
  '<CameraView> component does not support children',
  'ImagePicker.MediaTypeOptions',
];

const originalWarn = console.warn;
console.warn = (...args) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (IGNORED_WARNINGS.some((pattern) => msg.includes(pattern))) {
    return;
  }
  originalWarn.apply(console, args);
};

LogBox.ignoreLogs(IGNORED_WARNINGS);

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);