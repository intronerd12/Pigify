const fs = require('fs');
const path = require('path');

const rnRoot = path.resolve(__dirname, '..', 'node_modules', 'react-native');

const shims = [
  {
    target: 'react-private-interface.js',
    source: './src/react-private-interface',
  },
  {
    target: 'asset-registry.js',
    source: './src/asset-registry',
  },
  {
    target: 'setup-env.js',
    source: './src/setup-env',
  },
  {
    target: 'unstable-internals-do-not-use.js',
    source: './src/unstable-internals-do-not-use',
  },
];

const interactionManagerShimContent = `'use strict';
const InteractionManager = {
  Events: {
    interactionStart: 'interactionStart',
    interactionComplete: 'interactionComplete',
  },
  runAfterInteractions(task) {
    let cancelled = false;
    const execute = () => {
      if (!cancelled) {
        if (typeof task === 'function') {
          task();
        } else if (task && typeof task.gen === 'function') {
          task.gen();
        }
      }
    };
    const schedule =
      typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback
        : (cb) => setTimeout(cb, 0);
    const cancelSchedule =
      typeof cancelIdleCallback !== 'undefined'
        ? cancelIdleCallback
        : clearTimeout;
    const handle = schedule(execute);
    const promise = new Promise((resolve) => {
      schedule(() => {
        if (!cancelled) resolve();
      });
    });
    return {
      then: promise.then.bind(promise),
      done: promise.then.bind(promise),
      cancel: () => {
        cancelled = true;
        cancelSchedule(handle);
      },
    };
  },
  createInteractionHandle() {
    return 1;
  },
  clearInteractionHandle() {},
  setDeadline() {},
  addListener() {
    return { remove() {} };
  },
};
InteractionManager.default = InteractionManager;
module.exports = InteractionManager;
`;

if (fs.existsSync(rnRoot)) {
  for (const shim of shims) {
    const filePath = path.join(rnRoot, shim.target);
    const content = `'use strict';\nmodule.exports = require('${shim.source}');\n`;
    try {
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    } catch (err) {
      // Ignore permission errors in read-only environments
    }
  }

  // Ensure Libraries/Interaction/InteractionManager.js exists for deep imports
  try {
    const interactionDir = path.join(rnRoot, 'Libraries', 'Interaction');
    const interactionFile = path.join(interactionDir, 'InteractionManager.js');
    if (fs.existsSync(interactionDir) && !fs.existsSync(interactionFile)) {
      fs.writeFileSync(interactionFile, interactionManagerShimContent, 'utf8');
    }
  } catch (err) {}

  // Patch node_modules/react-native/index.js so accessing InteractionManager returns the polyfill instead of throwing invariant(false, ...)
  try {
    const rnIndexFile = path.join(rnRoot, 'index.js');
    if (fs.existsSync(rnIndexFile)) {
      const src = fs.readFileSync(rnIndexFile, 'utf8');
      if (src.includes('InteractionManager has been removed from react-native core')) {
        const patched = src.replace(
          /if\s*\(__DEV__\)\s*\{[\s\S]*?Object\.defineProperty\(module\.exports,\s*'InteractionManager'[\s\S]*?\}\s*$/,
          `const _polyfillInteractionManager = require('./Libraries/Interaction/InteractionManager');\nObject.defineProperty(module.exports, 'InteractionManager', {\n  configurable: true,\n  enumerable: true,\n  get() {\n    return _polyfillInteractionManager;\n  },\n});\n`
        );
        if (patched !== src) {
          fs.writeFileSync(rnIndexFile, patched, 'utf8');
        }
      }
    }
  } catch (err) {}
}
