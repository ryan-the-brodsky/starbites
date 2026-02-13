/**
 * Creates a debounced writer that buffers rapid updates and only sends the final state.
 * @param {Function} writeFn - The async write function to debounce
 * @param {number} delayMs - Debounce delay in milliseconds
 * @returns {{ write: Function, flush: Function, cancel: Function }}
 */
export const createDebouncedWriter = (writeFn, delayMs = 500) => {
  let timeoutId = null;
  let latestArgs = null;

  const write = (...args) => {
    latestArgs = args;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (latestArgs) {
        writeFn(...latestArgs);
        latestArgs = null;
      }
    }, delayMs);
  };

  const flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (latestArgs) {
      writeFn(...latestArgs);
      latestArgs = null;
    }
  };

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    latestArgs = null;
  };

  return { write, flush, cancel };
};
