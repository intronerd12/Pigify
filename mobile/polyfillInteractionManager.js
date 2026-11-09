const RN = require('react-native');

// Enhance FormData.prototype.append on native so { uri, name, type } objects
// implement .bytes() via expo-file-system's File class for Expo SDK 58's WinterCG fetch.
if (RN.Platform && RN.Platform.OS !== 'web' && typeof FormData !== 'undefined') {
  try {
    const origAppend = FormData.prototype.append;
    if (typeof origAppend === 'function' && !FormData.prototype._pigifyPatched) {
      FormData.prototype.append = function (name, value, ...rest) {
        if (
          value &&
          typeof value === 'object' &&
          typeof value.uri === 'string' &&
          typeof value.bytes !== 'function'
        ) {
          Object.defineProperty(value, 'bytes', {
            configurable: true,
            enumerable: false,
            value: async function () {
              const { File } = require('expo-file-system');
              return await new File(value.uri).bytes();
            },
          });
        }
        return origAppend.call(this, name, value, ...rest);
      };
      FormData.prototype._pigifyPatched = true;
    }
  } catch {}
}

const polyfillInteractionManager = {
  Events: {
    interactionStart: 'interactionStart',
    interactionComplete: 'interactionComplete',
  },
  runAfterInteractions: (task) => {
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
  createInteractionHandle: () => 1,
  clearInteractionHandle: () => {},
  setDeadline: () => {},
  addListener: () => ({ remove: () => {} }),
};

try {
  Object.defineProperty(RN, 'InteractionManager', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: polyfillInteractionManager,
  });
} catch {
  try {
    RN.InteractionManager = polyfillInteractionManager;
  } catch {}
}

module.exports = polyfillInteractionManager;
