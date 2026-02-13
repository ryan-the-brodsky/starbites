/**
 * Retries an async function with exponential backoff and jitter.
 * @param {Function} fn - The async function to retry
 * @param {Object} options
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} options.baseDelayMs - Base delay in milliseconds (default: 500)
 * @param {number} options.maxDelayMs - Maximum delay in milliseconds (default: 5000)
 * @returns {Promise<*>} The result of the function
 */
export const retryWithBackoff = async (fn, { maxRetries = 3, baseDelayMs = 500, maxDelayMs = 5000 } = {}) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff with jitter
      const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
      const jitter = Math.random() * baseDelayMs;
      const delay = Math.min(exponentialDelay + jitter, maxDelayMs);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};
