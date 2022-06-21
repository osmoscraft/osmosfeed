/**
 * Cast any object error to Error
 */
export function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error("Unknown error");
}

/**
 * Ensure a value is defined and it's not Error
 */
export function isValid<T>(maybeError?: T | Error): maybeError is T {
  return !!maybeError && !(maybeError instanceof Error);
}

/**
 * Creates a Higher-order function that catches error from inner function
 * transforms it with the provided function, and returns the transformed value
 */
export function withCatch<ArgsType extends any[], ReturnType, ErrorReturnType>(
  fn: (...args: ArgsType) => ReturnType | Promise<ReturnType>,
  onCatch: (e: unknown) => ErrorReturnType | Promise<ErrorReturnType>
) {
  return async function (...args: ArgsType) {
    try {
      return await fn(...args);
    } catch (e) {
      return await onCatch(e);
    }
  };
}
