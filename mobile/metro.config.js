const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

// Ensure React Native 0.88 subpath shims exist on disk for both package-exports and file-based resolution
try {
  require('./scripts/ensure-rn-shims');
} catch {}

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs');

const RN_SHIM_MAP = {
  'react-native/react-private-interface': path.resolve(
    __dirname,
    'node_modules/react-native/src/react-private-interface.js'
  ),
  'react-native/asset-registry': path.resolve(
    __dirname,
    'node_modules/react-native/src/asset-registry.js'
  ),
  'react-native/setup-env': path.resolve(
    __dirname,
    'node_modules/react-native/src/setup-env.js'
  ),
  'react-native/unstable-internals-do-not-use': path.resolve(
    __dirname,
    'node_modules/react-native/src/unstable-internals-do-not-use.js'
  ),
};

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (RN_SHIM_MAP[moduleName]) {
    return {
      filePath: RN_SHIM_MAP[moduleName],
      type: 'sourceFile',
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
