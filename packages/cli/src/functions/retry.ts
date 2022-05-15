export interface RetryConfig {
  retry: number;
  delay: number;
  onWillRetry?: (error: unknown, attempsLeft: number) => any;
}
export function withAsyncRetry<ArgsType extends any[], ResolveType>(
  fn: (...args: ArgsType) => Promise<ResolveType>,
  { retry, delay, onWillRetry }: RetryConfig
) {
  return async (...args: ArgsType) => {
    if (retry < 0) throw new Error(`Invalid retry limit: ${retry}`);

    let attempsLeft = retry + 1;

    while (true) {
      try {
        const result = await fn(...args);
        return result;
      } catch (error) {
        attempsLeft--;
        if (attempsLeft === 0) throw error;

        onWillRetry?.(error, attempsLeft);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };
}
