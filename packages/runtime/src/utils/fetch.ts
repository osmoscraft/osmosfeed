import { withAsyncRetry, type RetryConfig } from "./retry";

export interface RequestConfig {
  /**
   * Timeout for each fetch attempt, in ms.
   * @default 30000
   */
  timeout?: number;
  /**
   * Total number of retries after 1st error. Cannot be negative.
   * @default 3
   */
  retry?: number;
  /**
   * Delay before each retry, in ms.
   * @default 0
   */
  retryDelay?: number;
  onWillRetry?: (url: string, error: unknown, attemptsleft: number) => any;
}
export function getSmartFetch(config?: RequestConfig) {
  const retryConfig: RetryConfig = {
    retry: config?.retry ?? 3,
    delay: config?.retryDelay ?? 0,
    onWillRetry: (args, error, left) => config?.onWillRetry?.(args[0] as string, error, left),
  };
  const timeout = config?.timeout ?? 30000;

  const timeoutFetch = withTimeout(fetch, timeout);

  const smartFetch = withAsyncRetry(
    (url: string, requestInit?: RequestInit) => timeoutFetch(url, { keepalive: true, ...requestInit }),
    retryConfig
  );

  return smartFetch;
}

function withTimeout(baseFetch: typeof fetch, timeout = Infinity) {
  return async (url: string, requestInit?: RequestInit) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await baseFetch(url, {
      ...requestInit,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  };
}