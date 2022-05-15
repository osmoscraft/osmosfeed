import { RetryConfig, withAsyncRetry } from "./retry";

export interface RequestConfig {
  /**
   * Total number of retries after 1st error. Cannot be negative.
   * @default 3
   */
  retry: number;
  /**
   * Delay before each retry, in ms.
   * @default 5000
   */
  retryDelay: number;
}
export function getSmartFetch(config: RequestConfig) {
  const retryConfig: RetryConfig = {
    retry: config.retry ?? 3,
    delay: config.retryDelay ?? 5000,
  };
  const smartFetch = withAsyncRetry(
    (url: string, requestInit?: RequestInit) => fetch(url, { keepalive: true, ...requestInit }),
    retryConfig
  );

  return smartFetch;
}
