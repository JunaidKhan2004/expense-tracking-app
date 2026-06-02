const RETRYABLE_CODES = new Set([408, 429, 500, 502, 503, 504]);

function isRetryable(error: any): boolean {
  if (!error) return false;
  const status = error?.status ?? error?.code;
  if (typeof status === 'number' && RETRYABLE_CODES.has(status)) return true;
  const msg: string = (error?.message ?? '').toLowerCase();
  return msg.includes('network') || msg.includes('timeout') || msg.includes('fetch');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries an async operation with exponential backoff.
 * Only retries on transient network/server errors (5xx, 429, timeouts).
 * Application-level errors (auth failures, validation) are thrown immediately.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 300
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;

      const isLast = attempt === maxAttempts;
      if (isLast || !isRetryable(err)) throw err;

      const backoff = baseDelayMs * 2 ** (attempt - 1);
      const jitter = Math.random() * baseDelayMs;
      await delay(backoff + jitter);
    }
  }

  throw lastError;
}
