export interface RetryConfig<ArgsType = any> {
  retry: number;
  delay: number;
  onWillRetry?: (args: ArgsType, error: unknown, attempsLeft: number) => any;
}
export function withAsyncRetry<ArgsType extends any[], ResolveType>(
  fn: (...args: ArgsType) => Promise<ResolveType>,
  { retry, delay, onWillRetry }: RetryConfig<ArgsType>
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

        onWillRetry?.(args, error, attempsLeft);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };
}
