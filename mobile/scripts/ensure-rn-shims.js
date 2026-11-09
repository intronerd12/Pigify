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
}
