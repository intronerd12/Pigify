const RN = require('react-native');

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
