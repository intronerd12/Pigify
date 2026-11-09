import * as ReactNative from 'react-native';
import { LogBox } from 'react-native';

// Polyfill InteractionManager removed in React Native 0.88 / Expo SDK 58
const polyfillInteractionManager = {
  runAfterInteractions: (task) => {
    let cancelled = false;
    const execute = () => {
      if (!cancelled && typeof task === 'function') {
        task();
      }
    };
    let handle;
    if (typeof requestIdleCallback !== 'undefined') {
      handle = requestIdleCallback(execute);
    } else {
      handle = setTimeout(execute, 0);
    }
    return {
      cancel: () => {
        cancelled = true;
        if (typeof cancelIdleCallback !== 'undefined') {
          cancelIdleCallback(handle);
        } else {
          clearTimeout(handle);
        }
      },
      then: (onResolved, onRejected) => {
        return new Promise((resolve) => {
          polyfillInteractionManager.runAfterInteractions(resolve);
        }).then(onResolved, onRejected);
      },
    };
  },
  createInteractionHandle: () => 1,
  clearInteractionHandle: () => {},
  setDeadline: () => {},
  addListener: () => ({ remove: () => {} }),
};

try {
  Object.defineProperty(ReactNative, 'InteractionManager', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: polyfillInteractionManager,
  });
} catch {
  ReactNative.InteractionManager = polyfillInteractionManager;
}

import { registerRootComponent } from 'expo';

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